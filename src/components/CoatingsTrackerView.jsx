import React, { useState } from 'react';
import {
  ShieldCheck, Search, Phone, Share2, Car, Calendar,
  CheckCircle2, Clock, Eye, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../utils/storage';

export default function CoatingsTrackerView({
  bills,
  onSelectBillForPreview,
  settings
}) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filterChips = [
    { id: 'All', label: 'All Services' },
    { id: 'Borophine', label: 'Borophine Coating' },
    { id: 'Ceramic', label: 'Ceramic Coating' },
    { id: 'PPF', label: 'PPF Film' },
    { id: 'Sun Film', label: 'Sun Film / Tint' },
    { id: 'Silencer', label: 'Silencer Coating' },
    { id: 'Underbody', label: 'Underbody Coating' },
    { id: 'Wash', label: 'Foam Wash & Detailing' }
  ];

  // Extract all matching vehicle service occurrences from bills
  const vehicleServices = [];

  bills.forEach(bill => {
    (bill.items || []).forEach(item => {
      const desc = item.description || '';
      const descLower = desc.toLowerCase();

      let matched = false;
      if (selectedFilter === 'All') matched = true;
      else if (selectedFilter === 'Borophine' && descLower.includes('borophine')) matched = true;
      else if (selectedFilter === 'Ceramic' && descLower.includes('ceramic')) matched = true;
      else if (selectedFilter === 'PPF' && (descLower.includes('ppf') || descLower.includes('protection film'))) matched = true;
      else if (selectedFilter === 'Sun Film' && (descLower.includes('film') || descLower.includes('tint'))) matched = true;
      else if (selectedFilter === 'Silencer' && descLower.includes('silencer')) matched = true;
      else if (selectedFilter === 'Underbody' && descLower.includes('underbody')) matched = true;
      else if (selectedFilter === 'Wash' && (descLower.includes('wash') || descLower.includes('clean'))) matched = true;

      if (matched) {
        // Compute warranty inspection due (e.g. 3 months after service date)
        const sDate = new Date(bill.date || Date.now());
        const inspectionDate = new Date(sDate);
        inspectionDate.setMonth(inspectionDate.getMonth() + 3);

        const isDue = new Date() > inspectionDate;

        vehicleServices.push({
          id: `${bill.id}-${item.id || Math.random()}`,
          billId: bill.id,
          bill,
          serviceName: desc,
          amount: item.amount,
          vehicleNumber: bill.vehicleNumber || 'NO REG',
          vehicleMake: bill.vehicleMake || 'Vehicle',
          customerName: `${bill.titlePrefix || 'Mr:'} ${bill.customerName || 'Customer'}`.trim(),
          customerPhone: bill.customerPhone || '',
          serviceDate: bill.date,
          displayDate: bill.displayDate || formatDisplayDate(bill.date),
          warrantyNote: bill.warrantyNote,
          inspectionDueStr: formatDisplayDate(inspectionDate.toISOString().split('T')[0]),
          isWarrantyDue: isDue && descLower.includes('coating')
        });
      }
    });
  });

  // Filter by search query
  const filteredList = vehicleServices.filter(vs => {
    const term = searchTerm.toLowerCase();
    return (
      vs.vehicleNumber.toLowerCase().includes(term) ||
      vs.vehicleMake.toLowerCase().includes(term) ||
      vs.customerName.toLowerCase().includes(term) ||
      vs.customerPhone.includes(term) ||
      vs.serviceName.toLowerCase().includes(term)
    );
  });

  // WhatsApp Follow-up Message
  const handleFollowupWhatsApp = (vs) => {
    const phone = vs.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const message = `Hello ${vs.customerName},
Greetings from *${settings?.shopName || 'Mr. DODO PREMIUM DETAILING & CAR WASH'}* (Manarcad, Kottayam).

This is a courtesy check for your *${vs.vehicleMake} (${vs.vehicleNumber})* which had *${vs.serviceName}* with us on ${vs.displayDate}.

📌 As per your warranty schedule, your 3-month inspection and maintenance recoating is due.
📞 Please call us at ${settings?.phones || '8138037450'} to book your complimentary maintenance slot!`;

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-blue-400">
          <ShieldCheck size={22} />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Coatings & Service Follow-up Tracker
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Filter every vehicle that completed Borophine Coating, Ceramic 9H/10H, PPF, or Sun Film. Track warranty checkups, customer numbers, and call owners directly with 1 tap.
        </p>
      </div>

      {/* 2. FILTER CHIPS & SEARCH */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by car reg number (e.g. KL 05), customer, phone, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

        {/* Category Filters */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedFilter === chip.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Found <strong className="text-white font-mono">{filteredList.length}</strong> matching vehicle records
          </span>
          <span className="text-[11px] text-blue-400 font-medium">
            Active Filter: {selectedFilter}
          </span>
        </div>
      </div>

      {/* 3. VEHICLE COATINGS LIST */}
      <div className="space-y-3">
        {filteredList.map((record) => (
          <div
            key={record.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5 hover:border-slate-700 transition group"
          >
            {/* Card Header: Vehicle Plate & Service Badge */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Number Plate Badge */}
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">
                  {record.vehicleNumber}
                </span>

                <span className="font-bold text-sm text-white">
                  {record.vehicleMake}
                </span>

                <span className="text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-0.5 rounded-md font-semibold">
                  {record.serviceName}
                </span>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                  ₹{formatCurrency(record.amount)}
                </span>
              </div>
            </div>

            {/* Customer Details Row */}
            <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-slate-200 font-semibold">
                  Customer: {record.customerName}
                </span>
                <span className="font-mono flex items-center gap-1.5">
                  <Phone size={12} className="text-blue-400" /> {record.customerPhone || 'No Phone'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-500" /> Done on {record.displayDate}
                </span>
              </div>

              {/* Warranty Checkup Tag */}
              {record.warrantyNote && (
                <div className="text-[11px] text-amber-300 bg-slate-950 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock size={12} />
                  <span>Recoating Check: {record.inspectionDueStr}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS WITH DIRECT 1-TAP CALL BUTTON (User specifically requested) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2">
              <div className="text-[11px] text-slate-500 italic truncate max-w-sm">
                {record.warrantyNote || 'Standard warranty terms applicable.'}
              </div>

              <div className="flex items-center gap-2">
                {/* 1-TAP CALL BUTTON */}
                {record.customerPhone ? (
                  <a
                    href={`tel:${record.customerPhone}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                    title={`Call ${record.customerName}`}
                  >
                    <Phone size={14} className="text-emerald-400" /> Call Owner
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                  >
                    No Phone
                  </button>
                )}

                {/* WhatsApp Reminder Button */}
                <button
                  type="button"
                  onClick={() => handleFollowupWhatsApp(record)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  title="Send WhatsApp Warranty Reminder"
                >
                  <Share2 size={14} /> WhatsApp
                </button>

                {/* View Bill Preview */}
                <button
                  type="button"
                  onClick={() => onSelectBillForPreview(record.bill)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="View original invoice"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">
              No vehicles found matching the filter "{selectedFilter}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
