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
        // Compute warranty inspection due (3 months after service date)
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
    <div className="space-y-5 pb-24 max-w-4xl mx-auto animate-fadeIn text-neutral-900">
      
      {/* 🌟 1. HEADER BANNER (White & Black) */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-black">
          <ShieldCheck size={22} className="text-black" />
          <h2 className="text-base sm:text-lg font-black text-black tracking-tight uppercase">
            Coatings & Service Follow-up Tracker
          </h2>
        </div>
        <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed font-medium">
          Filter every vehicle that completed Borophine Coating, Ceramic 9H/10H, PPF, or Sun Film. Track warranty checkups, customer numbers, and call owners directly with 1 tap.
        </p>
      </div>

      {/* 🌟 2. FILTER CHIPS & SEARCH (White & Black) */}
      <div className="bg-white border border-neutral-300 p-4 rounded-2xl shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by car reg number (e.g. KL 05), customer, phone, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
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

        {/* Category Filters */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedFilter === chip.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-300'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 font-bold">
          <span>
            Found <strong className="text-black font-mono">{filteredList.length}</strong> matching vehicle records
          </span>
          <span className="text-[11px] text-black">
            Active Filter: {selectedFilter}
          </span>
        </div>
      </div>

      {/* 🌟 3. VEHICLE COATINGS LIST (White & Black) */}
      <div className="space-y-3">
        {filteredList.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 hover:border-black transition group"
          >
            {/* Card Header: Vehicle Plate & Service Badge */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Number Plate Badge */}
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-black border border-neutral-300 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">
                  {record.vehicleNumber}
                </span>

                <span className="font-extrabold text-sm text-black">
                  {record.vehicleMake}
                </span>

                <span className="text-xs text-black bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-md font-bold">
                  {record.serviceName}
                </span>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-black font-mono">
                  ₹{formatCurrency(record.amount)}
                </span>
              </div>
            </div>

            {/* Customer Details Row */}
            <div className="flex items-center justify-between text-xs text-neutral-600 flex-wrap gap-2 pt-1 border-t border-neutral-200">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-black font-bold">
                  Customer: {record.customerName}
                </span>
                <span className="font-mono flex items-center gap-1.5 font-bold text-neutral-800">
                  <Phone size={12} className="text-black" /> {record.customerPhone || 'No Phone'}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar size={13} className="text-neutral-400" /> Done on {record.displayDate}
                </span>
              </div>

              {/* Warranty Checkup Tag */}
              {record.warrantyNote && (
                <div className="text-[11px] text-neutral-800 bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-bold">
                  <Clock size={12} />
                  <span>Recoating Check: {record.inspectionDueStr}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS (White & Black) */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 flex-wrap gap-2">
              <div className="text-[11px] text-neutral-500 italic truncate max-w-sm font-medium">
                {record.warrantyNote || 'Standard warranty terms applicable.'}
              </div>

              <div className="flex items-center gap-2">
                {/* 1-TAP CALL BUTTON */}
                {record.customerPhone ? (
                  <a
                    href={`tel:${record.customerPhone}`}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                    title={`Call ${record.customerName}`}
                  >
                    <Phone size={14} className="text-black" /> Call Owner
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-100 text-neutral-400 border border-neutral-200 text-xs font-semibold cursor-not-allowed"
                  >
                    No Phone
                  </button>
                )}

                {/* WhatsApp Reminder Button */}
                <button
                  type="button"
                  onClick={() => handleFollowupWhatsApp(record)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  title="Send WhatsApp Warranty Reminder"
                >
                  <Share2 size={14} /> WhatsApp
                </button>

                {/* View Bill Preview */}
                <button
                  type="button"
                  onClick={() => onSelectBillForPreview(record.bill)}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition"
                  title="View original invoice"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="text-center py-12 bg-white border border-dashed border-neutral-300 rounded-2xl p-6 shadow-sm">
            <p className="text-neutral-500 text-sm">
              No vehicles found matching the filter "{selectedFilter}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
