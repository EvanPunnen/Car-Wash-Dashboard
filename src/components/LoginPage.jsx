import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { LOGO_ICON_BASE64 } from '../assets/logoData';
import { SYSTEM_USERS, loginUser, getUserProfiles } from '../utils/storage';

export default function LoginPage({ onLoginSuccess }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuickUser, setActiveQuickUser] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Get active profiles (including custom names or avatars saved)
  const allProfiles = getUserProfiles();
  const individualUsers = allProfiles.filter(u => u.id !== 'mrdodo');

  const executeLogin = (userToLogin, enteredPassword) => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = loginUser(userToLogin, enteredPassword);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
      setLoading(false);
    }, 200);
  };

  const handleInstantLogin = (userObj) => {
    setActiveQuickUser(userObj);
    setUserId(userObj.username);
    setPassword(userObj.password);
    // Instant 1-tap sign in for individual accounts
    executeLogin(userObj.username, userObj.password);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    executeLogin(userId, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-neutral-100 text-neutral-900 selection:bg-black selection:text-white">
      <div className="w-full max-w-xl bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Brand Header (White & Black) */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white border-2 border-neutral-900 flex items-center justify-center p-2.5 shadow-md">
            <img
              src={LOGO_ICON_BASE64}
              alt="Mr. DODO Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-0.5 rounded-full inline-block font-mono">
              Individual Staff & Owner Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight text-black uppercase">
              Mr. DODO Studio
            </h1>
            <p className="text-xs text-neutral-600 font-medium">
              Select your individual account below to sign in instantly
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 🌟 INDIVIDUAL LOGIN SECTION (Prominent, High-Contrast White & Black) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-black">
              Individual Accounts ({individualUsers.length})
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">
              Tap your card to log in
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {individualUsers.map((u) => {
              const isSelected = activeQuickUser?.id === u.id;
              const initials = (u.name || u.username || 'U')
                .split(' ')
                .map(part => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <button
                  key={u.id}
                  type="button"
                  disabled={loading}
                  onClick={() => handleInstantLogin(u)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center gap-3 group active:scale-98 ${
                    isSelected
                      ? 'bg-neutral-900 border-black text-white shadow-md ring-2 ring-black'
                      : 'bg-neutral-50 hover:bg-white border-neutral-200 hover:border-black text-neutral-900 hover:shadow-md'
                  }`}
                >
                  {/* Avatar Circle */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 border ${
                    isSelected
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-white border-black group-hover:scale-105 transition-transform'
                  } overflow-hidden shadow-sm`}>
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* Account Metadata */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-extrabold truncate ${
                      isSelected ? 'text-white' : 'text-black group-hover:text-black'
                    }`}>
                      {u.name}
                    </p>
                    <p className={`text-[10px] truncate ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-500'
                    }`}>
                      {u.role}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isSelected
                          ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                          : u.isOwner
                          ? 'bg-neutral-200 text-black border border-neutral-300'
                          : u.isGuest
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                      }`}>
                        {u.isGuest ? 'View Only' : u.isOwner ? 'Owner' : 'Staff'}
                      </span>
                    </div>
                  </div>

                  {/* Sign In Arrow Icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                    isSelected
                      ? 'bg-white text-black'
                      : 'bg-neutral-200 group-hover:bg-black group-hover:text-white text-neutral-700'
                  }`}>
                    <ArrowRight size={13} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🌟 MANUAL LOGIN ACCORDION (For custom credentials / Admin) */}
        <div className="pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => setShowManualForm(!showManualForm)}
            className="w-full py-2 flex items-center justify-between text-xs font-bold text-neutral-700 hover:text-black transition"
          >
            <span>Or Enter Credentials Manually</span>
            {showManualForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showManualForm && (
            <form onSubmit={handleManualSubmit} className="space-y-3 pt-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  User ID / Account Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="e.g. Christo Riju, Evan Punnen Jacob, Manager"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Sign In to Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-500 font-mono">
            Mr. DODO Premium Detailing Studio · Multi-Device Secure Login
          </p>
        </div>

      </div>
    </div>
  );
}
