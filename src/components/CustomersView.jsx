import React, { useState } from 'react';
import {
  Users, Search, Plus, Phone, Share2, MapPin, Car,
  Calendar, ShieldCheck, Edit3, Trash2, X, Check, FilePlus
} from 'lucide-react';
import { TITLE_PREFIXES } from '../constants/defaultData';
import { formatCurrency, formatDisplayDate } from '../utils/storage';

export default function CustomersView({
  customers,
  onSaveCustomer,
  onDeleteCustomer,
  onCreateBillForCustomer
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const initialForm = {
    titlePrefix: 'Mr:',
    name: '',
    phone: '',
    location: '',
    vehicleMake: '',
    vehicleNumber: '',
    lastService: '',
    totalSpent: 0,
    visitsCount: 1,
    notes: '',
    warrantyActive: true
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSaveCustomer({
      ...formData,
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`
    });

    setIsModalOpen(false);
  };

  const filtered = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term) ||
      (c.vehicleNumber || '').toLowerCase().includes(term) ||
      (c.vehicleMake || '').toLowerCase().includes(term) ||
      (c.location || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. HEADER & SEARCH */}
      <div className="bg-white border border-neutral-300 p-4 sm:p-5 rounded-2xl shadow-sm text-black space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black">
                Customer CRM & Vehicle Directory
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Manage client contact details, vehicle models, locations, and service records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, car model, reg number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-100 border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium transition"
          />
        </div>

        <div className="text-xs text-neutral-500 font-medium flex items-center justify-between">
          <span>Total Customers: <strong className="text-black font-mono font-bold">{filtered.length}</strong></span>
          <span className="text-[11px] text-neutral-400">Instant lookup & WhatsApp ready</span>
        </div>
      </div>

      {/* 2. CUSTOMERS LIST */}
      <div className="space-y-3">
        {filtered.map(cust => (
          <div
            key={cust.id}
            className="bg-white border border-neutral-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 hover:border-black transition"
          >
            {/* Header: Customer Name & Vehicle Badge */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base text-black">
                    {cust.titlePrefix || 'Mr:'} {cust.name}
                  </h3>
                  {cust.vehicleNumber && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-neutral-100 text-black border border-neutral-300 font-mono text-xs font-black uppercase tracking-wider">
                      {cust.vehicleNumber}
                    </span>
                  )}
                  {cust.vehicleMake && (
                    <span className="text-xs text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-lg font-bold">
                      {cust.vehicleMake}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1.5 flex-wrap">
                  {cust.location && (
                    <span className="flex items-center gap-1 text-neutral-700 font-medium">
                      <MapPin size={13} className="text-neutral-500" /> {cust.location}
                    </span>
                  )}
                  {cust.phone && (
                    <span className="flex items-center gap-1 font-mono font-bold text-neutral-800">
                      📞 {cust.phone}
                    </span>
                  )}
                  <span className="text-neutral-500 font-medium">
                    Visits: <strong className="text-black font-mono font-bold">{cust.visitsCount || 1}</strong>
                  </span>
                </div>
              </div>

              {/* Total Spent */}
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Total Billed</span>
                <span className="text-base sm:text-lg font-black text-black font-mono">
                  ₹{formatCurrency(cust.totalSpent || 0)}
                </span>
              </div>
            </div>

            {/* Service & Notes */}
            {(cust.lastService || cust.notes) && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-700 space-y-1">
                {cust.lastService && (
                  <p>
                    <strong className="text-neutral-900 font-bold">Last Service:</strong> {cust.lastService}
                  </p>
                )}
                {cust.notes && (
                  <p className="text-neutral-600 italic">
                    <strong className="text-neutral-800 font-bold not-italic">Notes:</strong> {cust.notes}
                  </p>
                )}
              </div>
            )}

            {/* ACTION BUTTONS WITH DIRECT 1-TAP CALL & BILL CREATION */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* 1-TAP CALL BUTTON */}
                {cust.phone ? (
                  <a
                    href={`tel:${cust.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Phone size={13} /> Call
                  </a>
                ) : null}

                {/* WhatsApp */}
                {cust.phone ? (
                  <a
                    href={`https://wa.me/91${cust.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Share2 size={13} /> WhatsApp
                  </a>
                ) : null}

                {/* Create Bill for this Customer */}
                <button
                  type="button"
                  onClick={() => onCreateBillForCustomer(cust)}
                  className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                >
                  <FilePlus size={13} /> + Create Bill
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cust)}
                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black border border-neutral-300 transition"
                  title="Edit customer details"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete customer profile for ${cust.name}?`)) {
                      onDeleteCustomer(cust.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                  title="Delete customer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white border border-neutral-300 rounded-2xl p-6 shadow-sm">
            <Users size={36} className="mx-auto text-neutral-400 mb-2" />
            <p className="text-neutral-500 font-medium text-sm">No customer records found.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              + Add First Customer
            </button>
          </div>
        )}
      </div>

      {/* 3. ADD / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-neutral-300 w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-black text-black text-base">
                {editingCustomer ? 'Edit Customer Info' : 'Add New Customer Profile'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-white">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Customer Name
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.titlePrefix || 'Mr:'}
                    onChange={(e) => setFormData({ ...formData, titlePrefix: e.target.value })}
                    className="bg-neutral-100 border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
                  >
                    {TITLE_PREFIXES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. Rev Fr. A V Varghese"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="flex-1 bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9061367927"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manarcad, Kottayam"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Car Make & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota Hyryder"
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KL 05 BE 6091"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black uppercase placeholder-neutral-400 focus:outline-none focus:border-black font-mono font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Services Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. Borophine Coating 3-Year, Sun Film Full Car"
                  value={formData.lastService}
                  onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Customer Notes & Warranty
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1 free recoating valid every 3 months"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl p-3 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition"
                >
                  {editingCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
