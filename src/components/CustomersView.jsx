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
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. HEADER & SEARCH */}
      <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white dark:text-white text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-blue-400" />
              Customer CRM & Vehicle Directory
            </h2>
            <p className="text-xs text-slate-400">
              Manage client contact details, vehicle models, locations, and service records
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus size={15} /> Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, car model, reg number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 dark:bg-slate-950 bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white dark:text-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Customers:&nbsp;<strong className="text-white dark:text-white text-slate-900 font-mono">{filtered.length}</strong>
        </div>
      </div>

      {/* 2. CUSTOMERS LIST */}
      <div className="space-y-3">
        {filtered.map(cust => (
          <div
            key={cust.id}
            className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 hover:border-slate-700 transition group"
          >
            {/* Header: Customer Name & Vehicle Badge */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-white dark:text-white text-slate-900">
                    {cust.titlePrefix || 'Mr:'} {cust.name}
                  </h3>
                  {cust.vehicleNumber && (
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-xs font-bold uppercase">
                      {cust.vehicleNumber}
                    </span>
                  )}
                  {cust.vehicleMake && (
                    <span className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                      {cust.vehicleMake}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                  {cust.location && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin size={13} className="text-rose-400" /> {cust.location}
                    </span>
                  )}
                  {cust.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      📞 {cust.phone}
                    </span>
                  )}
                  <span className="text-slate-400">
                    Visits: <strong className="text-white dark:text-white text-slate-900 font-mono">{cust.visitsCount || 1}</strong>
                  </span>
                </div>
              </div>

              {/* Total Spent */}
              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Total Billed</span>
                <span className="text-base sm:text-lg font-bold text-white dark:text-white text-slate-900 font-mono">
                  ₹{formatCurrency(cust.totalSpent || 0)}
                </span>
              </div>
            </div>

            {/* Service & Notes */}
            <div className="bg-slate-950/70 dark:bg-slate-950/70 bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 border-slate-200 rounded-xl p-3 text-xs text-slate-300 space-y-1">
              {cust.lastService && (
                <p>
                  <strong className="text-slate-400">Last Service:</strong> {cust.lastService}
                </p>
              )}
              {cust.notes && (
                <p className="text-slate-400 italic">
                  <strong>Notes:</strong> {cust.notes}
                </p>
              )}
            </div>

            {/* ACTION BUTTONS WITH DIRECT 1-TAP CALL & BILL CREATION */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* 1-TAP CALL BUTTON */}
                {cust.phone ? (
                  <a
                    href={`tel:${cust.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20 active:scale-95"
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
                    className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-green-600/20 active:scale-95"
                  >
                    <Share2 size={13} /> WhatsApp
                  </a>
                ) : null}

                {/* Create Bill for this Customer */}
                <button
                  type="button"
                  onClick={() => onCreateBillForCustomer(cust)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FilePlus size={13} /> Create Bill
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cust)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
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
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete customer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">No customer records found.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition"
            >
              + Add Customer
            </button>
          </div>
        )}
      </div>

      {/* 3. ADD / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
              <h3 className="font-bold text-white text-base">
                {editingCustomer ? 'Edit Customer Info' : 'Add New Customer Profile'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Name
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.titlePrefix || 'Mr:'}
                    onChange={(e) => setFormData({ ...formData, titlePrefix: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none"
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
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9061367927"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manarcad, Kottayam"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Car Make & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota Hyrider"
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KL 05 BE 6091"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Services Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. Borophine Coating 3-Year, Sun Film Full Car"
                  value={formData.lastService}
                  onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Notes & Warranty
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1 free recoating valid every 3 months"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
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
