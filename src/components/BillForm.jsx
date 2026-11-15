import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Calendar, Car, User, Phone, Sparkles,
  Save, Eye, FileDown, Share2, Tag, CheckCircle2,
  AlertCircle, RotateCcw, ShieldCheck, DollarSign, UserCheck,
  ArrowRight, ChevronRight, ChevronLeft, ArrowLeft
} from 'lucide-react';
import { TITLE_PREFIXES, CAR_MAKERS } from '../constants/defaultData';
import { formatCurrency, formatDisplayDate } from '../utils/storage';
import QuickServiceModal from './QuickServiceModal';

export default function BillForm({
  bill,
  onChange,
  onSave,
  onPreview,
  onNewBill,
  onLoadSample,
  onDownloadPDF,
  onShareWhatsApp,
  isSaving,
  activeManager,
  onOpenManagerModal
}) {
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [selectedMaker, setSelectedMaker] = useState('All');
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const chipsContainerRef = useRef(null);

  // Financial calculations
  const items = bill?.items || [];
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const discount = Number(bill?.discount) || 0;
  const total = Math.max(0, subtotal - discount);

  // Field change helpers
  const handleFieldChange = (field, value) => {
    onChange({
      ...bill,
      [field]: value
    });
  };

  const handleDateChange = (isoDate) => {
    onChange({
      ...bill,
      date: isoDate,
      displayDate: formatDisplayDate(isoDate)
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value
    };
    onChange({ ...bill, items: updated });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: '',
      amount: ''
    };
    onChange({
      ...bill,
      items: [...items, newItem]
    });
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange({ ...bill, items: updated });
  };

  const handleAddQuickService = (service) => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: service.name,
      amount: service.amount
    };

    let newNote = bill.warrantyNote;
    if (service.note && (!bill.warrantyNote || bill.warrantyNote.trim() === '')) {
      newNote = service.note;
    }

    onChange({
      ...bill,
      items: [...items, newItem],
      warrantyNote: newNote
    });
  };

  // Car model suggestions filtered by maker and search text
  const currentSearch = (bill.vehicleMake || '').toLowerCase();
  const allFilteredModels = [];

  CAR_MAKERS.forEach(group => {
    if (selectedMaker === 'All' || group.maker.toLowerCase().includes(selectedMaker.toLowerCase())) {
      group.models.forEach(m => {
        if (!currentSearch || m.toLowerCase().includes(currentSearch)) {
          allFilteredModels.push({ model: m, maker: group.maker, badge: group.badge });
        }
      });
    }
  });

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* TOP HEADER CONTROLS */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md sticky top-2 z-20">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              {bill?.id?.startsWith('sample') ? 'Sample Bill' : (bill?.id ? 'Editing Bill' : 'New Bill')}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {bill?.invoiceNumber || 'DODO-1042'}
            </span>
          </div>

          {/* Active Manager Pill */}
          <button
            type="button"
            onClick={onOpenManagerModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:border-blue-500/50 transition"
            title="Click to switch active manager"
          >
            <UserCheck size={13} className="text-blue-400" />
            <span className="font-semibold text-white">{activeManager?.name || 'Manager'}</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onNewBill}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1"
              title="Start a new blank bill"
            >
              <RotateCcw size={13} /> New
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Load original Rev Fr. sample bill"
            >
              Sample
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Bill'}</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
            title="View standard A4 invoice"
          >
            <Eye size={15} />
            <span>View A4</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition active:scale-95"
          >
            <FileDown size={15} />
            <span>Get PDF</span>
          </button>

          <button
            type="button"
            onClick={onShareWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-xs transition shadow-lg shadow-green-600/20 active:scale-95"
          >
            <Share2 size={15} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 1. CUSTOMER & VEHICLE DETAILS CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <User size={16} className="text-blue-400" />
            Customer & Vehicle Information
          </h3>
          <span className="text-[11px] text-slate-400">Required on Bill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Title + Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Customer Name
            </label>
            <div className="flex gap-2">
              <select
                value={bill.titlePrefix || 'Mr:'}
                onChange={(e) => handleFieldChange('titlePrefix', e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              >
                {TITLE_PREFIXES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="e.g. Rev Fr. A V Varghese"
                value={bill.customerName || ''}
                onChange={(e) => handleFieldChange('customerName', e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                placeholder="e.g. 9061367927"
                value={bill.customerPhone || ''}
                onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Vehicle Registration No.
            </label>
            <div className="relative">
              <Car size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. KL 05 BE 6091"
                value={bill.vehicleNumber || ''}
                onChange={(e) => handleFieldChange('vehicleNumber', e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wider"
              />
            </div>
          </div>

          {/* Vehicle Make / Model with Car Maker Suggestions */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Make & Model (with Car Maker Suggestions)
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. Toyota Hyrider or Creta..."
              value={bill.vehicleMake || ''}
              onChange={(e) => {
                handleFieldChange('vehicleMake', e.target.value);
                setShowVehicleSuggestions(true);
              }}
              onFocus={() => setShowVehicleSuggestions(true)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            {/* Car Maker Quick Chips with Right Arrow */}
            <div className="relative flex items-center gap-1 pt-2 pb-1">
              <div
                ref={chipsContainerRef}
                className="flex overflow-x-auto gap-1.5 scrollbar-none scroll-smooth flex-1 pr-1"
              >
                {['All', 'Toyota', 'Mahindra', 'Hyundai', 'Tata', 'Kia', 'Maruti', 'Luxury', 'Honda', 'MG', 'Skoda', 'Volkswagen'].map((makerName) => (
                  <button
                    key={makerName}
                    type="button"
                    onClick={() => {
                      setSelectedMaker(makerName);
                      setShowVehicleSuggestions(true);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition ${
                      selectedMaker === makerName
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {makerName}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (chipsContainerRef.current) {
                    chipsContainerRef.current.scrollBy({ left: 140, behavior: 'smooth' });
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex-shrink-0 shadow"
                title="Scroll more car makers to the right"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Smart Suggestions Dropdown */}
            {showVehicleSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-800">
                <div className="p-2 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
                  <span>Showing {allFilteredModels.length} models for {selectedMaker}</span>
                  <button
                    type="button"
                    onClick={() => setShowVehicleSuggestions(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                {allFilteredModels.slice(0, 15).map(({ model, maker }) => (
                  <button
                    key={model}
                    type="button"
                    onMouseDown={() => {
                      handleFieldChange('vehicleMake', model);
                      setShowVehicleSuggestions(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
                  >
                    <span className="font-medium">{model}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {maker}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date & Invoice Number Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-blue-400" />
              Invoice Date
            </label>
            <input
              type="date"
              value={bill.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Prints as: <span className="text-slate-300 font-medium">{bill.displayDate || '7 March 2026'}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-blue-400" />
              Invoice Ref Number
            </label>
            <input
              type="text"
              placeholder="e.g. DODO-1041"
              value={bill.invoiceNumber || ''}
              onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. SERVICES & LINE ITEMS CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              Bill Services & Packages
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Numbered description and amount on the invoice</p>
          </div>

          <button
            type="button"
            onClick={() => setIsQuickModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition"
          >
            <Sparkles size={13} />
            <span>Quick Packages</span>
          </button>
        </div>

        {/* Dynamic Items List */}
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl"
            >
              <span className="w-6 text-center text-xs font-bold text-slate-500">
                {index + 1}.
              </span>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Service description (e.g. Borophine Coating 3 year)"
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="w-28 sm:w-32">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={item.amount === '' ? '' : item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-6 pr-2 py-1.5 text-sm font-bold text-white text-right placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400">No services added yet</p>
              <button
                type="button"
                onClick={handleAddItem}
                className="mt-2 text-xs font-semibold text-blue-400 hover:underline"
              >
                + Add your first service
              </button>
            </div>
          )}
        </div>

        {/* Add Item & Quick Presets Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <Plus size={14} /> Add Line Item
          </button>

          <button
            type="button"
            onClick={() => setIsQuickModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-blue-500/10"
          >
            <Sparkles size={14} /> Quick Packages List
          </button>
        </div>

        {/* 1-Tap Popular Chips */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            1-Tap Add Most Popular:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "Borophine Coating (3 year)", amount: 33000 },
              { name: "Sun Film - Full Car", amount: 4000 },
              { name: "Silencer Coating", amount: 2000 },
              { name: "Underbody Anti-Rust Coating", amount: 2500 },
              { name: "Premium Foam Wash", amount: 1200 },
              { name: "Interior Deep Cleaning", amount: 3500 }
            ].map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddQuickService(preset)}
                className="text-xs bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition"
              >
                + {preset.name} (₹{preset.amount.toLocaleString('en-IN')})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DISCOUNT & TOTAL CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <DollarSign size={16} className="text-emerald-400" />
          Financials & Calculations
        </h3>

        <div className="space-y-3">
          {/* Subtotal Display */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Subtotal ({items.length} items):</span>
            <span className="font-bold text-white font-mono text-base">
              ₹{formatCurrency(subtotal)}
            </span>
          </div>

          {/* Discount Input */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-slate-300 font-medium whitespace-nowrap">
              Discount (₹):
            </label>
            <div className="w-36">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-rose-400 font-bold">
                  -₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={bill.discount === '' ? '' : bill.discount}
                  onChange={(e) => handleFieldChange('discount', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-rose-300 text-right focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Discount Shortcut Chips */}
          <div className="flex justify-end gap-1.5">
            {[0, 500, 1000, 2000, 5000, 13000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => handleFieldChange('discount', amt)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                  Number(bill.discount) === amt
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {amt === 0 ? 'No Disc' : `₹${amt.toLocaleString('en-IN')}`}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 my-2"></div>

          {/* Net Total Display */}
          <div className="flex justify-between items-center bg-slate-950/90 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                Total Invoice Amount
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                Exact format on PDF
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                ₹{formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WARRANTY / OFFER NOTE CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            Warranty & Offer Note
          </h3>
          <span className="text-[11px] text-slate-400">Appears in boxed section</span>
        </div>

        <textarea
          rows={2}
          placeholder="e.g. Borophine Wash Every 3months to avail warranty. 1 free recoating"
          value={bill.warrantyNote || ''}
          onChange={(e) => handleFieldChange('warrantyNote', e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 italic"
        />

        {/* Quick preset notes */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            "Borophine Wash Every 3months to avail warranty. 1 free recoating",
            "Ceramic Coating 9H: Quarterly maintenance wash required to retain warranty.",
            "PPF 5-Year Warranty against peeling, yellowing, and cracking.",
            "Sun Film: 3-Year replacement warranty on bubbles and discoloration."
          ].map((noteText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleFieldChange('warrantyNote', noteText)}
              className="text-[11px] bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-left truncate max-w-full"
            >
              • {noteText.substring(0, 42)}...
            </button>
          ))}
        </div>
      </div>

      {/* 5. PAYMENT STATUS CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          Payment Status & Mode
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'paid', label: 'Paid', color: 'emerald' },
            { id: 'pending', label: 'Pending', color: 'amber' },
            { id: 'partial', label: 'Partial', color: 'blue' }
          ].map(status => (
            <button
              key={status.id}
              type="button"
              onClick={() => handleFieldChange('paymentStatus', status.id)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                bill.paymentStatus === status.id
                  ? status.id === 'paid'
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : status.id === 'pending'
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                    : 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          {['UPI / GPay', 'Cash', 'Card', 'Bank Transfer'].map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => handleFieldChange('paymentMode', mode)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                bill.paymentMode === mode
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 6. STICKY BOTTOM ACTION BAR WITH RIGHT ARROW */}
      <div className="sticky bottom-16 sm:bottom-4 z-30 pt-2">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-xl font-extrabold text-white font-mono">
              ₹{formatCurrency(total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSave();
                onPreview();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-extrabold transition shadow-lg shadow-blue-600/30 active:scale-95 flex items-center gap-2"
            >
              <span>View A4 Bill</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SERVICES MODAL */}
      <QuickServiceModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onSelectService={handleAddQuickService}
      />
    </div>
  );
}
