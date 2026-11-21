import {
  DEFAULT_SHOP_SETTINGS, SAMPLE_BILL, DEFAULT_TEAM_MEMBERS,
  DEFAULT_CUSTOMERS, DEFAULT_EXPENSES
} from '../constants/defaultData';
import { supabase } from './supabaseClient';

const BILLS_KEY = 'mr_dodo_bills_v2';
const SETTINGS_KEY = 'mr_dodo_settings_v2';
const CUSTOMERS_KEY = 'mr_dodo_customers_v2';
const EXPENSES_KEY = 'mr_dodo_expenses_v2';
const TEAM_KEY = 'mr_dodo_team_v2';
const SERVICE_JOBS_KEY = 'mr_dodo_service_jobs_v1';
const AUTH_KEY = 'mr_dodo_auth_v1';
const THEME_KEY = 'mr_dodo_theme_v1';

// --- CLOUD SYNC & REALTIME ENGINE (Supabase) ---
function cloudUpsert(table, id, data) {
  try {
    if (!supabase || !id) return;
    supabase
      .from(table)
      .upsert({ id: String(id), data: data, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.warn(`[Cloud Sync] Upsert warning for ${table}/${id}:`, error.message);
      })
      .catch(err => {
        console.warn(`[Cloud Sync] Network offline for ${table}/${id}`, err.message);
      });
  } catch (err) {
    console.warn(`[Cloud Sync] Offline fallback active`, err);
  }
}

function cloudDelete(table, id) {
  try {
    if (!supabase || !id) return;
    supabase
      .from(table)
      .delete()
      .eq('id', String(id))
      .then(({ error }) => {
        if (error) console.warn(`[Cloud Sync] Delete warning for ${table}/${id}:`, error.message);
      })
      .catch(err => {
        console.warn(`[Cloud Sync] Network offline delete for ${table}/${id}`, err.message);
      });
  } catch (err) {
    console.warn(`[Cloud Sync] Offline fallback active`, err);
  }
}

let isRealtimeSubscribed = false;

export async function initCloudSync(onSyncCallback) {
  if (!supabase) return;

  try {
    // 1. Initial Pull from Cloud for all tables
    const [billsRes, jobsRes, custRes, expRes, settingsRes] = await Promise.allSettled([
      supabase.from('invoices').select('id, data, updated_at'),
      supabase.from('service_jobs').select('id, data, updated_at'),
      supabase.from('customers').select('id, data, updated_at'),
      supabase.from('expenses').select('id, data, updated_at'),
      supabase.from('shop_settings').select('id, data, updated_at')
    ]);

    // Handle Invoices
    if (billsRes.status === 'fulfilled' && billsRes.value.data && billsRes.value.data.length > 0) {
      const cloudBills = billsRes.value.data.map(r => r.data).filter(Boolean);
      const localBills = getBills();
      const mergedMap = new Map();
      localBills.forEach(b => mergedMap.set(b.id, b));
      cloudBills.forEach(b => mergedMap.set(b.id, b));
      localStorage.setItem(BILLS_KEY, JSON.stringify(Array.from(mergedMap.values())));
    } else {
      const localBills = getBills();
      localBills.forEach(b => cloudUpsert('invoices', b.id, b));
    }

    // Handle Service Jobs
    if (jobsRes.status === 'fulfilled' && jobsRes.value.data && jobsRes.value.data.length > 0) {
      const cloudJobs = jobsRes.value.data.map(r => r.data).filter(Boolean);
      const localJobs = getServiceJobs();
      const mergedMap = new Map();
      localJobs.forEach(j => mergedMap.set(j.id, j));
      cloudJobs.forEach(j => mergedMap.set(j.id, j));
      localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(Array.from(mergedMap.values())));
    } else {
      const localJobs = getServiceJobs();
      localJobs.forEach(j => cloudUpsert('service_jobs', j.id, j));
    }

    // Handle Customers
    if (custRes.status === 'fulfilled' && custRes.value.data && custRes.value.data.length > 0) {
      const cloudCust = custRes.value.data.map(r => r.data).filter(Boolean);
      const localCust = getCustomers();
      const mergedMap = new Map();
      localCust.forEach(c => mergedMap.set(c.id, c));
      cloudCust.forEach(c => mergedMap.set(c.id, c));
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(Array.from(mergedMap.values())));
    } else {
      const localCust = getCustomers();
      localCust.forEach(c => cloudUpsert('customers', c.id, c));
    }

    // Handle Expenses
    if (expRes.status === 'fulfilled' && expRes.value.data && expRes.value.data.length > 0) {
      const cloudExp = expRes.value.data.map(r => r.data).filter(Boolean);
      const localExp = getExpenses();
      const mergedMap = new Map();
      localExp.forEach(e => mergedMap.set(e.id, e));
      cloudExp.forEach(e => mergedMap.set(e.id, e));
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(Array.from(mergedMap.values())));
    } else {
      const localExp = getExpenses();
      localExp.forEach(e => cloudUpsert('expenses', e.id, e));
    }

    // Handle Settings & User Profiles
    if (settingsRes.status === 'fulfilled' && Array.isArray(settingsRes.value?.data)) {
      const defaultSettingsRow = settingsRes.value.data.find(r => r.id === 'default_settings');
      if (defaultSettingsRow?.data) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettingsRow.data));
      }
      const profilesRow = settingsRes.value.data.find(r => r.id === 'user_profiles');
      if (profilesRow?.data) {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profilesRow.data));
      }
    } else {
      const localSettings = getShopSettings();
      cloudUpsert('shop_settings', 'default_settings', localSettings);
    }

    if (typeof onSyncCallback === 'function') {
      onSyncCallback({ status: 'synced' });
    }
    window.dispatchEvent(new CustomEvent('mrdodo_cloud_sync', { detail: { action: 'initial_hydrate' } }));
  } catch (err) {
    console.warn('[Cloud Sync] Failed initial hydration, running local', err);
  }

  // 2. Real-Time Multi-Device Channel Subscription
  if (!isRealtimeSubscribed) {
    isRealtimeSubscribed = true;

    try {
      supabase
        .channel('mrdodo_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          handleRealtimeEvent(payload);
          if (typeof onSyncCallback === 'function') {
            onSyncCallback({ status: 'realtime_event', payload });
          }
          window.dispatchEvent(new CustomEvent('mrdodo_cloud_sync', { detail: payload }));
        })
        .subscribe((status) => {
          console.log('[Cloud Realtime] Subscription status:', status);
        });
    } catch (e) {
      console.warn('[Cloud Realtime] Could not subscribe', e);
    }
  }
}

function handleRealtimeEvent(payload) {
  const { table, eventType, new: newRow, old: oldRow } = payload;
  if (!table) return;

  if (table === 'invoices') {
    const bills = getBills();
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (newRow?.data) {
        const idx = bills.findIndex(b => b.id === newRow.data.id);
        let updated;
        if (idx >= 0) {
          updated = [...bills];
          updated[idx] = newRow.data;
        } else {
          updated = [newRow.data, ...bills];
        }
        localStorage.setItem(BILLS_KEY, JSON.stringify(updated));
      }
    } else if (eventType === 'DELETE') {
      if (oldRow?.id) {
        const filtered = bills.filter(b => b.id !== oldRow.id);
        localStorage.setItem(BILLS_KEY, JSON.stringify(filtered));
      }
    }
  } else if (table === 'service_jobs') {
    const jobs = getServiceJobs();
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (newRow?.data) {
        const idx = jobs.findIndex(j => j.id === newRow.data.id);
        let updated;
        if (idx >= 0) {
          updated = [...jobs];
          updated[idx] = newRow.data;
        } else {
          updated = [newRow.data, ...jobs];
        }
        localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(updated));
      }
    } else if (eventType === 'DELETE') {
      if (oldRow?.id) {
        const filtered = jobs.filter(j => j.id !== oldRow.id);
        localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(filtered));
      }
    }
  } else if (table === 'customers') {
    const custs = getCustomers();
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (newRow?.data) {
        const idx = custs.findIndex(c => c.id === newRow.data.id);
        let updated;
        if (idx >= 0) {
          updated = [...custs];
          updated[idx] = newRow.data;
        } else {
          updated = [newRow.data, ...custs];
        }
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
      }
    } else if (eventType === 'DELETE') {
      if (oldRow?.id) {
        const filtered = custs.filter(c => c.id !== oldRow.id);
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
      }
    }
  } else if (table === 'expenses') {
    const exps = getExpenses();
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (newRow?.data) {
        const idx = exps.findIndex(e => e.id === newRow.data.id);
        let updated;
        if (idx >= 0) {
          updated = [...exps];
          updated[idx] = newRow.data;
        } else {
          updated = [newRow.data, ...exps];
        }
        localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
      }
    } else if (eventType === 'DELETE') {
      if (oldRow?.id) {
        const filtered = exps.filter(e => e.id !== oldRow.id);
        localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
      }
    }
  } else if (table === 'shop_settings') {
    if (newRow?.data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newRow.data));
    }
  }
}

export const SYSTEM_USERS = [
  {
    id: 'christo',
    username: 'Christo Riju',
    password: 'christo@mrdodo',
    name: 'Christo Riju',
    role: 'Owner / Director',
    phone: '9947885856',
    avatar: null,
    isOwner: true,
    isGuest: false
  },
  {
    id: 'jickson',
    username: 'Jickson John',
    password: 'jickson@mrdodo',
    name: 'Jickson John',
    role: 'Owner / Director',
    phone: '8138037450',
    avatar: null,
    isOwner: true,
    isGuest: false
  },
  {
    id: 'evan',
    username: 'Evan Punnen Jacob',
    password: 'evan@mrdodo',
    name: 'Evan Punnen Jacob',
    role: 'Owner / Director',
    phone: '9495365617',
    avatar: null,
    isOwner: true,
    isGuest: false
  },
  {
    id: 'sani',
    username: 'Sani',
    password: 'sani@mrdodo',
    name: 'Sani',
    role: 'Owner / Executive',
    phone: '9947885856',
    avatar: null,
    isOwner: true,
    isGuest: false
  },
  {
    id: 'manager',
    username: 'Manager',
    password: 'manager@mrdodo',
    name: 'Mr. DODO Manager',
    role: 'Operations Manager',
    phone: '8138037450',
    avatar: null,
    isOwner: false,
    isGuest: false
  },
  {
    id: 'guest',
    username: 'Guest',
    password: 'guest@mrdodo',
    name: 'Guest Viewer',
    role: 'Guest (View Only)',
    phone: '',
    avatar: null,
    isOwner: false,
    isGuest: true
  },
  {
    id: 'mrdodo',
    username: 'Mrdodo',
    password: 'dodo@123',
    name: 'Mr. DODO Administrator',
    role: 'Administrator / Owner',
    phone: '8138037450',
    avatar: null,
    isOwner: true,
    isGuest: false
  }
];

const PROFILES_KEY = 'mr_dodo_user_profiles_v1';

export function getUserProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const custom = raw ? JSON.parse(raw) : {};
    return SYSTEM_USERS.map(u => ({
      ...u,
      ...(custom[u.id] || {})
    }));
  } catch {
    return SYSTEM_USERS;
  }
}

export function saveUserProfile(userId, updates) {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const custom = raw ? JSON.parse(raw) : {};
    custom[userId] = {
      ...(custom[userId] || {}),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(custom));

    // Update active session if it matches
    const currentAuth = getAuthUser();
    if (currentAuth && (currentAuth.id === userId || currentAuth.username?.toLowerCase() === userId?.toLowerCase())) {
      const updatedAuth = { ...currentAuth, ...updates };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth));
    }

    // Sync profiles to cloud shop_settings
    cloudUpsert('shop_settings', 'user_profiles', custom);
    window.dispatchEvent(new CustomEvent('mrdodo_profile_updated', { detail: { userId, updates } }));
    return custom[userId];
  } catch (err) {
    console.error('Failed to save profile', err);
    throw err;
  }
}

// 1. AUTHENTICATION (6 Role-Based Accounts + Legacy)
export function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loginUser(userId, password) {
  const cleanInput = (userId || '').trim().toLowerCase().replace(/\s+/g, '');
  const cleanPwd = (password || '').trim();

  const allUsers = getUserProfiles();
  const matchedUser = allUsers.find(u => {
    const uId = (u.id || '').toLowerCase().replace(/\s+/g, '');
    const uName = (u.name || '').toLowerCase().replace(/\s+/g, '');
    const uUser = (u.username || '').toLowerCase().replace(/\s+/g, '');
    return (uId === cleanInput || uName === cleanInput || uUser === cleanInput);
  });

  if (matchedUser && matchedUser.password === cleanPwd) {
    const session = {
      ...matchedUser,
      userId: matchedUser.username,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  return {
    success: false,
    error: 'Invalid User ID or Password. (Check spelling or select quick-fill)'
  };
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function getMonthlyFinancialSummary(bills = [], expenses = [], targetMonth = null) {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthKey = targetMonth === 'all' ? null : (targetMonth || currentMonthKey);

  const filteredBills = monthKey
    ? bills.filter(b => (b.date || '').startsWith(monthKey))
    : bills;

  const filteredExpenses = monthKey
    ? expenses.filter(e => (e.date || '').startsWith(monthKey))
    : expenses;

  const totalIncome = filteredBills.reduce((sum, b) => {
    const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return sum + (sub - (Number(b.discount) || 0));
  }, 0);

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  const categoryMap = {};
  filteredExpenses.forEach(exp => {
    const cat = exp.category || 'Miscellaneous';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(exp.amount) || 0);
  });

  return {
    monthKey,
    billCount: filteredBills.length,
    expenseCount: filteredExpenses.length,
    totalIncome,
    totalExpense,
    netProfit,
    profitMargin,
    categoryMap
  };
}

// 2. THEME (Dark / Light)
export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// 3. BILLS STORAGE
export function getBills() {
  try {
    const raw = localStorage.getItem(BILLS_KEY);
    if (!raw) {
      const initialBills = [SAMPLE_BILL];
      localStorage.setItem(BILLS_KEY, JSON.stringify(initialBills));
      return initialBills;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read bills from localStorage', err);
    return [];
  }
}

export function saveBill(bill) {
  try {
    const bills = getBills();
    const existingIndex = bills.findIndex(b => b.id === bill.id);
    let updatedBills;
    const now = new Date().toISOString();
    let savedBill;

    if (existingIndex >= 0) {
      savedBill = {
        ...bill,
        updatedAt: now
      };
      updatedBills = [...bills];
      updatedBills[existingIndex] = savedBill;
    } else {
      savedBill = {
        ...bill,
        id: bill.id || `bill-${Date.now()}`,
        createdAt: bill.createdAt || now,
        updatedAt: now
      };
      updatedBills = [savedBill, ...bills];
      incrementNextInvoiceNumber();
    }

    localStorage.setItem(BILLS_KEY, JSON.stringify(updatedBills));

    // Cloud Real-Time Auto-Sync
    cloudUpsert('invoices', savedBill.id, savedBill);

    // Also auto-sync/update customer profile
    if (savedBill.customerName || savedBill.vehicleNumber) {
      autoSyncCustomerFromBill(savedBill);
    }

    return savedBill;
  } catch (err) {
    console.error('Failed to save bill', err);
    throw err;
  }
}

export function deleteBill(billId) {
  try {
    const bills = getBills();
    const filtered = bills.filter(b => b.id !== billId);
    localStorage.setItem(BILLS_KEY, JSON.stringify(filtered));
    cloudDelete('invoices', billId);
    return true;
  } catch (err) {
    console.error('Failed to delete bill', err);
    return false;
  }
}

export function getBillById(billId) {
  const bills = getBills();
  return bills.find(b => b.id === billId) || null;
}

export function duplicateBill(billId) {
  const bill = getBillById(billId);
  if (!bill) return null;

  const settings = getShopSettings();
  const nextNum = settings.nextInvoiceNum || 1042;
  const newInvoiceNumber = `${settings.invoicePrefix || 'DODO-'}${nextNum}`;

  const duplicated = {
    ...bill,
    id: `bill-${Date.now()}`,
    invoiceNumber: newInvoiceNumber,
    date: new Date().toISOString().split('T')[0],
    displayDate: formatDisplayDate(new Date()),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveBill(duplicated);
  return duplicated;
}

// 4. MANAGERS (Derived from Team & Settings)
export function getManagers() {
  const team = getTeamMembers();
  const mgrs = team.filter(t => t.category === 'Manager' || t.category === 'Owner');
  return mgrs.length > 0 ? mgrs : team;
}

export function saveManagers(managers) {
  return managers;
}

export function getActiveManager() {
  try {
    const managers = getManagers();
    const activeId = localStorage.getItem('mr_dodo_active_mgr_v2');
    const found = managers.find(m => m.id === activeId);
    return found || managers[0] || { name: 'Mr. DODO Owner', role: 'Owner / Director' };
  } catch {
    return { name: 'Mr. DODO Owner', role: 'Owner / Director' };
  }
}

export function setActiveManager(managerId) {
  try {
    localStorage.setItem('mr_dodo_active_mgr_v2', managerId);
  } catch (err) {
    console.error(err);
  }
}

// 5. CUSTOMERS STORAGE
export function getCustomers() {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
      return DEFAULT_CUSTOMERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CUSTOMERS;
  } catch {
    return DEFAULT_CUSTOMERS;
  }
}

export function saveCustomer(customer) {
  try {
    const list = getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    let updated;
    let savedCust;
    if (idx >= 0) {
      savedCust = { ...customer, updatedAt: new Date().toISOString() };
      updated = [...list];
      updated[idx] = savedCust;
    } else {
      savedCust = {
        ...customer,
        id: customer.id || `cust-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      updated = [savedCust, ...list];
    }
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
    cloudUpsert('customers', savedCust.id, savedCust);
    return savedCust;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function deleteCustomer(custId) {
  try {
    const list = getCustomers();
    const filtered = list.filter(c => c.id !== custId);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
    cloudDelete('customers', custId);
    return true;
  } catch {
    return false;
  }
}

function autoSyncCustomerFromBill(bill) {
  try {
    const customers = getCustomers();
    const match = customers.find(c =>
      (bill.customerPhone && c.phone === bill.customerPhone) ||
      (bill.vehicleNumber && c.vehicleNumber && c.vehicleNumber.toLowerCase() === bill.vehicleNumber.toLowerCase())
    );

    const subtotal = (bill.items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const total = subtotal - (Number(bill.discount) || 0);
    const servicesStr = (bill.items || []).map(i => i.description).join(', ');

    if (match) {
      match.totalSpent = (Number(match.totalSpent) || 0) + total;
      match.visitsCount = (Number(match.visitsCount) || 1) + 1;
      match.lastService = servicesStr || match.lastService;
      match.lastServiceDate = bill.date || match.lastServiceDate;
      if (bill.vehicleNumber) match.vehicleNumber = bill.vehicleNumber;
      if (bill.vehicleMake) match.vehicleMake = bill.vehicleMake;
      saveCustomer(match);
    } else {
      saveCustomer({
        id: `cust-${Date.now()}`,
        name: bill.customerName || 'Valued Customer',
        titlePrefix: bill.titlePrefix || 'Mr:',
        phone: bill.customerPhone || '',
        location: 'Kottayam',
        vehicleNumber: bill.vehicleNumber || '',
        vehicleMake: bill.vehicleMake || '',
        lastService: servicesStr,
        lastServiceDate: bill.date || new Date().toISOString().split('T')[0],
        totalSpent: total,
        visitsCount: 1,
        warrantyActive: !!bill.warrantyNote,
        warrantyExpiry: '',
        notes: bill.warrantyNote || ''
      });
    }
  } catch (err) {
    console.error('Auto sync customer error', err);
  }
}

// 5. EXPENSES STORAGE
export function getExpenses() {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(DEFAULT_EXPENSES));
      return DEFAULT_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_EXPENSES;
  } catch {
    return DEFAULT_EXPENSES;
  }
}

export function saveExpense(expense) {
  try {
    const list = getExpenses();
    const idx = list.findIndex(e => e.id === expense.id);
    let updated;
    let savedExp;
    if (idx >= 0) {
      savedExp = { ...expense, updatedAt: new Date().toISOString() };
      updated = [...list];
      updated[idx] = savedExp;
    } else {
      savedExp = {
        ...expense,
        id: expense.id || `exp-${Date.now()}`,
        date: expense.date || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
      updated = [savedExp, ...list];
    }
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    cloudUpsert('expenses', savedExp.id, savedExp);
    return savedExp;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function deleteExpense(expId) {
  try {
    const list = getExpenses();
    const filtered = list.filter(e => e.id !== expId);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
    cloudDelete('expenses', expId);
    return true;
  } catch {
    return false;
  }
}

// 6. TEAM MEMBERS STORAGE (Owners & Workers)
export function getTeamMembers() {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (!raw) {
      localStorage.setItem(TEAM_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
      return DEFAULT_TEAM_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TEAM_MEMBERS;
  } catch {
    return DEFAULT_TEAM_MEMBERS;
  }
}

export function saveTeamMember(member) {
  try {
    const list = getTeamMembers();
    const idx = list.findIndex(m => m.id === member.id);
    let updated;
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = member;
    } else {
      updated = [{
        ...member,
        id: member.id || `team-${Date.now()}`,
        joinedDate: member.joinedDate || new Date().toISOString().split('T')[0]
      }, ...list];
    }
    localStorage.setItem(TEAM_KEY, JSON.stringify(updated));
    return member;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function deleteTeamMember(memberId) {
  try {
    const list = getTeamMembers();
    const filtered = list.filter(m => m.id !== memberId);
    localStorage.setItem(TEAM_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// 7. SHOP SETTINGS
export function getShopSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SHOP_SETTINGS));
      return DEFAULT_SHOP_SETTINGS;
    }
    return { ...DEFAULT_SHOP_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SHOP_SETTINGS;
  }
}

export function saveShopSettings(newSettings) {
  try {
    const current = getShopSettings();
    const merged = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    cloudUpsert('shop_settings', 'default_settings', merged);
    return merged;
  } catch (err) {
    console.error('Failed to save settings', err);
    throw err;
  }
}

function incrementNextInvoiceNumber() {
  try {
    const settings = getShopSettings();
    const next = (parseInt(settings.nextInvoiceNum, 10) || 1042) + 1;
    saveShopSettings({ ...settings, nextInvoiceNum: next });
  } catch (e) {
    // ignore
  }
}

export function formatDisplayDate(dateInput) {
  try {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateInput;
  }
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Groups bills chronologically into clear date buckets
 */
export function groupBillsByDate(billsList) {
  const groups = {};
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  billsList.forEach(bill => {
    const billDate = (bill.date || '').split('T')[0];
    let groupKey = billDate;
    let groupTitle = bill.displayDate || formatDisplayDate(billDate) || 'Undated';

    if (billDate === todayStr) {
      groupKey = '0_today';
      groupTitle = `Today (${bill.displayDate || formatDisplayDate(billDate)})`;
    } else if (billDate === yesterdayStr) {
      groupKey = '1_yesterday';
      groupTitle = `Yesterday (${bill.displayDate || formatDisplayDate(billDate)})`;
    }

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: groupKey,
        title: groupTitle,
        date: billDate,
        bills: []
      };
    }
    groups[groupKey].bills.push(bill);
  });

  return Object.values(groups).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function exportBackup() {
  const data = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    settings: getShopSettings(),
    team: getTeamMembers(),
    customers: getCustomers(),
    expenses: getExpenses(),
    bills: getBills()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mr_DODO_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.bills && Array.isArray(data.bills)) {
      localStorage.setItem(BILLS_KEY, JSON.stringify(data.bills));
    }
    if (data.settings && typeof data.settings === 'object') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    }
    if (data.team && Array.isArray(data.team)) {
      localStorage.setItem(TEAM_KEY, JSON.stringify(data.team));
    }
    if (data.customers && Array.isArray(data.customers)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(data.customers));
    }
    if (data.expenses && Array.isArray(data.expenses)) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(data.expenses));
    }
    if (data.serviceJobs && Array.isArray(data.serviceJobs)) {
      localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(data.serviceJobs));
    }
    return { success: true, count: data.bills ? data.bills.length : 0 };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 7. SERVICE STAGES & LIVE VEHICLE STATUS TRACKER
export const WASH_STAGES = [
  { id: 'received', label: 'Car Received & Intake', short: 'Received', color: 'bg-blue-500' },
  { id: 'washing', label: 'Taken for Foam Wash & Underbody', short: 'In Wash Bay', color: 'bg-cyan-500' },
  { id: 'interior', label: 'Interior Vacuum & Steam Clean', short: 'Interior Clean', color: 'bg-indigo-500' },
  { id: 'finishing', label: 'Wiping & Tyre Dressing', short: 'Finishing', color: 'bg-amber-500' },
  { id: 'ready', label: 'Finished & Ready for Delivery', short: 'Ready', color: 'bg-emerald-500' }
];

export const COATING_STAGES = [
  { id: 'received', label: 'Vehicle Received & Decontaminated', short: 'Received', color: 'bg-blue-500' },
  { id: 'correction', label: 'Paint Correction & Compounding', short: 'Paint Polish', color: 'bg-amber-500' },
  { id: 'application', label: 'Coating Applied in Dust-Free Bay', short: 'Coating Bay', color: 'bg-purple-500' },
  { id: 'curing', label: 'Infrared Curing & Gloss Inspection', short: 'Curing', color: 'bg-cyan-500' },
  { id: 'ready', label: 'Coating Finished & Ready for Delivery', short: 'Ready', color: 'bg-emerald-500' }
];

export const DEFAULT_SERVICE_JOBS = [
  {
    id: 'job-1',
    customerName: 'Evan Punnen Jacob',
    titlePrefix: 'Mr:',
    customerPhone: '09495365617',
    vehicleNumber: 'KL05AZ4249',
    vehicleMake: 'Hyundai Creta',
    serviceType: 'Premium Foam Wash & Steam Clean',
    serviceCategory: 'wash',
    currentStageIndex: 1, // Taken for Foam Wash
    estimatedTime: 'Today 6:30 PM',
    assignedTechnician: 'Car Wash Lead',
    notes: 'Underbody pressure wash and interior deep clean',
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'job-2',
    customerName: 'Rev Fr. A V Varghese',
    titlePrefix: 'Rev Fr:',
    customerPhone: '9061367927',
    vehicleNumber: 'KL 05 BE 6091',
    vehicleMake: 'Toyota Hyrider',
    serviceType: 'Borophine 9H Ceramic Coating (3 Year)',
    serviceCategory: 'coating',
    currentStageIndex: 2, // Coating Application
    estimatedTime: 'Tomorrow 11:00 AM',
    assignedTechnician: 'Detailing Specialist',
    notes: '3-year warranty recoating & Sun film inspection',
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function getServiceJobs() {
  try {
    const raw = localStorage.getItem(SERVICE_JOBS_KEY);
    if (!raw) {
      localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(DEFAULT_SERVICE_JOBS));
      return DEFAULT_SERVICE_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SERVICE_JOBS;
  }
}

export function saveServiceJob(job) {
  const jobs = getServiceJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  let updated;
  let savedJob;
  if (index >= 0) {
    savedJob = { ...job, updatedAt: new Date().toISOString() };
    updated = [...jobs];
    updated[index] = savedJob;
  } else {
    savedJob = { ...job, id: job.id || `job-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    updated = [savedJob, ...jobs];
  }
  localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(updated));
  cloudUpsert('service_jobs', savedJob.id, savedJob);
  return updated;
}

export function deleteServiceJob(jobId) {
  const jobs = getServiceJobs();
  const updated = jobs.filter(j => j.id !== jobId);
  localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(updated));
  cloudDelete('service_jobs', jobId);
  return updated;
}

export function updateServiceJobStage(jobId, newStageIndex, note = '') {
  const jobs = getServiceJobs();
  let updatedJob = null;
  const updated = jobs.map(job => {
    if (job.id === jobId) {
      updatedJob = {
        ...job,
        currentStageIndex: newStageIndex,
        notes: note || job.notes,
        updatedAt: new Date().toISOString()
      };
      return updatedJob;
    }
    return job;
  });
  localStorage.setItem(SERVICE_JOBS_KEY, JSON.stringify(updated));
  if (updatedJob) {
    cloudUpsert('service_jobs', jobId, updatedJob);
  }
  return updated;
}

export function getServiceUpdateMessage(job, stageIndex, settings) {
  const isCoating = (job.serviceCategory || '').toLowerCase() === 'coating' || 
    (job.serviceType || '').toLowerCase().includes('coating') || 
    (job.serviceType || '').toLowerCase().includes('ppf');
  
  const stages = isCoating ? COATING_STAGES : WASH_STAGES;
  const currentStage = stages[stageIndex] || stages[0];
  const isFinished = stageIndex === stages.length - 1;

  const customerName = `${job.titlePrefix || 'Mr:'} ${job.customerName || 'Valued Customer'}`.trim();
  const shopName = settings?.shopName || 'Mr. DODO';
  const shopSubtitle = settings?.shopSubtitle || 'PREMIUM DETAILING & CAR WASH';
  const phones = settings?.phones || '8138037450, 9947885856';
  const address = settings?.address || 'Manarcad - Thiruvanchoor Bypass Road, Kottayam';

  if (isFinished) {
    return `*${shopName}* - ${shopSubtitle}
🎉 *YOUR CAR IS READY FOR DELIVERY!* 🎉

Dear *${customerName}*,
The service (*${job.serviceType || 'Service'}*) for your vehicle *${job.vehicleMake || 'Car'}* (*${job.vehicleNumber || ''}*) has been *COMPLETED*!

✨ Sparkling clean, inspected, and ready for you to pick up.
📍 *Studio:* ${address}
📞 *Helpdesk:* ${phones}

Thank you for trusting *${shopName}*! 🚗💨`;
  }

  return `*${shopName}* - ${shopSubtitle}
🚗 *LIVE VEHICLE SERVICE UPDATE* 🚗

Dear *${customerName}*,
Your vehicle *${job.vehicleMake || 'Car'}* (*${job.vehicleNumber || ''}*) status update:

📍 *Current Status:* *${currentStage.label}*
⏰ *Estimated Completion:* ${job.estimatedTime || 'Shortly'}
${job.assignedTechnician ? `👨‍💼 *Lead Specialist:* ${job.assignedTechnician}\n` : ''}${job.notes ? `📝 *Note:* ${job.notes}\n` : ''}
Our team is handling your vehicle with utmost care. We will notify you once it's finished!
📞 *Call Desk:* ${phones}`;
}
