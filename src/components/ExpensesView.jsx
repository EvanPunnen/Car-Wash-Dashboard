import React, { useState, useMemo } from 'react';
import {
  DollarSign, Plus, Search, Trash2, Calendar, Tag,
  TrendingDown, TrendingUp, FileText, Check, X, Filter,
  PieChart, ShieldAlert, ArrowUpRight, ArrowDownRight, Wallet,
  Receipt, Percent, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDisplayDate, getMonthlyFinancialSummary } from '../utils/storage';

export default function ExpensesView({
  expenses = [],
  bills = [],
  isGuest = false,
  onSaveExpense,
  onDeleteExpense
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default to current month YYYY-MM
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const categories = [
    'Chemicals & Compounds',
    'Stock & Films',
    'Utilities & Electricity',
    'Washing Materials',
    'Maintenance',
    'Salaries & Wages',
    'Rent & Operations',
    'Miscellaneous'
  ];

  // Generate dynamic month list from available data
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    monthSet.add(currentMonthStr);

    bills.forEach(b => {
      if (b.date) {
        const m = b.date.slice(0, 7);
        if (m.length === 7) monthSet.add(m);
      }
    });

    expenses.forEach(e => {
      if (e.date) {
        const m = e.date.slice(0, 7);
        if (m.length === 7) monthSet.add(m);
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [bills, expenses, currentMonthStr]);

  // Compute Financial Summary for selected month
  const summary = useMemo(() => {
    return getMonthlyFinancialSummary(bills, expenses, selectedMonth);
  }, [bills, expenses, selectedMonth]);

  const [form, setForm] = useState({
    description: '',
    category: 'Chemicals & Compounds',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: 'Mr. DODO Owner',
    paymentMode: 'UPI / GPay'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isGuest || !form.description || !form.amount) return;

    onSaveExpense({
      ...form,
      amount: Number(form.amount) || 0,
      id: `exp-${Date.now()}`
    });

    setForm({
      description: '',
      category: 'Chemicals & Compounds',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: 'Mr. DODO Owner',
      paymentMode: 'UPI / GPay'
    });
    setIsModalOpen(false);
  };

  // Filtered expense vouchers list
  const filtered = useMemo(() => {
    return expenses.filter(exp => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (exp.description || '').toLowerCase().includes(term) ||
        (exp.paidBy || '').toLowerCase().includes(term) ||
        (exp.category || '').toLowerCase().includes(term);

      const matchCategory =
        selectedCategory === 'All' ? true : exp.category === selectedCategory;

      const matchMonth =
        selectedMonth === 'all' ? true : (exp.date || '').startsWith(selectedMonth);

      return matchSearch && matchCategory && matchMonth;
    });
  }, [expenses, searchTerm, selectedCategory, selectedMonth]);

  const formatMonthLabel = (mKey) => {
    if (mKey === 'all') return 'All-Time Cumulative';
    const [year, month] = mKey.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto animate-fadeIn">
      
      {/* 1. TOP HEADER & MONTH SELECTOR BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Monthly Financial Overview
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time reconciliation of invoice income vs workshop operational expenses
          </p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Calendar size={16} className="text-blue-400 flex-shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
            <option value="all">All-Time Cumulative</option>
          </select>

          {!isGuest && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950 transition active:scale-95 flex-shrink-0"
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. THE 4 PERFECT FINANCIAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Gross Income */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ₹{formatCurrency(summary.totalIncome)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>{summary.billCount} billed invoices</span>
            <span className="text-emerald-400 font-semibold">100% Inflow</span>
          </div>
        </div>

        {/* Card 2: Total Operating Expenses */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">
            ₹{formatCurrency(summary.totalExpense)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>{summary.expenseCount} vouchers</span>
            <span className="text-rose-400 font-semibold">
              {summary.totalIncome > 0 ? `${((summary.totalExpense / summary.totalIncome) * 100).toFixed(1)}% burn` : '0%'}
            </span>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Profit</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              summary.netProfit >= 0
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              <Wallet size={16} />
            </div>
          </div>
          <p className={`text-2xl font-black font-mono ${
            summary.netProfit >= 0 ? 'text-white' : 'text-rose-400'
          }`}>
            ₹{formatCurrency(summary.netProfit)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Bottom Line</span>
            <span className={`font-bold font-mono px-1.5 py-0.2 rounded ${
              summary.netProfit >= 0 ? 'bg-blue-950 text-blue-300' : 'bg-rose-950 text-rose-300'
            }`}>
              {summary.profitMargin}% Margin
            </span>
          </div>
        </div>

        {/* Card 4: Operating Ratio */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Period Efficiency</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-300 font-mono">
            {summary.totalIncome > 0
              ? `${Math.max(0, 100 - Number(summary.profitMargin)).toFixed(1)}%`
              : '0.0%'}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Expense-to-Income</span>
            <span className="text-indigo-400 font-medium">Workshop Health</span>
          </div>
        </div>

      </div>

      {/* 3. EXPENSE CATEGORY BREAKDOWN (Progress Bars) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Expense Distribution By Category ({formatMonthLabel(selectedMonth)})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total: ₹{formatCurrency(summary.totalExpense)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {categories.map(cat => {
            const amount = summary.categoryMap[cat] || 0;
            const percentage = summary.totalExpense > 0
              ? ((amount / summary.totalExpense) * 100).toFixed(1)
              : 0;

            return (
              <div key={cat} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cat}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{percentage}%</span>
                    <span className="font-bold text-white">₹{formatCurrency(amount)}</span>
                  </div>
                </div>
                {/* Progress track */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. EXPENSE VOUCHER RECORDS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt size={16} className="text-blue-400" />
              <span>Expense Vouchers Log</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {filtered.length} entries
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Detailed itemized expenditure ledger</p>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, paid by..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vouchers List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-slate-950 border border-slate-800/60 rounded-2xl text-slate-500 text-xs">
              No expenses recorded matching the selected month or filters.
            </div>
          ) : (
            filtered.map(exp => (
              <div
                key={exp.id}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{exp.description}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {exp.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{formatDisplayDate(exp.date)}</span>
                    <span>•</span>
                    <span>Paid by: {exp.paidBy || 'Owner'}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-mono">{exp.paymentMode || 'UPI'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-rose-400 font-mono">
                    -₹{formatCurrency(exp.amount)}
                  </span>
                  {!isGuest && (
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                      title="Delete Voucher"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. ADD EXPENSE MODAL */}
      {isModalOpen && !isGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600/15 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Record Workshop Expense</h3>
                  <p className="text-[11px] text-slate-400">Chemicals, wages, stock, or utilities</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description / Vendor / Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5L Ceramic Shampoo, EB Bill, Microfiber Packs"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Expense Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={form.paidBy}
                    onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer</option>
                    <option value="Credit / Debit Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-950"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
