import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { LOGO_ICON_WHITE_BASE64, LOGO_TEXT_WHITE_BASE64 } from '../assets/logoData';
import { SYSTEM_USERS, loginUser } from '../utils/storage';

export default function LoginPage({ onLoginSuccess }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = loginUser(userId, password);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials. Please verify your User ID and Password.');
      }
      setLoading(false);
    }, 300);
  };

  const handleSelectQuickUser = (userObj) => {
    setUserId(userObj.username);
    setPassword(userObj.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 selection:bg-blue-600">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-950 border-2 border-slate-800 ring-2 ring-blue-500/20 flex items-center justify-center p-3 shadow-2xl">
            <img
              src={LOGO_ICON_WHITE_BASE64}
              alt="Mr. DODO Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-white uppercase">
              Mr. DODO Detailing
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Management & Multi-Device Billing Suite
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              User ID / Account Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Christo Riju, Evan Punnen, Manager"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Sign In to Mr. DODO</span>
              </>
            )}
          </button>
        </form>

        {/* Quick-Fill Account Selector */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Tap Account for Instant Login:
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {SYSTEM_USERS.filter(u => u.id !== 'mrdodo').map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectQuickUser(u)}
                className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                  userId === u.username
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  u.isOwner
                    ? 'bg-blue-950 text-blue-400'
                    : u.isGuest
                    ? 'bg-amber-950 text-amber-400'
                    : 'bg-emerald-950 text-emerald-400'
                }`}>
                  {u.isGuest ? 'View' : u.isOwner ? 'Owner' : 'Staff'}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
