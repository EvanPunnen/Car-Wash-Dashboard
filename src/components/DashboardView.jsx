import React from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Car, Sparkles,
  ShieldCheck, Sun, Droplets, Calendar, ArrowUpRight,
  FileText, Plus, Users, Cloud, Phone
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../utils/storage';

export default function DashboardView({
  bills,
  expenses,
  customers,
  onNavigateTab,
  onNewBill
}) {
  // 1. Calculations
  const totalSales = bills.reduce((sum, b) => {
    const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return sum + (sub - (Number(b.discount) || 0));
  }, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = totalSales - totalExpenses;
  const totalCarsServiced = bills.length;
  const avgBillValue = totalCarsServiced > 0 ? Math.round(totalSales / totalCarsServiced) : 0;

  // 2. Today's stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => (b.date || '').split('T')[0] === todayStr);
  const todaySales = todayBills.reduce((sum, b) => {
    const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return sum + (sub - (Number(b.discount) || 0));
  }, 0);
  const todayExpenses = expenses
    .filter(e => (e.date || '').split('T')[0] === todayStr)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 3. Service Breakdown
  const serviceStats = {
    coatings: 0,
    sunfilm: 0,
    silencerUnderbody: 0,
    washes: 0
  };

  bills.forEach(bill => {
    (bill.items || []).forEach(item => {
      const desc = (item.description || '').toLowerCase();
      if (desc.includes('coating') || desc.includes('borophine') || desc.includes('ceramic') || desc.includes('ppf')) {
        serviceStats.coatings++;
      } else if (desc.includes('film') || desc.includes('tint') || desc.includes('glass')) {
        serviceStats.sunfilm++;
      } else if (desc.includes('silencer') || desc.includes('underbody') || desc.includes('rust')) {
        serviceStats.silencerUnderbody++;
      } else if (desc.includes('wash') || desc.includes('clean') || desc.includes('foam')) {
        serviceStats.washes++;
      }
    });
  });

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto animate-fadeIn">
      {/* 1. TOP STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono tracking-tight">
            ₹{formatCurrency(totalSales)}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> Billed across {totalCarsServiced} vehicles
          </span>
        </div>

        {/* Cars Serviced */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Cars Serviced</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Car size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono tracking-tight">
            {totalCarsServiced} <span className="text-sm font-normal text-slate-400">Cars</span>
          </p>
          <span className="text-[11px] text-blue-400 font-medium mt-1 block">
            Avg: ₹{formatCurrency(avgBillValue)} / car
          </span>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono tracking-tight">
            ₹{formatCurrency(totalExpenses)}
          </p>
          <span className="text-[11px] text-rose-400 font-medium mt-1 block">
            {expenses.length} expense entries logged
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className={`text-2xl font-extrabold font-mono tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{formatCurrency(netProfit)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Sales minus shop expenses
          </span>
        </div>
      </div>

      {/* 2. QUICK ACTIONS DOCK */}
      <div className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl shadow-lg flex flex-wrap gap-2.5 items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Fast Actions:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onNewBill}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-blue-600/20"
          >
            <Plus size={14} /> New Bill
          </button>
          <button
            onClick={() => onNavigateTab('coatings')}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ShieldCheck size={14} /> Coating Tracker
          </button>
          <button
            onClick={() => onNavigateTab('customers')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Users size={14} /> Customer Directory
          </button>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <DollarSign size={14} /> Log Expense
          </button>
        </div>
      </div>

      {/* 3. SERVICE BREAKDOWN CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white dark:text-white text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Service Volume Breakdown
          </h3>
          <button
            onClick={() => onNavigateTab('coatings')}
            className="text-xs text-blue-400 hover:underline"
          >
            View Coating Vehicles $\rightarrow$
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl space-y-1.5 cursor-pointer hover:border-purple-500/50 transition group"
          >
            <div className="flex items-center justify-between text-purple-400">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">
                High Value
              </span>
            </div>
            <h4 className="text-sm font-bold text-white dark:text-white text-slate-900 group-hover:text-purple-300 transition">
              Coatings & PPF
            </h4>
            <p className="text-2xl font-extrabold text-purple-400 font-mono">
              {serviceStats.coatings} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Borophine & Ceramic 9H/10H</p>
          </div>

          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl space-y-1.5 cursor-pointer hover:border-amber-500/50 transition group"
          >
            <div className="flex items-center justify-between text-amber-400">
              <Sun size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                Solar Heat
              </span>
            </div>
            <h4 className="text-sm font-bold text-white dark:text-white text-slate-900 group-hover:text-amber-300 transition">
              Sun Film / Tints
            </h4>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">
              {serviceStats.sunfilm} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Full Car & CR70 Clear Windshield</p>
          </div>

          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl space-y-1.5 cursor-pointer hover:border-blue-500/50 transition group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <Car size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                Anti-Rust
              </span>
            </div>
            <h4 className="text-sm font-bold text-white dark:text-white text-slate-900 group-hover:text-blue-300 transition">
              Silencer & Underbody
            </h4>
            <p className="text-2xl font-extrabold text-blue-400 font-mono">
              {serviceStats.silencerUnderbody} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Thermal zinc & bitumen coating</p>
          </div>

          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl space-y-1.5 cursor-pointer hover:border-cyan-500/50 transition group"
          >
            <div className="flex items-center justify-between text-cyan-400">
              <Droplets size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded">
                Detailing
              </span>
            </div>
            <h4 className="text-sm font-bold text-white dark:text-white text-slate-900 group-hover:text-cyan-300 transition">
              Washes & Steam Clean
            </h4>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">
              {serviceStats.washes} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Premium snow foam & interior sanitize</p>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LISTS (Side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Invoices */}
        <div className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 dark:text-slate-300 text-slate-800 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-400" /> Recent Vehicle Invoices
            </h4>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-blue-400 hover:underline"
            >
              All Bills $\rightarrow$
            </button>
          </div>

          <div className="space-y-2">
            {bills.slice(0, 4).map(bill => {
              const subtotal = (bill.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const total = subtotal - (Number(bill.discount) || 0);

              return (
                <div
                  key={bill.id}
                  className="p-3 bg-slate-950/70 dark:bg-slate-950/70 bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 border-slate-200 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white dark:text-white text-slate-900 truncate">
                        {bill.customerName || 'Customer'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                        {bill.vehicleNumber || 'NO REG'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {bill.vehicleMake} · {bill.displayDate || bill.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white dark:text-white text-slate-900 font-mono">
                      ₹{formatCurrency(total)}
                    </span>
                    <span className="block text-[10px] text-emerald-400 uppercase font-semibold">
                      {bill.paymentStatus || 'paid'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 dark:text-slate-300 text-slate-800 flex items-center gap-1.5">
              <DollarSign size={14} className="text-rose-400" /> Recent Shop Expenses
            </h4>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-blue-400 hover:underline"
            >
              All Expenses $\rightarrow$
            </button>
          </div>

          <div className="space-y-2">
            {expenses.slice(0, 4).map(exp => (
              <div
                key={exp.id}
                className="p-3 bg-slate-950/70 dark:bg-slate-950/70 bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 border-slate-200 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs text-white dark:text-white text-slate-900 truncate block">
                    {exp.description}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exp.category} · {exp.date}
                  </p>
                </div>
                <span className="text-sm font-bold text-rose-400 font-mono whitespace-nowrap">
                  -₹{formatCurrency(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
