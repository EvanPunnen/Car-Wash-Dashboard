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
    <div className="space-y-5 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-white border border-neutral-300 p-4 sm:p-5 rounded-2xl shadow-sm text-black flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-sm">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-black">
              Owners & Workers Directory
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Contacts, profiles, and roles of car wash owners, managers, and master detailers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:text-black border border-neutral-300'
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
            className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-black transition group"
          >
            <div className="flex items-start gap-3.5">
              {/* Profile Image / Avatar */}
              <div className="relative">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-neutral-300 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-black text-white font-black flex items-center justify-center text-lg shadow-sm">
                    {(member.name || 'M').charAt(0)}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  member.category === 'Owner'
                    ? 'bg-black text-white'
                    : member.category === 'Manager'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-200 text-neutral-800 border border-neutral-300'
                }`}>
                  {member.category}
                </span>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-base text-black truncate">
                  {member.name}
                </h3>
                <p className="text-xs font-bold text-neutral-700 truncate">
                  {member.role}
                </p>
                {member.location && (
                  <p className="text-[11px] text-neutral-500 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-neutral-500" /> {member.location}
                  </p>
                )}
                {member.notes && (
                  <p className="text-[11px] text-neutral-600 italic mt-1 line-clamp-1">
                    {member.notes}
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS WITH DIRECT 1-TAP CALL & WHATSAPP */}
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* 1-TAP CALL BUTTON */}
                {member.phone ? (
                  <a
                    href={`tel:${member.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
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
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Share2 size={13} /> WhatsApp
                  </a>
                ) : null}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black border border-neutral-300 transition"
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
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ADD / EDIT TEAM MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-neutral-300 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-black text-black text-base">
                {editingMember ? 'Edit Profile & Details' : 'Add Team Member / Worker'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto max-h-[80vh] bg-white">
              {/* Photo Upload with Preview */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-300 flex items-center justify-center overflow-hidden">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={22} className="text-neutral-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold inline-block shadow-sm transition">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-neutral-500 font-medium mt-1">PNG, JPG or selfie</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Employee Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Role Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Worker">Worker / Detailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Detailer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
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
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-sm text-black font-mono font-bold placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manarcad, Kottayam"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Notes & Specialization
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 9H Ceramic coating expert, foam wash lead"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
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
