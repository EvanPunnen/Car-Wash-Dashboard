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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-neutral-300 text-black rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-black">User Profile & Access</h3>
              <p className="text-[11px] text-neutral-500 font-medium">Account settings and photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto bg-white">
          {successMsg && (
            <div className="p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-black font-bold flex items-center gap-2">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Upload Center */}
          <div className="flex flex-col items-center text-center space-y-3 pt-1">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-300 ring-4 ring-neutral-200 shadow-sm overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-black font-mono tracking-wider">
                    {getInitials(name)}
                  </span>
                )}
              </div>

              {/* Upload trigger overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition cursor-pointer"
              >
                <Camera size={20} className="mb-0.5 text-white" />
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
                className="text-xs font-bold text-black hover:underline underline-offset-4 flex items-center gap-1.5 mx-auto"
              >
                <UploadCloud size={13} />
                <span>Upload Profile Picture</span>
              </button>
              <p className="text-[10px] text-neutral-500 font-medium mt-0.5">JPG or PNG (Auto-compressed for fast sync)</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isGuest}
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Account Role & Privileges
              </label>
              <div className="flex items-center justify-between bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2">
                <span className="text-xs text-black font-bold">
                  {currentUser.role || 'Member'}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md font-mono bg-black text-white">
                  {currentUser.isOwner ? 'Owner' : isGuest ? 'View Only' : 'Staff'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isGuest}
                placeholder="e.g. 9947885856"
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black disabled:opacity-60 font-mono font-bold"
              />
            </div>

            {/* Access Level Card */}
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black">
                {isGuest ? <Eye size={14} /> : <ShieldCheck size={14} />}
                <span>{isGuest ? 'Guest Access Restrictions' : 'Full Manager Permissions'}</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                {isGuest
                  ? 'You are signed in as a Guest viewer. Invoices and bay status can be inspected, but adding, editing, and deleting records is disabled.'
                  : 'Full administrative access to create invoices, advance service bay stages, track coatings warranty, and manage finances.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          {!isGuest && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
