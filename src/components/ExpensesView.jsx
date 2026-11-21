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
    <div className="space-y-5 pb-24 max-w-5xl mx-auto animate-fadeIn">
      
      {/* 1. TOP HEADER & MONTH SELECTOR BAR */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-sm">
            <DollarSign size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-black tracking-tight">
              Workshop Expenses & Ledger
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Real-time reconciliation of invoice income vs studio operational costs
            </p>
          </div>
        </div>

        {/* Month Selector Dropdown & Add Button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 rounded-xl px-2.5 py-1.5">
            <Calendar size={14} className="text-neutral-500 flex-shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-black focus:outline-none cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
              <option value="all">All-Time Cumulative</option>
            </select>
          </div>

          {!isGuest && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 flex-shrink-0"
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. THE 4 FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Gross Income */}
        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Gross Income</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-black font-mono">
            ₹{formatCurrency(summary.totalIncome)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200 font-medium">
            <span>{summary.billCount} billed invoices</span>
            <span className="text-black font-bold">100% Inflow</span>
          </div>
        </div>

        {/* Card 2: Total Operating Expenses */}
        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 font-mono">
            ₹{formatCurrency(summary.totalExpense)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200 font-medium">
            <span>{summary.expenseCount} vouchers</span>
            <span className="text-neutral-800 font-bold font-mono">
              {summary.totalIncome > 0 ? `${((summary.totalExpense / summary.totalIncome) * 100).toFixed(1)}% burn` : '0%'}
            </span>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Net Profit</span>
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-black">
            ₹{formatCurrency(summary.netProfit)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200 font-medium">
            <span>Bottom Line</span>
            <span className="font-bold font-mono px-2 py-0.5 rounded-lg bg-black text-white text-[10px]">
              {summary.profitMargin}% Margin
            </span>
          </div>
        </div>

        {/* Card 4: Operating Ratio */}
        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Studio Efficiency</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 font-mono">
            {summary.totalIncome > 0
              ? `${Math.max(0, 100 - Number(summary.profitMargin)).toFixed(1)}%`
              : '0.0%'}
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200 font-medium">
            <span>Expense-to-Income</span>
            <span className="text-black font-bold">Health Score</span>
          </div>
        </div>

      </div>

      {/* 3. EXPENSE CATEGORY BREAKDOWN */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-black" />
            <h3 className="text-sm font-black text-black">
              Expense Distribution By Category ({formatMonthLabel(selectedMonth)})
            </h3>
          </div>
          <span className="text-xs text-neutral-600 font-mono font-bold">
            Total: ₹{formatCurrency(summary.totalExpense)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {categories.map(cat => {
            const amount = summary.categoryMap[cat] || 0;
            const percentage = summary.totalExpense > 0
              ? ((amount / summary.totalExpense) * 100).toFixed(1)
              : 0;

            return (
              <div key={cat} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">{cat}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-neutral-500 text-[11px] font-medium">{percentage}%</span>
                    <span className="font-black text-black">₹{formatCurrency(amount)}</span>
                  </div>
                </div>
                {/* Progress track */}
                <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. EXPENSE VOUCHER RECORDS TABLE */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-black flex items-center gap-2">
              <Receipt size={16} />
              <span>Expense Vouchers Log</span>
              <span className="text-[10px] bg-neutral-100 border border-neutral-300 text-black px-2 py-0.5 rounded-lg font-mono font-bold">
                {filtered.length} entries
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">Detailed itemized expenditure ledger</p>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search description, paid by..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-100 border border-neutral-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black border border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vouchers List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-500 text-xs font-medium">
              No expenses recorded matching the selected month or filters.
            </div>
          ) : (
            filtered.map(exp => (
              <div
                key={exp.id}
                className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-black transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-black">{exp.description}</span>
                    <span className="text-[10px] bg-white border border-neutral-300 text-neutral-700 px-2 py-0.5 rounded-lg font-bold">
                      {exp.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium flex-wrap">
                    <span>{formatDisplayDate(exp.date)}</span>
                    <span>•</span>
                    <span>Paid by: {exp.paidBy || 'Owner'}</span>
                    <span>•</span>
                    <span className="text-black font-mono font-bold">{exp.paymentMode || 'UPI'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-neutral-900 font-mono">
                    -₹{formatCurrency(exp.amount)}
                  </span>
                  {!isGuest && (
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-neutral-300 text-black rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black">Record Workshop Expense</h3>
                  <p className="text-[11px] text-neutral-500 font-medium">Chemicals, wages, stock, or utilities</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 bg-white">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description / Vendor / Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5L Ceramic Shampoo, EB Bill, Microfiber Packs"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black font-mono font-bold placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Expense Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={form.paidBy}
                    onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer</option>
                    <option value="Credit / Debit Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:text-black text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
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
