import React, { useState } from 'react';
import {
  Search, Edit3, Copy, Trash2, Eye, FileDown,
  Share2, Car, Phone, Calendar, ArrowRight,
  TrendingUp, CheckCircle, Clock, AlertTriangle, FileText,
  UserCheck, Filter
} from 'lucide-react';
import { formatCurrency, formatDisplayDate, groupBillsByDate } from '../utils/storage';
import { getVehicleFileName } from '../utils/pdfGenerator';

export default function BillHistory({
  bills,
  onSelectBill,
  onEditBill,
  onDuplicateBill,
  onDeleteBill,
  onDownloadPDF,
  onShareWhatsApp,
  onNewBill
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending'
  const [managerFilter, setManagerFilter] = useState('all');

  // Distinct managers in the list
  const managerNames = Array.from(new Set(bills.map(b => b.managerName).filter(Boolean)));

  // Filter bills by search query and payment status
  const filteredBills = bills.filter(bill => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (bill.customerName || '').toLowerCase().includes(term) ||
      (bill.vehicleNumber || '').toLowerCase().includes(term) ||
      (bill.customerPhone || '').toLowerCase().includes(term) ||
      (bill.invoiceNumber || '').toLowerCase().includes(term) ||
      (bill.vehicleMake || '').toLowerCase().includes(term) ||
      (bill.displayDate || '').toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' ? true : bill.paymentStatus === statusFilter;

    const matchesManager =
      managerFilter === 'all' ? true : bill.managerName === managerFilter;

    return matchesSearch && matchesStatus && matchesManager;
  });

  // Chronologically group the filtered bills by date!
  const groupedSections = groupBillsByDate(filteredBills);

  // High-level stats
  const totalRevenue = bills.reduce((sum, b) => {
    const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return sum + (sub - (Number(b.discount) || 0));
  }, 0);

  const paidBillsCount = bills.filter(b => b.paymentStatus === 'paid').length;
  const pendingBillsCount = bills.filter(b => b.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* 1. METRICS OVERVIEW BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Bills</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{bills.length}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Billed</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono truncate">
            ₹{formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Paid</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{paidBillsCount}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">{pendingBillsCount}</p>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, vehicle number (e.g. KL 05), car model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: 'all', label: `All (${bills.length})` },
              { id: 'paid', label: `Paid (${paidBillsCount})` },
              { id: 'pending', label: `Pending (${pendingBillsCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {managerNames.length > 1 && (
              <select
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="all">All Managers</option>
                {managerNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={onNewBill}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            + Create New Bill
          </button>
        </div>
      </div>

      {/* 3. DATE-GROUPED BILLS LIST (Saved Based on Dates) */}
      <div className="space-y-6">
        {groupedSections.map((section) => (
          <div key={section.key} className="space-y-3">
            {/* Date Section Header */}
            <div className="flex items-center gap-2 px-1">
              <Calendar size={14} className="text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {section.title}
              </h3>
              <div className="flex-1 border-t border-slate-800/80 ml-2"></div>
              <span className="text-[11px] text-slate-500 font-mono">
                {section.bills.length} {section.bills.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>

            {/* Bills in this date bucket */}
            <div className="space-y-3">
              {section.bills.map((bill) => {
                const subtotal = (bill.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                const discount = Number(bill.discount) || 0;
                const total = Math.max(0, subtotal - discount);
                const fileName = getVehicleFileName(bill, 'pdf');

                return (
                  <div
                    key={bill.id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-lg space-y-3.5 group"
                  >
                    {/* Card Top: Customer & Vehicle Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-white tracking-tight truncate">
                            {bill.titlePrefix || 'Mr:'} {bill.customerName || 'Unnamed Customer'}
                          </span>

                          {/* Vehicle Badge */}
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
                            {bill.vehicleNumber || 'NO REG'}
                          </span>

                          {/* Vehicle Make */}
                          {bill.vehicleMake && (
                            <span className="text-xs text-blue-300 font-medium bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              {bill.vehicleMake}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                          {bill.customerPhone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone size={13} className="text-slate-500" />
                              {bill.customerPhone}
                            </span>
                          )}
                          {bill.managerName && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <UserCheck size={13} className="text-emerald-400" />
                              Billed by: {bill.managerName}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                            📁 {fileName}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge & Amount */}
                      <div className="text-right whitespace-nowrap">
                        <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                          ₹{formatCurrency(total)}
                        </div>
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5 ${
                            bill.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {bill.paymentStatus || 'paid'}
                        </span>
                      </div>
                    </div>

                    {/* Items Summary Snippet */}
                    <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                      {(bill.items || []).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300">
                          <span className="truncate pr-2">
                            {idx + 1}. {item.description}
                          </span>
                          <span className="font-mono font-semibold text-slate-400 whitespace-nowrap">
                            ₹{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                      {(bill.items || []).length > 3 && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          + {(bill.items.length - 3)} more services...
                        </p>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Ref: {bill.invoiceNumber || bill.id}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* EDIT BUTTON (Load into form) */}
                        <button
                          onClick={() => onEditBill(bill)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition"
                          title="Edit this bill in form"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        {/* DUPLICATE BUTTON */}
                        <button
                          onClick={() => onDuplicateBill(bill.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Duplicate as new bill"
                        >
                          <Copy size={15} />
                        </button>

                        {/* VIEW A4 PREVIEW */}
                        <button
                          onClick={() => onSelectBill(bill)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View A4 PDF layout"
                        >
                          <Eye size={15} />
                        </button>

                        {/* DOWNLOAD PDF */}
                        <button
                          onClick={() => onDownloadPDF(bill)}
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
                          title="Download A4 PDF"
                        >
                          <FileDown size={15} />
                        </button>

                        {/* WHATSAPP SHARE */}
                        <button
                          onClick={() => onShareWhatsApp(bill)}
                          className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 transition"
                          title="Share via WhatsApp"
                        >
                          <Share2 size={15} />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete bill for ${bill.customerName || 'customer'} (${bill.vehicleNumber})?`)) {
                              onDeleteBill(bill.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete permanently"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groupedSections.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">
              {searchTerm ? 'No bills match your search criteria.' : 'No saved bills yet.'}
            </p>
            <button
              onClick={onNewBill}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition shadow-md shadow-blue-500/20"
            >
              + Create First Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
