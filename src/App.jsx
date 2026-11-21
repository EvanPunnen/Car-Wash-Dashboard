import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText, PenTool, Clock, Settings as SettingsIcon,
  Download, Printer, Share2, ZoomIn, ZoomOut, Maximize2,
  Sparkles, CheckCircle, ChevronLeft, Car, RefreshCw,
  UserCheck, Cloud, HardDrive, Columns, LayoutGrid,
  Sun, Moon, Users, ShieldCheck, DollarSign, LogOut,
  BarChart3, Menu, X, Smartphone, QrCode, Eye, Droplets
} from 'lucide-react';

import InvoiceSheet from './components/InvoiceSheet';
import BillForm from './components/BillForm';
import BillHistory from './components/BillHistory';
import SettingsModal from './components/SettingsModal';
import ManagerModal from './components/ManagerModal';
import GoogleDriveModal from './components/GoogleDriveModal';
import AddToMobileModal from './components/AddToMobileModal';

import LoginPage from './components/LoginPage';
import DashboardView from './components/DashboardView';
import CoatingsTrackerView from './components/CoatingsTrackerView';
import CustomersView from './components/CustomersView';
import ExpensesView from './components/ExpensesView';
import TeamView from './components/TeamView';
import GoogleDriveView from './components/GoogleDriveView';
import ServiceUpdatesView from './components/ServiceUpdatesView';

import {
  getBills, saveBill, deleteBill, duplicateBill,
  getShopSettings, saveShopSettings, formatDisplayDate,
  getManagers, saveManagers, getActiveManager, setActiveManager,
  getAuthUser, logoutUser, getStoredTheme, setStoredTheme,
  getCustomers, saveCustomer, deleteCustomer,
  getExpenses, saveExpense, deleteExpense,
  getTeamMembers, saveTeamMember, deleteTeamMember,
  getServiceJobs, saveServiceJob, initCloudSync
} from './utils/storage';
import {
  downloadInvoicePDF, printInvoice, shareInvoiceWhatsApp, shareInvoicePDF,
  saveToFileManager, openGoogleDrive, getVehicleFileName
} from './utils/pdfGenerator';
import { SAMPLE_BILL } from './constants/defaultData';
import {
  LOGO_ICON_BASE64,
  LOGO_TEXT_BASE64,
  LOGO_ICON_WHITE_BASE64,
  LOGO_TEXT_WHITE_BASE64
} from './assets/logoData';

export default function App() {
  // 1. Authentication State
  const [authUser, setAuthUser] = useState(getAuthUser());

  // 2. Theme State (Dark / Light)
  const [theme, setTheme] = useState(getStoredTheme());

  // 3. Navigation tabs: 'dashboard' | 'form' | 'preview' | 'coatings' | 'customers' | 'expenses' | 'team' | 'drive' | 'history'
  const [activeTab, setActiveTab] = useState('form');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Desktop Split Screen mode (Form on Left, Live A4 on Right)
  const [isSplitView, setIsSplitView] = useState(false);

  // App data state
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [serviceJobs, setServiceJobs] = useState([]);
  const [currentBill, setCurrentBill] = useState(SAMPLE_BILL);
  const [settings, setSettings] = useState(getShopSettings());
  const [managers, setManagers] = useState(getManagers());
  const [activeManager, setActiveManagerUser] = useState(getActiveManager());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mobile A4 Preview zoom state
  const [zoomScale, setZoomScale] = useState(0.48);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const previewContainerRef = useRef(null);

  // Online / Offline state listener for true zero-internet / zero-laptop independence
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Online · Connected');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚡ Offline Mode · Running locally on phone storage');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for PWA beforeinstallprompt on Android/Chrome
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Mr. DODO added to home screen!');
      }
      setDeferredInstallPrompt(null);
    } else {
      setIsMobileModalOpen(true);
    }
  };

  // Apply theme class on mount & changes
  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
  };

  // Initialize state from storage & Realtime Cloud Sync on mount
  useEffect(() => {
    const refreshAllState = () => {
      const loadedBills = getBills();
      setBills(loadedBills);
      setCustomers(getCustomers());
      setExpenses(getExpenses());
      setTeamMembers(getTeamMembers());
      setServiceJobs(getServiceJobs());
      setManagers(getManagers());
      setActiveManagerUser(getActiveManager());
      setSettings(getShopSettings());
    };

    refreshAllState();

    const loadedBills = getBills();
    if (loadedBills.length > 0) {
      setCurrentBill(loadedBills[0]);
    }

    if (window.innerWidth >= 1200) {
      setIsSplitView(true);
    }

    // Connect to Supabase Cloud Auto-Sync & Realtime
    initCloudSync(() => {
      refreshAllState();
    });

    const handleCloudEvent = () => {
      refreshAllState();
    };
    window.addEventListener('mrdodo_cloud_sync', handleCloudEvent);
    return () => window.removeEventListener('mrdodo_cloud_sync', handleCloudEvent);
  }, []);

  // Compute auto-fit scale for A4 sheet
  useEffect(() => {
    function computeFit() {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 32;
        const targetWidth = 794;
        const newScale = Math.min(1.0, Math.max(0.35, containerWidth / targetWidth));
        if (isAutoFit) {
          setZoomScale(newScale);
        }
      }
    }

    computeFit();
    window.addEventListener('resize', computeFit);
    return () => window.removeEventListener('resize', computeFit);
  }, [activeTab, isAutoFit, isSplitView]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // If not authenticated, show Login Screen (User: Mrdodo / pswd: dodo@123)
  if (!authUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setAuthUser(user);
          showToast(`Welcome back, ${user.userId}!`);
        }}
      />
    );
  }

  // Actions
  const handleSaveBill = () => {
    setIsSaving(true);
    try {
      const billToSave = {
        ...currentBill,
        managerName: currentBill.managerName || activeManager.name
      };
      saveBill(billToSave);
      setBills(getBills());
      setCustomers(getCustomers());
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      showToast(`Bill saved under ${currentBill.vehicleNumber || 'vehicle'}!`);
    } catch (err) {
      showToast('Failed to save bill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewBill = () => {
    const nextNum = settings.nextInvoiceNum || 1042;
    const newBill = {
      id: `bill-${Date.now()}`,
      invoiceNumber: `${settings.invoicePrefix || 'DODO-'}${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      displayDate: formatDisplayDate(new Date()),
      titlePrefix: 'Mr:',
      customerName: '',
      customerPhone: '',
      vehicleNumber: '',
      vehicleMake: '',
      items: [
        { id: `item-1`, description: '', amount: '' }
      ],
      discount: 0,
      warrantyNote: settings.defaultWarrantyNote || 'Borophine Wash Every 3months to avail warranty. 1 free recoating',
      paymentStatus: 'paid',
      paymentMode: 'UPI / GPay',
      managerName: activeManager.name
    };
    setCurrentBill(newBill);
    setActiveTab('form');
    showToast('New blank bill initialized');
  };

  const handleLoadSample = () => {
    setCurrentBill({ ...SAMPLE_BILL, id: `bill-${Date.now()}` });
    showToast('Sample bill loaded');
  };

  const handleEditBillFromHistory = (billToEdit) => {
    setCurrentBill(billToEdit);
    setActiveTab('form');
    showToast(`Loaded ${billToEdit.customerName || 'bill'} (${billToEdit.vehicleNumber}) for editing`);
  };

  const handleSelectBillForPreview = (billToPreview) => {
    setCurrentBill(billToPreview);
    setActiveTab('preview');
  };

  const handleDuplicateBill = (billId) => {
    const duplicated = duplicateBill(billId);
    if (duplicated) {
      setBills(getBills());
      setCurrentBill(duplicated);
      setActiveTab('form');
      showToast('Bill duplicated with new invoice number!');
    }
  };

  const handleDeleteBill = (billId) => {
    deleteBill(billId);
    const updated = getBills();
    setBills(updated);
    if (currentBill.id === billId) {
      setCurrentBill(updated[0] || SAMPLE_BILL);
    }
    showToast('Bill deleted');
  };

  const handleDownloadPDF = async (targetBill = currentBill) => {
    setIsDownloading(true);
    try {
      const fileName = getVehicleFileName(targetBill, 'pdf');
      showToast(`Generating ${fileName}...`);
      await downloadInvoicePDF('invoice-to-print', targetBill);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`Downloaded: ${fileName}`);
    } catch (err) {
      console.error(err);
      showToast('Could not generate PDF. Please try Print button.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToFileManager = async () => {
    setIsDownloading(true);
    try {
      const res = await saveToFileManager('invoice-to-print', currentBill);
      if (!res.canceled) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        showToast(`Saved ${res.fileName} to device files!`);
      }
    } catch (err) {
      showToast('Downloaded to device storage');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printInvoice();
  };

  const handleShareWhatsApp = async (targetBill = currentBill) => {
    try {
      showToast('Preparing PDF file to share...');
      await shareInvoicePDF('invoice-to-print-universal', targetBill, settings);
    } catch (err) {
      console.warn('Share file error, falling back to WhatsApp text', err);
      shareInvoiceWhatsApp(targetBill, settings);
    }
  };

  const handleCreateBillForCustomer = (cust) => {
    const nextNum = settings.nextInvoiceNum || 1042;
    const newBill = {
      id: `bill-${Date.now()}`,
      invoiceNumber: `${settings.invoicePrefix || 'DODO-'}${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      displayDate: formatDisplayDate(new Date()),
      titlePrefix: cust.titlePrefix || 'Mr:',
      customerName: cust.name || '',
      customerPhone: cust.phone || '',
      vehicleNumber: cust.vehicleNumber || '',
      vehicleMake: cust.vehicleMake || '',
      items: [
        { id: `item-1`, description: cust.lastService || 'Borophine Coating (3 year)', amount: '' }
      ],
      discount: 0,
      warrantyNote: cust.notes || settings.defaultWarrantyNote,
      paymentStatus: 'paid',
      paymentMode: 'UPI / GPay',
      managerName: activeManager.name
    };
    setCurrentBill(newBill);
    setActiveTab('form');
    showToast(`Initialized invoice for ${cust.name}`);
  };

  const handleGenerateBillFromJob = (job) => {
    const nextNum = settings.nextInvoiceNum || 1042;
    const isCoating = (job.serviceCategory || '').toLowerCase() === 'coating' ||
      (job.serviceType || '').toLowerCase().includes('coating') ||
      (job.serviceType || '').toLowerCase().includes('ppf');

    let defaultDesc = job.serviceType || (isCoating ? 'Borophine Coating (3 year)' : 'Premium Foam Wash & Steam Clean');
    let defaultAmount = '1,200.00';
    if (isCoating) {
      defaultAmount = '33,000.00';
    } else if ((job.serviceType || '').toLowerCase().includes('sun film')) {
      defaultAmount = '4,000.00';
    } else if ((job.serviceType || '').toLowerCase().includes('silencer')) {
      defaultAmount = '2,000.00';
    } else if ((job.serviceType || '').toLowerCase().includes('wash')) {
      defaultAmount = '1,200.00';
    }

    const newBill = {
      id: `bill-${Date.now()}`,
      invoiceNumber: `${settings.invoicePrefix || 'DODO-'}${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      displayDate: formatDisplayDate(new Date()),
      titlePrefix: job.titlePrefix || 'Mr:',
      customerName: job.customerName || '',
      customerPhone: job.customerPhone || '',
      vehicleNumber: job.vehicleNumber || '',
      vehicleMake: job.vehicleMake || '',
      items: [
        { id: `item-1`, description: defaultDesc, amount: defaultAmount }
      ],
      discount: 0,
      warrantyNote: job.notes || (isCoating ? (settings.defaultWarrantyNote || 'Borophine Wash Every 3months to avail warranty. 1 free recoating') : ''),
      paymentStatus: 'paid',
      paymentMode: 'UPI / GPay',
      managerName: activeManager.name
    };

    setCurrentBill(newBill);
    setActiveTab('form');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Bill generated for ${job.vehicleNumber} (${job.customerName})!`);
  };

  const handleLogout = () => {
    if (window.confirm('Sign out of Mr. DODO management session?')) {
      logoutUser();
      setAuthUser(null);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    } flex flex-col font-sans select-none antialiased`}>

      {/* 1. TOP APP BAR */}
      <header className={`sticky top-0 z-40 ${
        isDark ? 'bg-slate-900/95 border-slate-800/80' : 'bg-white/95 border-slate-200'
      } backdrop-blur-md border-b px-3 sm:px-4 py-2 safe-pt transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Brand Logo & Name (Enhanced Round Center Fit) */}
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${
              isDark ? 'bg-slate-950 border-slate-700/80 ring-2 ring-blue-500/20' : 'bg-white border-slate-300 ring-2 ring-slate-200'
            } border flex items-center justify-center p-1.5 shadow-md flex-shrink-0 overflow-hidden`}>
              <img
                src={isDark ? LOGO_ICON_WHITE_BASE64 : LOGO_ICON_BASE64}
                alt="Mr. DODO Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  Mr. DODO
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold uppercase hidden sm:inline-block">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight hidden md:block">
                {settings.shopSubtitle || "PREMIUM DETAILING & CAR WASH"}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'form', label: 'Billing', icon: PenTool },
              { id: 'preview', label: 'A4 Bill', icon: FileText },
              { id: 'updates', label: `Live Updates (${serviceJobs.length})`, icon: Droplets },
              { id: 'coatings', label: 'Coatings', icon: ShieldCheck },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'team', label: 'Team', icon: UserCheck },
              { id: 'drive', label: 'Google Drive', icon: Cloud },
              { id: 'history', label: `Bills (${bills.length})`, icon: Clock },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions: Theme Switcher, Add to Mobile, Manager, Settings, Logout */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* REALTIME CLOUD SYNC PILL */}
            <div 
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                isOnline 
                  ? 'bg-blue-950/40 border-blue-800/60 text-blue-300' 
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}
              title={isOnline ? "Connected to Supabase Realtime Cloud (Multi-Device Auto-Sync)" : "Offline Mode: Changes saved locally on device"}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="font-semibold">{isOnline ? 'Cloud Sync' : 'Offline'}</span>
            </div>

            {/* ADD TO MOBILE BUTTON (PWA, APK & QR Scan) */}
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 hover:border-blue-500/50 transition shadow-sm active:scale-95 flex-shrink-0"
              title="Add to Mobile (APK / PWA / QR Code)"
            >
              <Smartphone size={15} className="text-blue-400" />
              <span className="hidden sm:inline">Add to Mobile</span>
            </button>

            {/* DARK / LIGHT MODE SWITCH (User requested) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition flex-shrink-0 ${
                isDark
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Split Screen View Toggle (Desktop) */}
            <button
              onClick={() => setIsSplitView(v => !v)}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isSplitView
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                  : isDark
                  ? 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
              }`}
              title="Toggle Side-by-Side Split View"
            >
              <Columns size={14} />
              <span>Split</span>
            </button>

            {/* Manager Switcher Button */}
            <button
              onClick={() => setIsManagerModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}
              title="Switch Manager Profile"
            >
              <div className={`w-5 h-5 rounded-md ${activeManager?.avatarColor || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-[10px]`}>
                {(activeManager?.name || 'M').charAt(0)}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{activeManager?.name?.split(' ')[0]}</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl border transition ${
                isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Shop Settings"
            >
              <SettingsIcon size={17} />
            </button>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* OFFLINE STATUS BANNER (Guarantees zero lap or net dependency) */}
      {!isOnline && (
        <div className="bg-slate-900 border-b border-blue-500/30 px-3 py-1.5 text-center text-xs text-blue-300 font-semibold flex items-center justify-center gap-2 animate-fadeIn z-30">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Offline Mode · Running 100% locally on phone storage (No internet or laptop needed)</span>
        </div>
      )}

      {/* 2. TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-blue-500/40 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            bills={bills}
            expenses={expenses}
            customers={customers}
            serviceJobs={serviceJobs}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNewBill={handleNewBill}
          />
        )}

        {/* TAB: LIVE SERVICE UPDATES & VEHICLE STATUS TRACKER */}
        {activeTab === 'updates' && (
          <ServiceUpdatesView
            jobs={serviceJobs}
            onUpdateJobs={(updatedJobs) => {
              setServiceJobs(updatedJobs);
            }}
            settings={settings}
            customers={customers}
            onGenerateBillFromJob={handleGenerateBillFromJob}
            onShowToast={showToast}
          />
        )}

        {/* TAB: COATINGS TRACKER (Dedicated tab requested by user) */}
        {activeTab === 'coatings' && (
          <CoatingsTrackerView
            bills={bills}
            onSelectBillForPreview={handleSelectBillForPreview}
            settings={settings}
          />
        )}

        {/* TAB: CUSTOMERS CRM */}
        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            onSaveCustomer={(cust) => {
              saveCustomer(cust);
              setCustomers(getCustomers());
              showToast('Customer record updated');
            }}
            onDeleteCustomer={(id) => {
              deleteCustomer(id);
              setCustomers(getCustomers());
              showToast('Customer deleted');
            }}
            onCreateBillForCustomer={handleCreateBillForCustomer}
          />
        )}

        {/* TAB: EXPENSES */}
        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onSaveExpense={(exp) => {
              saveExpense(exp);
              setExpenses(getExpenses());
              showToast('Expense voucher recorded');
            }}
            onDeleteExpense={(id) => {
              deleteExpense(id);
              setExpenses(getExpenses());
              showToast('Expense deleted');
            }}
          />
        )}

        {/* TAB: TEAM & WORKERS CONTACTS */}
        {activeTab === 'team' && (
          <TeamView
            teamMembers={teamMembers}
            onSaveMember={(member) => {
              saveTeamMember(member);
              setTeamMembers(getTeamMembers());
              showToast('Team member profile saved');
            }}
            onDeleteMember={(id) => {
              deleteTeamMember(id);
              setTeamMembers(getTeamMembers());
              showToast('Team member removed');
            }}
          />
        )}

        {/* TAB: GOOGLE DRIVE ACCESS */}
        {activeTab === 'drive' && (
          <GoogleDriveView
            bills={bills}
            customers={customers}
            expenses={expenses}
            currentBill={currentBill}
            settings={settings}
          />
        )}

        {/* TAB: BILLING (With Desktop Split Screen support) */}
        {activeTab === 'form' && (
          isSplitView ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 6 columns: Form */}
              <div className="lg:col-span-6 overflow-y-auto">
                <BillForm
                  bill={currentBill}
                  onChange={setCurrentBill}
                  onSave={handleSaveBill}
                  onPreview={() => setActiveTab('preview')}
                  onNewBill={handleNewBill}
                  onLoadSample={handleLoadSample}
                  onDownloadPDF={() => handleDownloadPDF(currentBill)}
                  onShareWhatsApp={() => handleShareWhatsApp(currentBill)}
                  isSaving={isSaving}
                  activeManager={activeManager}
                  onOpenManagerModal={() => setIsManagerModalOpen(true)}
                />
              </div>

              {/* Right 6 columns: Live A4 Preview & Cloud Actions */}
              <div className="lg:col-span-6 sticky top-16 space-y-4">
                <div className={`p-3 rounded-2xl flex items-center justify-between gap-2 shadow-xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Live A4 Preview
                    </span>
                    <span className="text-xs text-blue-500 font-mono">
                      {currentBill.vehicleNumber || 'DODO'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadPDF(currentBill)}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-md"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Printer size={13} />
                    </button>
                    <button
                      onClick={() => handleShareWhatsApp(currentBill)}
                      className="px-2.5 py-1.5 rounded-xl bg-green-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Scaled A4 Sheet Container */}
                <div className="w-full overflow-hidden flex justify-center py-2 bg-slate-900/40 rounded-2xl border border-slate-800 shadow-inner">
                  <div
                    style={{
                      transform: 'scale(0.68)',
                      transformOrigin: 'top center',
                      marginBottom: 'calc((297mm * 0.68) - 297mm + 40px)'
                    }}
                    className="transition-transform duration-200"
                  >
                    <InvoiceSheet
                      bill={currentBill}
                      settings={settings}
                      id="invoice-to-print"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <BillForm
                bill={currentBill}
                onChange={setCurrentBill}
                onSave={handleSaveBill}
                onPreview={() => setActiveTab('preview')}
                onNewBill={handleNewBill}
                onLoadSample={handleLoadSample}
                onDownloadPDF={() => handleDownloadPDF(currentBill)}
                onShareWhatsApp={() => handleShareWhatsApp(currentBill)}
                isSaving={isSaving}
                activeManager={activeManager}
                onOpenManagerModal={() => setIsManagerModalOpen(true)}
              />
            </div>
          )
        )}

        {/* TAB: A4 PREVIEW FULLSCREEN */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-fadeIn max-w-3xl mx-auto">
            {/* Preview Toolbar */}
            <div className={`p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl sticky top-14 z-20 backdrop-blur-md border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('form')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <ChevronLeft size={14} /> Back to Edit
                </button>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {currentBill.vehicleNumber || 'Invoice Preview'}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setIsAutoFit(false);
                    setZoomScale(s => Math.max(0.3, s - 0.08));
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => {
                    setIsAutoFit(true);
                    if (previewContainerRef.current) {
                      const containerWidth = previewContainerRef.current.clientWidth - 32;
                      setZoomScale(Math.min(1.0, Math.max(0.35, containerWidth / 794)));
                    }
                  }}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition ${
                    isAutoFit ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fit to screen"
                >
                  Fit
                </button>
                <button
                  onClick={() => {
                    setIsAutoFit(false);
                    setZoomScale(1.0);
                  }}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition ${
                    !isAutoFit && Math.abs(zoomScale - 1.0) < 0.05
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="100% Original Size"
                >
                  100%
                </button>
                <button
                  onClick={() => {
                    setIsAutoFit(false);
                    setZoomScale(s => Math.min(1.5, s + 0.08));
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Main Actions: Download PDF, Print, Share */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleDownloadPDF(currentBill)}
                  disabled={isDownloading}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Download size={14} />
                  <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                  title="Print or Save as PDF"
                >
                  <Printer size={14} />
                </button>

                <button
                  onClick={() => handleShareWhatsApp(currentBill)}
                  className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-green-600/20"
                  title="Share invoice on WhatsApp"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            {/* A4 Sheet Viewport */}
            <div
              ref={previewContainerRef}
              className="w-full overflow-x-auto pb-6 flex justify-center py-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-inner"
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  marginBottom: `calc((297mm * ${zoomScale}) - 297mm + 40px)`
                }}
                className="transition-transform duration-200"
              >
                <InvoiceSheet
                  bill={currentBill}
                  settings={settings}
                  id="invoice-to-print"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="animate-fadeIn">
            <BillHistory
              bills={bills}
              onSelectBill={handleSelectBillForPreview}
              onEditBill={handleEditBillFromHistory}
              onDuplicateBill={handleDuplicateBill}
              onDeleteBill={handleDeleteBill}
              onDownloadPDF={handleDownloadPDF}
              onShareWhatsApp={handleShareWhatsApp}
              onNewBill={handleNewBill}
            />
          </div>
        )}
      </main>

      {/* 4. MOBILE BOTTOM NAVIGATION DOCK */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      } backdrop-blur-lg border-t px-2 py-1 safe-pb transition-colors`}>
        <div className="flex items-center justify-around text-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-1 transition ${
              activeTab === 'dashboard' ? 'text-blue-500 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 size={17} />
            <span className="text-[9px] mt-0.5">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center py-1 px-1 transition ${
              activeTab === 'form' ? 'text-blue-500 font-bold' : 'text-slate-400'
            }`}
          >
            <PenTool size={17} />
            <span className="text-[9px] mt-0.5">Billing</span>
          </button>

          {/* CENTER FAB: Dynamic Action (View A4 when in form; Download PDF when in preview) */}
          <button
            onClick={() => {
              if (activeTab === 'preview') {
                handleDownloadPDF(currentBill);
              } else {
                setActiveTab('preview');
              }
            }}
            disabled={isDownloading}
            className={`flex flex-col items-center justify-center -mt-4 w-12 h-12 rounded-full shadow-lg border border-slate-700/80 active:scale-95 transition ${
              activeTab === 'preview'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 ring-2 ring-emerald-500/30'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-950/60 ring-2 ring-blue-500/30'
            }`}
            title={activeTab === 'preview' ? "Download PDF Invoice" : "View Live A4 Invoice"}
          >
            {activeTab === 'preview' ? <Download size={20} /> : <Eye size={20} />}
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`flex flex-col items-center py-1 px-1 transition relative ${
              activeTab === 'updates' ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets size={17} />
            <span className="text-[9px] mt-0.5">Updates</span>
            {serviceJobs.length > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('coatings')}
            className={`flex flex-col items-center py-1 px-1 transition ${
              activeTab === 'coatings' ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={17} />
            <span className="text-[9px] mt-0.5">Coating</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex flex-col items-center py-1 px-1 transition ${
              activeTab === 'customers' ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={17} />
            <span className="text-[9px] mt-0.5">Clients</span>
          </button>
        </div>
      </nav>

      {/* 5. MODALS */}
      <ManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        managers={managers}
        activeManager={activeManager}
        onSelectManager={(mgr) => {
          setActiveManager(mgr.id);
          setActiveManagerUser(mgr);
          showToast(`Active Manager set to ${mgr.name}`);
        }}
        onSaveManagers={(mgrs) => {
          saveManagers(mgrs);
          setManagers(mgrs);
        }}
        bills={bills}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        currentBill={currentBill}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(st) => {
          const saved = saveShopSettings(st);
          setSettings(saved);
          showToast('Shop details updated');
        }}
        onReloadAll={() => {
          setBills(getBills());
          setSettings(getShopSettings());
          setCustomers(getCustomers());
          setExpenses(getExpenses());
          setTeamMembers(getTeamMembers());
          setServiceJobs(getServiceJobs());
          showToast('Data refreshed');
        }}
      />

      {/* ADD TO MOBILE MODAL */}
      <AddToMobileModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        installPrompt={deferredInstallPrompt}
        onInstallApp={handleInstallApp}
      />

      {/* PERMANENT HIDDEN INVOICE SOURCE FOR 100% RELIABLE INSTANT PDF GENERATION FROM ANY TAB */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '794px',
          height: '1123px',
          maxHeight: '1123px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          zIndex: -9999,
          pointerEvents: 'none',
          visibility: 'visible',
          opacity: 1
        }}
        aria-hidden="true"
      >
        <InvoiceSheet
          bill={currentBill}
          settings={settings}
          id="invoice-to-print-universal"
        />
      </div>
    </div>
  );
}
