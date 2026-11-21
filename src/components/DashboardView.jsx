import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Car, Sparkles,
  ShieldCheck, Droplets, Calendar, ArrowRight,
  FileText, Plus, Eye, CheckCircle2, ChevronRight,
  Clock, ArrowUpRight, Filter
} from 'lucide-react';
import { formatCurrency, formatDisplayDate, getMonthlyFinancialSummary } from '../utils/storage';
import { LOGO_ICON_BASE64 } from '../assets/logoData';

export default function DashboardView({
  bills = [],
  expenses = [],
  customers = [],
  serviceJobs = [],
  isGuest = false,
  isOnline = true,
  onNavigateTab,
  onNewBill
}) {
  const now = new Date();
  const todayDefaultStr = now.toISOString().split('T')[0];
  const currentMonthDefaultStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Dashboard View Mode: 'daily' | 'monthly' | 'all'
  const [viewMode, setViewMode] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(todayDefaultStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthDefaultStr);

  // 1. DAILY CALCULATIONS (For selectedDate)
  const dailyBills = useMemo(() => {
    return bills.filter(b => (b.date || '').split('T')[0] === selectedDate);
  }, [bills, selectedDate]);

  const dailySales = useMemo(() => {
    return dailyBills.reduce((sum, b) => {
      const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      return sum + (sub - (Number(b.discount) || 0));
    }, 0);
  }, [dailyBills]);

  const dailyExpensesList = useMemo(() => {
    return expenses.filter(e => (e.date || '').split('T')[0] === selectedDate);
  }, [expenses, selectedDate]);

  const dailyExpensesTotal = useMemo(() => {
    return dailyExpensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [dailyExpensesList]);

  const dailyNetProfit = dailySales - dailyExpensesTotal;

  // 2. MONTHLY CALCULATIONS (For selectedMonth)
  const monthlySummary = useMemo(() => {
    return getMonthlyFinancialSummary(bills, expenses, selectedMonth);
  }, [bills, expenses, selectedMonth]);

  // Group monthly bills by day for daily breakdown
  const monthlyDaysBreakdown = useMemo(() => {
    const map = {};
    const monthBills = bills.filter(b => (b.date || '').startsWith(selectedMonth));
    const monthExpenses = expenses.filter(e => (e.date || '').startsWith(selectedMonth));

    monthBills.forEach(b => {
      const d = (b.date || '').split('T')[0];
      if (!map[d]) map[d] = { date: d, count: 0, sales: 0, expenses: 0 };
      const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      map[d].sales += (sub - (Number(b.discount) || 0));
      map[d].count += 1;
    });

    monthExpenses.forEach(e => {
      const d = (e.date || '').split('T')[0];
      if (!map[d]) map[d] = { date: d, count: 0, sales: 0, expenses: 0 };
      map[d].expenses += (Number(e.amount) || 0);
    });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [bills, expenses, selectedMonth]);

  // 3. ALL TIME CALCULATIONS
  const totalSales = useMemo(() => {
    return bills.reduce((sum, b) => {
      const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      return sum + (sub - (Number(b.discount) || 0));
    }, 0);
  }, [bills]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const allTimeNetProfit = totalSales - totalExpenses;

  // 4. Service Breakdown Counts
  const serviceStats = useMemo(() => {
    const stats = { coatings: 0, sunfilm: 0, silencerUnderbody: 0, washes: 0 };
    bills.forEach(bill => {
      (bill.items || []).forEach(item => {
        const desc = (item.description || '').toLowerCase();
        if (desc.includes('coating') || desc.includes('borophine') || desc.includes('ceramic') || desc.includes('ppf')) {
          stats.coatings++;
        } else if (desc.includes('film') || desc.includes('tint') || desc.includes('glass')) {
          stats.sunfilm++;
        } else if (desc.includes('silencer') || desc.includes('underbody') || desc.includes('rust')) {
          stats.silencerUnderbody++;
        } else if (desc.includes('wash') || desc.includes('clean') || desc.includes('foam')) {
          stats.washes++;
        }
      });
    });
    return stats;
  }, [bills]);

  // Distinct available months for dropdown
  const availableMonths = useMemo(() => {
    const set = new Set();
    set.add(currentMonthDefaultStr);
    bills.forEach(b => {
      if (b.date && b.date.length >= 7) set.add(b.date.substring(0, 7));
    });
    expenses.forEach(e => {
      if (e.date && e.date.length >= 7) set.add(e.date.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [bills, expenses, currentMonthDefaultStr]);

  return (
    <div className="space-y-5 pb-24 max-w-5xl mx-auto animate-fadeIn text-neutral-900">
      
      {/* 🌟 1. TOP DASHBOARD CONTROLS (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center p-2 shadow-sm flex-shrink-0">
            <img
              src={LOGO_ICON_BASE64}
              alt="Mr. DODO Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black uppercase text-black tracking-tight">
                Studio Dashboard
              </h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isOnline ? 'bg-neutral-100 text-black border-neutral-300' : 'bg-neutral-200 text-neutral-700 border-neutral-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-black animate-pulse' : 'bg-neutral-500'}`} />
                {isOnline ? 'Cloud Synced' : 'Offline Mode'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Daily Operations & Monthly Financial Accounting
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isGuest ? (
            <button
              onClick={onNewBill}
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-95 flex-shrink-0"
            >
              <Plus size={15} />
              <span>+ Create Bill</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-semibold">
              Guest View Only
            </span>
          )}

          <button
            onClick={() => onNavigateTab('updates')}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <Droplets size={14} className="text-black" />
            <span>Bays ({serviceJobs.length})</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. PRIMARY VIEW SELECTOR: DAILY vs MONTHLY vs ALL-TIME */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-neutral-300 p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              viewMode === 'daily'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Calendar size={14} />
            <span>Daily Performance</span>
          </button>

          <button
            onClick={() => setViewMode('monthly')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              viewMode === 'monthly'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <TrendingUp size={14} />
            <span>Monthly Overview</span>
          </button>

          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              viewMode === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Clock size={14} />
            <span>All-Time</span>
          </button>
        </div>

        {/* Dynamic Context Selector based on active tab */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs">
          {viewMode === 'daily' && (
            <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-xl font-medium w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-neutral-500 font-bold">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-black font-extrabold text-xs focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {viewMode === 'monthly' && (
            <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-xl font-medium w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-neutral-500 font-bold">Select Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-black font-extrabold text-xs focus:outline-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'all' && (
            <span className="text-neutral-500 font-bold text-xs">
              Showing All {bills.length} Invoices
            </span>
          )}
        </div>
      </div>

      {/* 🌟 3. CONDITIONAL VIEW RENDERING */}

      {/* ======================================================== */}
      {/* 📅 VIEW A: DAILY PERFORMANCE                            */}
      {/* ======================================================== */}
      {viewMode === 'daily' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Daily 4 KPI Metric Cards (White & Black) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Daily Sales */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center">
                  <DollarSign size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(dailySales)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                {dailyBills.length} invoices on {formatDisplayDate(selectedDate)}
              </span>
            </div>

            {/* 2. Cars Serviced Today */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Cars Serviced</span>
                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center">
                  <Car size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                {dailyBills.length} <span className="text-sm font-semibold text-neutral-500">Vehicles</span>
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                Avg: ₹{dailyBills.length > 0 ? formatCurrency(Math.round(dailySales / dailyBills.length)) : 0} / car
              </span>
            </div>

            {/* 3. Daily Expenses */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Today's Expenses</span>
                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-700 flex items-center justify-center">
                  <TrendingDown size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(dailyExpensesTotal)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                {dailyExpensesList.length} expenses logged
              </span>
            </div>

            {/* 4. Daily Net Profit */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Today's Net Profit</span>
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                dailyNetProfit >= 0 ? 'text-black' : 'text-red-600'
              }`}>
                ₹{formatCurrency(dailyNetProfit)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                Sales minus expenses
              </span>
            </div>
          </div>

          {/* Daily Invoices List & Activity */}
          <div className="bg-white border border-neutral-300 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-black flex items-center gap-2">
                  <FileText size={16} />
                  Cars Billed on {formatDisplayDate(selectedDate)} ({dailyBills.length})
                </h3>
                <p className="text-xs text-neutral-500">
                  Total Revenue: ₹{formatCurrency(dailySales)}
                </p>
              </div>

              {!isGuest && (
                <button
                  onClick={onNewBill}
                  className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus size={13} /> Bill Next Car
                </button>
              )}
            </div>

            {dailyBills.length > 0 ? (
              <div className="space-y-2.5">
                {dailyBills.map((bill) => {
                  const subtotal = (bill.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                  const total = subtotal - (Number(bill.discount) || 0);

                  return (
                    <div
                      key={bill.id}
                      onClick={() => onNavigateTab('history')}
                      className="p-3.5 bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-black rounded-xl flex items-center justify-between gap-3 transition cursor-pointer group shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-black group-hover:underline">
                            {bill.customerName || 'Customer'}
                          </span>
                          {bill.vehicleNumber && (
                            <span className="text-[11px] bg-neutral-200 text-black border border-neutral-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                              {bill.vehicleNumber}
                            </span>
                          )}
                          <span className="text-xs text-neutral-500">
                            {bill.vehicleMake}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 truncate">
                          {(bill.items || []).map(i => i.description).join(' · ') || 'Services'}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-black text-black font-mono block">
                          ₹{formatCurrency(total)}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-black text-white rounded">
                          {bill.status || 'PAID'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-neutral-500 italic">
                  No invoices created for {formatDisplayDate(selectedDate)} yet.
                </p>
                {!isGuest && (
                  <button
                    onClick={onNewBill}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition"
                  >
                    + Create First Bill for This Date
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📊 VIEW B: MONTHLY OVERVIEW                             */}
      {/* ======================================================== */}
      {viewMode === 'monthly' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Monthly 4 KPI Metric Cards (White & Black) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Monthly Sales */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Month Sales</span>
                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center">
                  <DollarSign size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(monthlySummary.totalIncome)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                {monthlySummary.billCount} cars billed in {selectedMonth}
              </span>
            </div>

            {/* 2. Total Monthly Cars */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Cars Serviced</span>
                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center">
                  <Car size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                {monthlySummary.billCount} <span className="text-sm font-semibold text-neutral-500">Cars</span>
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                Profit margin: {monthlySummary.profitMargin}%
              </span>
            </div>

            {/* 3. Monthly Operating Expenses */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Month Expenses</span>
                <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-700 flex items-center justify-center">
                  <TrendingDown size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(monthlySummary.totalExpense)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                {monthlySummary.expenseCount} expenses in {selectedMonth}
              </span>
            </div>

            {/* 4. Monthly Net Profit */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Month Net Profit</span>
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                monthlySummary.netProfit >= 0 ? 'text-black' : 'text-red-600'
              }`}>
                ₹{formatCurrency(monthlySummary.netProfit)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                Income minus expenses
              </span>
            </div>
          </div>

          {/* Monthly Service Volume Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm text-center space-y-1">
              <ShieldCheck size={20} className="mx-auto text-black" />
              <p className="text-xs font-bold text-neutral-600">Coatings & PPF</p>
              <p className="text-xl font-black text-black font-mono">{serviceStats.coatings}</p>
            </div>
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm text-center space-y-1">
              <Sparkles size={20} className="mx-auto text-black" />
              <p className="text-xs font-bold text-neutral-600">Sun Film / Tints</p>
              <p className="text-xl font-black text-black font-mono">{serviceStats.sunfilm}</p>
            </div>
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm text-center space-y-1">
              <Car size={20} className="mx-auto text-black" />
              <p className="text-xs font-bold text-neutral-600">Underbody / Silencer</p>
              <p className="text-xl font-black text-black font-mono">{serviceStats.silencerUnderbody}</p>
            </div>
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm text-center space-y-1">
              <Droplets size={20} className="mx-auto text-black" />
              <p className="text-xs font-bold text-neutral-600">Washes & Detailing</p>
              <p className="text-xl font-black text-black font-mono">{serviceStats.washes}</p>
            </div>
          </div>

          {/* Day-by-Day Monthly Performance Table */}
          <div className="bg-white border border-neutral-300 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-black flex items-center gap-2">
                <Calendar size={16} /> Day-by-Day Breakdown for {selectedMonth}
              </h3>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <span>View Full Expense Ledger</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {monthlyDaysBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Cars Billed</th>
                      <th className="py-2.5 px-3 text-right">Day Sales</th>
                      <th className="py-2.5 px-3 text-right">Day Expenses</th>
                      <th className="py-2.5 px-3 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {monthlyDaysBreakdown.map((row) => {
                      const net = row.sales - row.expenses;
                      return (
                        <tr key={row.date} className="hover:bg-neutral-50 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-black">
                            {formatDisplayDate(row.date)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {row.count} cars
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-black">
                            ₹{formatCurrency(row.sales)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-neutral-600">
                            ₹{formatCurrency(row.expenses)}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                            net >= 0 ? 'text-black' : 'text-red-600'
                          }`}>
                            ₹{formatCurrency(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-6 text-center italic">
                No billing or expense records found for {selectedMonth}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📈 VIEW C: ALL-TIME LIFETIME FINANCIALS                 */}
      {/* ======================================================== */}
      {viewMode === 'all' && (
        <div className="space-y-5 animate-fadeIn">
          {/* All-Time 4 KPI Metric Cards (White & Black) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Studio Sales</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(totalSales)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                {bills.length} total invoices created
              </span>
            </div>

            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Cars Serviced</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                {bills.length} <span className="text-sm font-semibold text-neutral-500">Cars</span>
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                Lifetime vehicle visits
              </span>
            </div>

            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Shop Expenses</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(totalExpenses)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                {expenses.length} operating expense entries
              </span>
            </div>

            <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">All-Time Net Profit</span>
              <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                allTimeNetProfit >= 0 ? 'text-black' : 'text-red-600'
              }`}>
                ₹{formatCurrency(allTimeNetProfit)}
              </p>
              <span className="text-[11px] text-neutral-500 block font-medium">
                Cumulative studio profit
              </span>
            </div>
          </div>

          {/* Quick Links to Full Views */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('history')}
              className="p-4 bg-white border border-neutral-300 rounded-2xl hover:border-black transition flex items-center justify-between text-left group shadow-sm"
            >
              <div>
                <p className="font-extrabold text-sm text-black group-hover:underline">Browse All Invoices</p>
                <p className="text-xs text-neutral-500">Search by vehicle number, customer name, or date</p>
              </div>
              <ArrowRight size={18} className="text-neutral-400 group-hover:text-black transition" />
            </button>

            <button
              onClick={() => onNavigateTab('expenses')}
              className="p-4 bg-white border border-neutral-300 rounded-2xl hover:border-black transition flex items-center justify-between text-left group shadow-sm"
            >
              <div>
                <p className="font-extrabold text-sm text-black group-hover:underline">Monthly Expense Ledger</p>
                <p className="text-xs text-neutral-500">Add shop rent, supplies, salaries, and electricity</p>
              </div>
              <ArrowRight size={18} className="text-neutral-400 group-hover:text-black transition" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
