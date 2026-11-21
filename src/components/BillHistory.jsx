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

  // Chronologically group the filtered bills by date
  const groupedSections = groupBillsByDate(filteredBills);

  // High-level stats
  const totalRevenue = bills.reduce((sum, b) => {
    const sub = (b.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return sum + (sub - (Number(b.discount) || 0));
  }, 0);

  const paidBillsCount = bills.filter(b => b.paymentStatus === 'paid').length;
  const pendingBillsCount = bills.filter(b => b.paymentStatus === 'pending').length;

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto text-neutral-900 animate-fadeIn">
      
      {/* 🌟 1. METRICS OVERVIEW (White & Black) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bills</span>
            <FileText size={15} className="text-black" />
          </div>
          <p className="text-2xl font-black text-black font-mono">{bills.length}</p>
        </div>

        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Billed</span>
            <TrendingUp size={15} className="text-black" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-black font-mono truncate">
            ₹{formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid</span>
            <CheckCircle size={15} className="text-black" />
          </div>
          <p className="text-2xl font-black text-black font-mono">{paidBillsCount}</p>
        </div>

        <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock size={15} className="text-neutral-500" />
          </div>
          <p className="text-2xl font-black text-neutral-700 font-mono">{pendingBillsCount}</p>
        </div>
      </div>

      {/* 🌟 2. SEARCH & FILTER CONTROLS (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by customer, vehicle number (e.g. KL 05), car model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-black font-bold"
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
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  statusFilter === tab.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {managerNames.length > 1 && (
              <select
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
                className="bg-white border border-neutral-300 text-xs font-bold text-black rounded-xl px-2.5 py-1 focus:outline-none"
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
            className="text-xs font-black text-black hover:underline flex items-center gap-1"
          >
            + Create New Bill
          </button>
        </div>
      </div>

      {/* 🌟 3. DATE-GROUPED BILLS LIST (White & Black) */}
      <div className="space-y-6">
        {groupedSections.map((section) => (
          <div key={section.key} className="space-y-3">
            {/* Date Section Header */}
            <div className="flex items-center gap-2 px-1">
              <Calendar size={14} className="text-black" />
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                {section.title}
              </h3>
              <div className="flex-1 border-t border-neutral-200 ml-2"></div>
              <span className="text-[11px] text-neutral-500 font-mono font-bold">
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
                    className="bg-white border border-neutral-300 hover:border-black rounded-2xl p-4 sm:p-5 transition shadow-sm space-y-3.5 group"
                  >
                    {/* Card Top: Customer & Vehicle Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-base text-black tracking-tight truncate">
                            {bill.titlePrefix || 'Mr:'} {bill.customerName || 'Unnamed Customer'}
                          </span>

                          {/* Vehicle Badge */}
                          <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-black border border-neutral-300 text-xs font-mono font-bold uppercase tracking-wider">
                            {bill.vehicleNumber || 'NO REG'}
                          </span>

                          {/* Vehicle Make */}
                          {bill.vehicleMake && (
                            <span className="text-xs text-neutral-700 font-bold bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                              {bill.vehicleMake}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1.5 flex-wrap">
                          {bill.customerPhone && (
                            <span className="flex items-center gap-1 font-mono font-medium text-neutral-700">
                              <Phone size={13} className="text-neutral-400" />
                              {bill.customerPhone}
                            </span>
                          )}
                          {bill.managerName && (
                            <span className="flex items-center gap-1 text-black font-semibold">
                              <UserCheck size={13} className="text-black" />
                              Billed by: {bill.managerName}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                            📁 {fileName}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge & Amount */}
                      <div className="text-right whitespace-nowrap">
                        <div className="text-lg sm:text-xl font-black text-black font-mono">
                          ₹{formatCurrency(total)}
                        </div>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-0.5 ${
                            bill.paymentStatus === 'paid'
                              ? 'bg-black text-white'
                              : 'bg-neutral-200 text-neutral-800 border border-neutral-300'
                          }`}
                        >
                          {bill.paymentStatus || 'paid'}
                        </span>
                      </div>
                    </div>

                    {/* Items Summary Snippet */}
                    <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200 text-xs text-neutral-800 space-y-1">
                      {(bill.items || []).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="truncate pr-2 font-medium">
                            {idx + 1}. {item.description}
                          </span>
                          <span className="font-mono font-bold text-black whitespace-nowrap">
                            ₹{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                      {(bill.items || []).length > 3 && (
                        <p className="text-[11px] text-neutral-500 italic pt-0.5">
                          + {(bill.items.length - 3)} more services...
                        </p>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200 flex-wrap">
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Ref: {bill.invoiceNumber || bill.id}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* EDIT BUTTON (Load into form) */}
                        <button
                          onClick={() => onEditBill(bill)}
                          className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                          title="Edit this bill in form"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        {/* DUPLICATE BUTTON */}
                        <button
                          onClick={() => onDuplicateBill(bill.id)}
                          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition"
                          title="Duplicate as new bill"
                        >
                          <Copy size={14} />
                        </button>

                        {/* VIEW A4 PREVIEW */}
                        <button
                          onClick={() => onSelectBill(bill)}
                          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition"
                          title="View A4 PDF layout"
                        >
                          <Eye size={14} />
                        </button>

                        {/* DOWNLOAD PDF */}
                        <button
                          onClick={() => onDownloadPDF(bill)}
                          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition"
                          title="Download A4 PDF"
                        >
                          <FileDown size={14} />
                        </button>

                        {/* WHATSAPP SHARE */}
                        <button
                          onClick={() => onShareWhatsApp(bill)}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                          title="Share via WhatsApp"
                        >
                          <Share2 size={14} />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete bill for ${bill.customerName || 'customer'} (${bill.vehicleNumber})?`)) {
                              onDeleteBill(bill.id);
                            }
                          }}
                          className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                          title="Delete permanently"
                        >
                          <Trash2 size={14} />
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
          <div className="text-center py-12 bg-white border border-dashed border-neutral-300 rounded-2xl p-6 shadow-sm">
            <p className="text-neutral-500 text-sm">
              {searchTerm ? 'No bills match your search criteria.' : 'No saved bills yet.'}
            </p>
            <button
              onClick={onNewBill}
              className="mt-3 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition shadow-sm"
            >
              + Create First Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
