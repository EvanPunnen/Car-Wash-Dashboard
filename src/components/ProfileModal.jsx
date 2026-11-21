import React, { useState, useRef } from 'react';
import {
  X, Camera, User, Phone, ShieldCheck, Check,
  LogOut, Sparkles, AlertCircle, Eye, UploadCloud
} from 'lucide-react';
import { saveUserProfile } from '../utils/storage';

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onLogout
}) {
  if (!isOpen || !currentUser) return null;

  const [name, setName] = useState(currentUser.name || currentUser.username || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const isGuest = currentUser.isGuest || currentUser.role?.includes('Guest');

  // Handle Photo Upload with Image Resizing to ensure lightweight storage
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      const updates = {
        name: name.trim() || currentUser.username,
        phone: phone.trim(),
        avatar: avatar
      };

      saveUserProfile(currentUser.id, updates);
      if (typeof onProfileUpdated === 'function') {
        onProfileUpdated({ ...currentUser, ...updates });
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return 'MD';
    const parts = n.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">User Profile & Access</h3>
              <p className="text-[11px] text-slate-400">Account settings and photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {successMsg && (
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Upload Center */}
          <div className="flex flex-col items-center text-center space-y-3 pt-1">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-slate-700 ring-4 ring-blue-600/20 shadow-xl overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-blue-400 font-mono tracking-wider">
                    {getInitials(name)}
                  </span>
                )}
              </div>

              {/* Upload trigger overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold transition cursor-pointer"
              >
                <Camera size={20} className="mb-0.5 text-blue-400" />
                <span>Change</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 flex items-center gap-1.5 mx-auto"
              >
                <UploadCloud size={13} />
                <span>Upload Profile Picture</span>
              </button>
              <p className="text-[10px] text-slate-500 mt-0.5">JPG or PNG (Auto-compressed for fast sync)</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isGuest}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Account Role & Privileges
              </label>
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-300 font-medium">
                  {currentUser.role || 'Member'}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full font-mono ${
                  currentUser.isOwner
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : isGuest
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {currentUser.isOwner ? 'Owner' : isGuest ? 'View Only' : 'Staff'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isGuest}
                placeholder="e.g. 9947885856"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-60 font-mono"
              />
            </div>

            {/* Access Level Card */}
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isGuest
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                : 'bg-blue-950/20 border-blue-800/40 text-blue-300'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {isGuest ? <Eye size={14} /> : <ShieldCheck size={14} />}
                <span>{isGuest ? 'Guest Access Restrictions' : 'Full Manager Permissions'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isGuest
                  ? 'You are signed in as a Guest viewer. Invoices and bay status can be inspected, but adding, editing, and deleting records is disabled.'
                  : 'Full administrative access to create invoices, advance service bay stages, track coatings warranty, and manage finances.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/60 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          {!isGuest && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-950 transition active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
