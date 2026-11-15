import React, { useState } from 'react';
import {
  Users, Plus, Phone, Share2, MapPin, Camera,
  Briefcase, Edit3, Trash2, X, Check, Shield
} from 'lucide-react';

export default function TeamView({
  teamMembers,
  onSaveMember,
  onDeleteMember
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const initialForm = {
    name: '',
    role: 'Detailer / Car Washer',
    category: 'Worker',
    phone: '',
    location: 'Kottayam',
    avatar: '',
    notes: '',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  const [form, setForm] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setForm({ ...member });
    setIsModalOpen(true);
  };

  // Handle local photo upload and convert to base64 data URL
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result;
      if (typeof b64 === 'string') {
        setForm(prev => ({ ...prev, avatar: b64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    onSaveMember({
      ...form,
      id: editingMember ? editingMember.id : `team-${Date.now()}`
    });

    setIsModalOpen(false);
  };

  const filtered = teamMembers.filter(m => {
    if (selectedCategory === 'All') return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white dark:text-white text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-blue-400" />
            Owners & Workers Directory
          </h2>
          <p className="text-xs text-slate-400">
            Contacts, profiles, and roles of car wash owners, managers, and detailers
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus size={15} /> Add Team Member
        </button>
      </div>

      {/* 2. CATEGORY TABS */}
      <div className="flex gap-2">
        {['All', 'Owner', 'Manager', 'Worker'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/70 dark:bg-slate-900/70 bg-slate-100 text-slate-400 hover:text-white border border-slate-800 dark:border-slate-800 border-slate-300'
            }`}
          >
            {cat === 'All' ? 'All Members' : `${cat}s`}
          </button>
        ))}
      </div>

      {/* 3. TEAM MEMBERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map(member => (
          <div
            key={member.id}
            className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 hover:border-slate-700 transition group"
          >
            <div className="flex items-start gap-3.5">
              {/* Profile Image / Avatar */}
              <div className="relative">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-2xl ${member.avatarColor || 'bg-blue-600'} text-white font-extrabold flex items-center justify-center text-lg shadow-md`}>
                    {(member.name || 'M').charAt(0)}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                  member.category === 'Owner'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : member.category === 'Manager'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {member.category}
                </span>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-sm sm:text-base text-white dark:text-white text-slate-900 truncate">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-blue-400 truncate">
                  {member.role}
                </p>
                {member.location && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-rose-400" /> {member.location}
                  </p>
                )}
                {member.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                    {member.notes}
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS WITH DIRECT 1-TAP CALL BUTTON (User requested) */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* 1-TAP CALL BUTTON */}
                {member.phone ? (
                  <a
                    href={`tel:${member.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20 active:scale-95"
                    title={`Call ${member.name}`}
                  >
                    <Phone size={13} /> Call
                  </a>
                ) : null}

                {/* WhatsApp */}
                {member.phone ? (
                  <a
                    href={`https://wa.me/91${member.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-green-600/20 active:scale-95"
                  >
                    <Share2 size={13} /> WhatsApp
                  </a>
                ) : null}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Edit member"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${member.name} from team directory?`)) {
                      onDeleteMember(member.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ADD / EDIT TEAM MEMBER MODAL (With Image Upload) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
              <h3 className="font-bold text-white text-base">
                {editingMember ? 'Edit Profile & Details' : 'Add Team Member / Worker'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto max-h-[80vh]">
              {/* Photo Upload with Preview */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={22} className="text-slate-500" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-block">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or selfie</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Employee Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Worker">Worker / Detailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Detailer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manarcad, Kottayam"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes & Specialization
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 9H Ceramic coating expert, foam wash lead"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
