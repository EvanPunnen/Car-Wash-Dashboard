import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { LOGO_ICON_WHITE_BASE64, LOGO_TEXT_WHITE_BASE64 } from '../assets/logoData';

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
      const cleanId = (userId || '').trim().toLowerCase();
      const cleanPwd = (password || '').trim();

      if (cleanId === 'mrdodo' && cleanPwd === 'dodo@123') {
        onLoginSuccess({
          userId: 'Mrdodo',
          role: 'Administrator / Owner',
          loginTime: new Date().toISOString()
        });
      } else {
        setError('Invalid User ID or Password. (Required: Mrdodo / dodo@123)');
      }
      setLoading(false);
    }, 350);
  };

  const handleQuickFill = () => {
    setUserId('Mrdodo');
    setPassword('dodo@123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 selection:bg-blue-600">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2.5 shadow-2xl">
            <img
              src={LOGO_ICON_WHITE_BASE64}
              alt="Mr. DODO Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>

          <div className="space-y-1">
            <img
              src={LOGO_TEXT_WHITE_BASE64}
              alt="Mr. DODO PREMIUM DETAILING & CAR WASH"
              className="h-8 w-auto object-contain mx-auto filter drop-shadow"
            />
            <p className="text-xs text-slate-400 font-medium">
              Management & Detailing Billing Suite
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Manager / Owner User ID
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Enter User ID (e.g. Mrdodo)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password (e.g. dodo@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials Reminder */}
        <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Default Login:&nbsp;
            <span className="font-mono text-blue-400 font-bold">User: Mrdodo</span>&nbsp;|&nbsp;
            <span className="font-mono text-emerald-400 font-bold">Pswd: dodo@123</span>
          </p>

          <button
            type="button"
            onClick={handleQuickFill}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 decoration-blue-500/50"
          >
            Click here to Auto-Fill Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
