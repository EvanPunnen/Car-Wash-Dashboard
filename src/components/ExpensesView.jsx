import React, { useState } from 'react';
import {
  DollarSign, Plus, Search, Trash2, Calendar, Tag,
  TrendingDown, FileText, Check, X, Filter
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../utils/storage';

export default function ExpensesView({
  expenses,
  onSaveExpense,
  onDeleteExpense
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!form.description || !form.amount) return;

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

  const filtered = expenses.filter(exp => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (exp.description || '').toLowerCase().includes(term) ||
      (exp.paidBy || '').toLowerCase().includes(term) ||
      (exp.category || '').toLowerCase().includes(term);

    const matchCategory =
      selectedCategory === 'All' ? true : exp.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const totalExpenseSum = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const filteredSum = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. EXPENSES SUMMARY BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <TrendingDown size={18} className="text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono">
            ₹{formatCurrency(totalExpenseSum)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {expenses.length} logged vouchers
          </span>
        </div>

        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Filtered Total</span>
            <Tag size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-400 font-mono">
            ₹{formatCurrency(filteredSum)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {filtered.length} matching entries
          </span>
        </div>

        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Entry</span>
            <p className="text-xs text-slate-400 mt-0.5">Record detailing stock, bills, wages</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-rose-600/20 active:scale-95"
          >
            <Plus size={14} /> Add New Expense
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description, paid by, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 dark:bg-slate-950 bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white dark:text-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950 dark:bg-slate-950 bg-slate-100 text-slate-400 hover:text-white border border-slate-800 dark:border-slate-800 border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. EXPENSES TABLE / LIST */}
      <div className="space-y-2.5">
        {filtered.map(exp => (
          <div
            key={exp.id}
            className="p-3.5 sm:p-4 bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-white dark:text-white text-slate-900">
                  {exp.description}
                </h4>
                <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">
                  {exp.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-500" /> {exp.date}
                </span>
                {exp.paidBy && (
                  <span>Paid By: <strong className="text-slate-300 dark:text-slate-300 text-slate-700">{exp.paidBy}</strong></span>
                )}
                {exp.paymentMode && (
                  <span className="font-mono text-[11px] text-slate-500">[{exp.paymentMode}]</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-base sm:text-lg font-extrabold text-rose-400 font-mono">
                  -₹{formatCurrency(exp.amount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete expense "${exp.description}"?`)) {
                    onDeleteExpense(exp.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Delete expense"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">No expense records found.</p>
          </div>
        )}
      </div>

      {/* 4. ADD EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
              <h3 className="font-bold text-white text-base">Record Shop Expense</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Borophine Coating 50ml bottles, Sun film rolls..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expense Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={form.paidBy}
                    onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                    placeholder="e.g. Mr. DODO Owner"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
