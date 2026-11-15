import React from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Car, Sparkles,
  ShieldCheck, Sun, Droplets, Calendar, ArrowUpRight,
  FileText, Plus, Users, Cloud, Phone, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../utils/storage';
import {
  LOGO_ICON_WHITE_BASE64,
  LOGO_TEXT_WHITE_BASE64
} from '../assets/logoData';

export default function DashboardView({
  bills,
  expenses,
  customers = [],
  serviceJobs = [],
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
    <div className="space-y-5 pb-24 max-w-5xl mx-auto animate-fadeIn">
      {/* 0. HOME HERO BANNER CARD (Enhanced Round Center Logo & High Clarity Detailing Visuals) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl text-center">
        <div className="relative z-10 flex flex-col items-center">
          {/* Round Center-Fit Official Emblem Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 border-2 border-slate-700 ring-2 ring-blue-500/30 shadow-xl flex items-center justify-center p-3 mb-3.5 group hover:scale-105 transition-transform duration-300">
            <img
              src={LOGO_ICON_WHITE_BASE64}
              alt="Mr. DODO Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
            />
          </div>

          {/* Typography & Brand Headline */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Mr. DODO
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Active Studio
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-300 uppercase">
              PREMIUM DETAILING & CAR WASH
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Manarcad - Thiruvanchoor Bypass Road, Kottayam
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <button
              onClick={onNewBill}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-950/50 flex items-center gap-1.5 active:scale-95 transition"
            >
              <Plus size={15} />
              <span>Create New Bill</span>
            </button>

            <button
              onClick={() => onNavigateTab('updates')}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
            >
              <Droplets size={14} className="text-blue-400" />
              <span>Live Updates ({serviceJobs.length})</span>
            </button>

            <button
              onClick={() => onNavigateTab('preview')}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
            >
              <FileText size={14} className="text-blue-400" />
              <span>View A4 Bill</span>
              <ArrowRight size={13} className="text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('coatings')}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
            >
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Coatings ({serviceStats.coatings})</span>
            </button>

            <button
              onClick={() => onNavigateTab('customers')}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
            >
              <Users size={14} className="text-blue-400" />
              <span>Clients ({customers.length})</span>
            </button>
          </div>
        </div>
      </div>

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
            Shop operation costs
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className={`text-2xl font-extrabold font-mono tracking-tight ${
            netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            ₹{formatCurrency(netProfit)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Sales minus expenses
          </span>
        </div>
      </div>

      {/* 2. TODAY QUICK BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              Today's Performance ({formatDisplayDate(todayStr)})
            </h4>
            <p className="text-xs text-slate-400">
              {todayBills.length} cars billed today · ₹{formatCurrency(todaySales)} sales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Today Net</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ₹{formatCurrency(todaySales - todayExpenses)}
            </span>
          </div>
          <button
            onClick={onNewBill}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={14} /> Bill Car
          </button>
        </div>
      </div>

      {/* 3. SERVICE BREAKDOWN (Blue / Black / White Theme) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles size={15} className="text-blue-400" />
            Service Volume Breakdown
          </h3>
          <button
            onClick={() => onNavigateTab('coatings')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>View Coating Vehicles</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl space-y-1.5 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded">
                High Value
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
              Coatings & PPF
            </h4>
            <p className="text-2xl font-extrabold text-white font-mono">
              {serviceStats.coatings} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Borophine & Ceramic 9H/10H</p>
          </div>

          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl space-y-1.5 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <Sun size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded">
                Solar Heat
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
              Sun Film / Tints
            </h4>
            <p className="text-2xl font-extrabold text-white font-mono">
              {serviceStats.sunfilm} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Full Car & CR70 Clear Windshield</p>
          </div>

          <div
            onClick={() => onNavigateTab('coatings')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl space-y-1.5 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <Car size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded">
                Anti-Rust
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
              Silencer & Underbody
            </h4>
            <p className="text-2xl font-extrabold text-white font-mono">
              {serviceStats.silencerUnderbody} <span className="text-xs font-normal text-slate-400">Cars</span>
            </p>
            <p className="text-[11px] text-slate-400">Thermal zinc & bitumen coating</p>
          </div>

          <div
            onClick={() => onNavigateTab('updates')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl space-y-1.5 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-blue-400">
              <Droplets size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded">
                Live Bay
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
              Washes & Detailing
            </h4>
            <p className="text-2xl font-extrabold text-white font-mono">
              {serviceJobs.length || serviceStats.washes} <span className="text-xs font-normal text-slate-400">Vehicles</span>
            </p>
            <p className="text-[11px] text-slate-400">Live bay tracking & WhatsApp status</p>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LISTS (Side by side with clean Right Arrows) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Invoices */}
        <div className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 dark:text-slate-300 text-slate-800 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-400" /> Recent Vehicle Invoices
            </h4>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>All Bills</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {bills.slice(0, 4).map(bill => {
              const subtotal = (bill.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const total = subtotal - (Number(bill.discount) || 0);

              return (
                <div
                  key={bill.id}
                  onClick={() => onNavigateTab('history')}
                  className="p-3 bg-slate-950/70 dark:bg-slate-950/70 bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-blue-500/40 transition cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white dark:text-white text-slate-900 truncate">
                        {bill.customerName || 'Customer'}
                      </span>
                      {bill.vehicleNumber && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                          {bill.vehicleNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {bill.vehicleMake || 'Car'} · {formatDisplayDate(bill.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-white dark:text-white text-slate-900 font-mono block">
                      ₹{formatCurrency(total)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium uppercase">
                      {bill.status || 'PAID'}
                    </span>
                  </div>
                </div>
              );
            })}

            {bills.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center italic">
                No invoices created yet
              </p>
            )}
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
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>All Expenses</span>
              <ArrowRight size={13} />
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

            {expenses.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center italic">
                No expenses logged yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}