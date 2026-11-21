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
  onOpenManagerModal,
  isGuest = false
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
      id: `item-${Date.now()}`,
      description: service.name,
      amount: Number(service.amount) || 0
    };
    onChange({
      ...bill,
      items: [...items, newItem]
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowVehicleSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter models based on selected maker and search input
  const allFilteredModels = [];
  const searchTerm = (bill.vehicleMake || '').toLowerCase();

  Object.entries(CAR_MAKERS).forEach(([maker, models]) => {
    if (selectedMaker === 'All' || selectedMaker.toLowerCase() === maker.toLowerCase()) {
      models.forEach(model => {
        if (!searchTerm || model.toLowerCase().includes(searchTerm) || maker.toLowerCase().includes(searchTerm)) {
          allFilteredModels.push({ model, maker });
        }
      });
    }
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-24 animate-fadeIn text-neutral-900">
      
      {/* 🌟 0. FORM TOP ACTION BAR (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-md font-mono">
              {bill?.id?.startsWith('sample') ? 'Sample Bill' : (bill?.id ? 'Editing Bill' : 'New Bill')}
            </span>
            <span className="text-xs text-neutral-600 font-mono font-bold">
              {bill?.invoiceNumber || 'DODO-1042'}
            </span>
          </div>

          {/* Active Manager Pill */}
          <button
            type="button"
            onClick={onOpenManagerModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs text-black font-bold transition"
            title="Click to switch active manager"
          >
            <UserCheck size={13} className="text-black" />
            <span>{activeManager?.name || 'Manager'}</span>
            <span className="text-[10px] text-neutral-500">▼</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onNewBill}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-neutral-100 text-black border border-neutral-300 hover:bg-black hover:text-white transition flex items-center gap-1"
              title="Start a new blank bill"
            >
              <RotateCcw size={13} /> New
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-neutral-100 text-black border border-neutral-300 hover:bg-black hover:text-white transition"
              title="Load original Rev Fr. sample bill"
            >
              Sample
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {!isGuest ? (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs transition shadow-sm active:scale-95"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Bill'}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-bold">
              <Eye size={15} />
              <span>Guest View</span>
            </div>
          )}

          <button
            type="button"
            onClick={onPreview}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black border border-neutral-300 font-extrabold text-xs transition active:scale-95 shadow-sm"
            title="View standard A4 invoice"
          >
            <Eye size={15} className="text-black" />
            <span>View A4</span>
            <ArrowRight size={14} className="text-neutral-500" />
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black border border-neutral-300 font-extrabold text-xs transition active:scale-95 shadow-sm"
          >
            <FileDown size={15} className="text-black" />
            <span>Get PDF</span>
          </button>

          <button
            type="button"
            onClick={onShareWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-sm active:scale-95"
          >
            <Share2 size={15} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 🌟 1. CUSTOMER & VEHICLE DETAILS CARD (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <h3 className="font-extrabold text-black text-sm uppercase tracking-wide flex items-center gap-2">
            <User size={16} className="text-black" />
            Customer & Vehicle Information
          </h3>
          <span className="text-[11px] text-neutral-500 font-medium">Required on Bill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Title + Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Customer Name
            </label>
            <div className="flex gap-2">
              <select
                value={bill.titlePrefix || 'Mr:'}
                onChange={(e) => handleFieldChange('titlePrefix', e.target.value)}
                className="bg-white border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
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
                className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="tel"
                placeholder="e.g. 9061367927"
                value={bill.customerPhone || ''}
                onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono font-medium"
              />
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Vehicle Registration No.
            </label>
            <div className="relative">
              <Car size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="e.g. KL 05 BE 6091"
                value={bill.vehicleNumber || ''}
                onChange={(e) => handleFieldChange('vehicleNumber', e.target.value.toUpperCase())}
                className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-sm text-black uppercase placeholder-neutral-400 focus:outline-none focus:border-black font-mono font-bold tracking-wider"
              />
            </div>
          </div>

          {/* Vehicle Make / Model with Car Maker Suggestions */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-800">
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
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
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
                    className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap font-bold transition ${
                      selectedMaker === makerName
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-300'
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
                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition flex-shrink-0 shadow-sm"
                title="Scroll more car makers to the right"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Smart Suggestions Dropdown */}
            {showVehicleSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-neutral-100">
                <div className="p-2 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-600 border-b border-neutral-200 font-bold">
                  <span>Showing {allFilteredModels.length} models for {selectedMaker}</span>
                  <button
                    type="button"
                    onClick={() => setShowVehicleSuggestions(false)}
                    className="text-neutral-500 hover:text-black"
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
                    className="w-full text-left px-3.5 py-2.5 text-xs text-neutral-900 hover:bg-neutral-100 transition flex items-center justify-between"
                  >
                    <span className="font-bold">{model}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-300 font-mono font-bold">
                      {maker}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date & Invoice Number Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-black" />
              Invoice Date
            </label>
            <input
              type="date"
              value={bill.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black font-medium"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Prints as: <span className="text-black font-bold">{bill.displayDate || '7 March 2026'}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-black" />
              Invoice Ref Number
            </label>
            <input
              type="text"
              placeholder="e.g. DODO-1041"
              value={bill.invoiceNumber || ''}
              onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black font-mono font-bold placeholder-neutral-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* 🌟 2. SERVICES & LINE ITEMS CARD (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h3 className="font-extrabold text-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-black" />
              Bill Services & Packages
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Numbered description and amount on the invoice</p>
          </div>

          <button
            type="button"
            onClick={() => setIsQuickModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold transition shadow-sm"
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
              className="flex items-center gap-2 bg-neutral-50 border border-neutral-300 p-2.5 rounded-xl"
            >
              <span className="w-6 text-center text-xs font-bold text-neutral-500">
                {index + 1}.
              </span>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Service description (e.g. Borophine Coating 3 year)"
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full bg-transparent border-0 text-sm font-bold text-black placeholder-neutral-400 focus:outline-none"
                />
              </div>

              <div className="w-28 sm:w-32">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={item.amount === '' ? '' : item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-6 pr-2 py-1.5 text-sm font-black text-black text-right placeholder-neutral-400 focus:outline-none focus:border-black font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-6 border border-dashed border-neutral-300 rounded-xl">
              <p className="text-xs text-neutral-500 font-medium">No services added yet</p>
              <button
                type="button"
                onClick={handleAddItem}
                className="mt-2 text-xs font-bold text-black hover:underline"
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
            className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition border border-neutral-300"
          >
            <Plus size={14} /> Add Line Item
          </button>

          <button
            type="button"
            onClick={() => setIsQuickModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
          >
            <Sparkles size={14} /> Quick Packages List
          </button>
        </div>

        {/* 1-Tap Popular Chips */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-2">
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
                className="text-xs bg-neutral-100 border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-neutral-800 px-2.5 py-1.5 rounded-lg transition font-semibold"
              >
                + {preset.name} (₹{preset.amount.toLocaleString('en-IN')})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 3. DISCOUNT & TOTAL CARD (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-black text-sm uppercase tracking-wide flex items-center gap-2 border-b border-neutral-200 pb-3">
          <DollarSign size={16} className="text-black" />
          Financials & Calculations
        </h3>

        <div className="space-y-3">
          {/* Subtotal Display */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600 font-medium">Subtotal ({items.length} items):</span>
            <span className="font-black text-black font-mono text-base">
              ₹{formatCurrency(subtotal)}
            </span>
          </div>

          {/* Discount Input */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-neutral-800 font-bold whitespace-nowrap">
              Discount (₹):
            </label>
            <div className="w-36">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                  -₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={bill.discount === '' ? '' : bill.discount}
                  onChange={(e) => handleFieldChange('discount', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-3 py-2 text-sm font-black text-black text-right focus:outline-none focus:border-black font-mono"
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
                className={`text-[11px] px-2 py-0.5 rounded-md border transition font-bold ${
                  Number(bill.discount) === amt
                    ? 'bg-black text-white border-black'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:text-black'
                }`}
              >
                {amt === 0 ? 'No Disc' : `₹${amt.toLocaleString('en-IN')}`}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 my-2"></div>

          {/* Net Total Display */}
          <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl border-2 border-black shadow-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-600 font-bold block">
                Total Invoice Amount
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                Single-page pristine A4 PDF format
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                ₹{formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 4. WARRANTY / OFFER NOTE CARD (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
          <h3 className="font-extrabold text-black text-sm uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck size={16} className="text-black" />
            Warranty & Offer Note
          </h3>
          <span className="text-[11px] text-neutral-500">Appears in boxed section</span>
        </div>

        <textarea
          rows={2}
          placeholder="e.g. Borophine Wash Every 3months to avail warranty. 1 free recoating"
          value={bill.warrantyNote || ''}
          onChange={(e) => handleFieldChange('warrantyNote', e.target.value)}
          className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black italic font-medium"
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
              className="text-[11px] bg-neutral-100 border border-neutral-300 hover:border-black text-neutral-800 px-2.5 py-1 rounded-lg text-left truncate max-w-full font-medium"
            >
              • {noteText.substring(0, 42)}...
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 5. PAYMENT STATUS CARD (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-black text-sm uppercase tracking-wide flex items-center gap-2 border-b border-neutral-200 pb-2.5">
          <CheckCircle2 size={16} className="text-black" />
          Payment Status & Mode
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'paid', label: 'Paid' },
            { id: 'pending', label: 'Pending' },
            { id: 'partial', label: 'Partial' }
          ].map(status => (
            <button
              key={status.id}
              type="button"
              onClick={() => handleFieldChange('paymentStatus', status.id)}
              className={`py-2 px-3 rounded-xl text-xs font-black border transition ${
                bill.paymentStatus === status.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
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
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-bold ${
                bill.paymentMode === mode
                  ? 'bg-black text-white border-black'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:text-black'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 6. STICKY BOTTOM ACTION BAR (White & Black) */}
      <div className="sticky bottom-16 sm:bottom-4 z-30 pt-2">
        <div className="bg-white/95 border border-neutral-300 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-xl font-black text-black font-mono">
              ₹{formatCurrency(total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isGuest && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold border border-neutral-300 transition flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isGuest) onSave();
                onPreview();
              }}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-black transition shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span>View A4 Bill</span>
              <ArrowRight size={15} />
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
