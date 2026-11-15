import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone, X, Check, Copy, Share2, Sparkles,
  Download, ExternalLink, QrCode as QrIcon, ArrowRight,
  ShieldCheck, Zap, HardDrive, Info, Globe, Wifi, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddToMobileModal({
  isOpen,
  onClose,
  installPrompt,
  onInstallApp
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('apk'); // 'apk' | 'cloud' | 'ios'

  // Cloud HTTPS URL (Live on Cloudflare - accessible on ANY phone without Wi-Fi limits)
  const cloudHttpsUrl = 'https://spam-substantially-great-easier.trycloudflare.com';
  
  // Local network IP (Wi-Fi)
  const localNetworkUrl = 'http://192.168.1.9:5173';

  // Active URL for QR and sharing: Use cloud URL when on localhost for 100% phone compatibility!
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const mobileUrl = isLocalhost ? cloudHttpsUrl : window.location.origin;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(mobileUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code generation error', err));
    }
  }, [isOpen, mobileUrl]);

  if (!isOpen) return null;

  const handleCopyLink = (urlToCopy = mobileUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Open Mr. DODO Car Wash & Detailing Billing App:\n${mobileUrl}\n\nOr download Android APK:\n${mobileUrl}/MrDodo-CarWash.apk`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadAPK = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* 1. MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Mobile App & APK
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Install Mr. DODO on your Android phone or iPhone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="p-5 space-y-5">

          {/* 🌟 1. ANDROID APK DIRECT DOWNLOAD (USER REQUESTED) */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-4 shadow-xl space-y-3 border border-emerald-400/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Download size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    Android APK File
                    <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded font-bold">
                      1.1 MB
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-100">
                    Standalone installer file for Android phones
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950/40 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md font-bold uppercase">
                Official
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="/MrDodo-CarWash.apk"
                download="MrDodo-CarWash.apk"
                onClick={handleDownloadAPK}
                className="flex-1 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-extrabold rounded-xl text-center shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Download size={15} />
                <span>Download MrDodo-CarWash.apk</span>
              </a>
              <button
                onClick={handleShareToWhatsApp}
                className="p-2.5 bg-emerald-900/40 hover:bg-emerald-900/70 text-white border border-emerald-400/30 rounded-xl transition shadow"
                title="Send APK download link to your phone via WhatsApp"
              >
                <Share2 size={16} />
              </button>
            </div>

            <div className="text-[10px] text-emerald-100/90 bg-emerald-900/30 rounded-lg p-2 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-300 flex-shrink-0" />
              <span>Tap downloaded file on your phone ➔ Tap <strong>Install</strong>. No internet needed after installation!</span>
            </div>
          </div>

          {/* 🌟 2. LIVE CLOUD HTTPS ACCESS (Fixes "Site can't be reached") */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3.5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Globe size={14} className="text-blue-400" />
                Live Cloud Access (Any Phone / Any Network)
              </span>
              <p className="text-[11px] text-slate-400">
                Works on cellular data (4G/5G) or Wi-Fi. No firewall block.
              </p>
            </div>

            {/* QR Code Box */}
            <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code for Mobile Access"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="animate-pulse text-xs text-slate-500">Generating QR...</div>
              )}
            </div>

            {/* Live Cloud URL */}
            <div className="space-y-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-emerald-400 truncate">
                  {mobileUrl}
                </span>
                <button
                  onClick={() => handleCopyLink(mobileUrl)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share via WhatsApp */}
              <button
                onClick={handleShareToWhatsApp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Share2 size={14} />
                <span>Send to My Phone via WhatsApp</span>
              </button>
            </div>
          </div>

          {/* 🌟 3. STEP-BY-STEP INSTRUCTIONS TABS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Installation Guides
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                <button
                  onClick={() => setSelectedPlatform('apk')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPlatform === 'apk'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  APK Install
                </button>
                <button
                  onClick={() => setSelectedPlatform('cloud')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPlatform === 'cloud'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Android Chrome
                </button>
                <button
                  onClick={() => setSelectedPlatform('ios')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPlatform === 'ios'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  iPhone (iOS)
                </button>
              </div>
            </div>

            {/* APK Guide */}
            {selectedPlatform === 'apk' && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Download the APK file</p>
                    <p className="text-slate-400 text-[11px]">
                      Click <strong>Download MrDodo-CarWash.apk</strong> or send the link to your phone via WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Open the downloaded file</p>
                    <p className="text-slate-400 text-[11px]">
                      Tap on <code>MrDodo-CarWash.apk</code> in your phone notifications or Downloads folder.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">Tap "Install"</p>
                    <p className="text-slate-400 text-[11px]">
                      If Android asks to <em>"Allow installation from this source"</em>, toggle it to ON. The app will install cleanly!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Android Chrome PWA Guide */}
            {selectedPlatform === 'cloud' && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Scan QR or Open Cloud Link</p>
                    <p className="text-slate-400 text-[11px]">
                      Open <code>{cloudHttpsUrl}</code> in Chrome on your phone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Tap Chrome Menu (⋮) ➔ "Install app"</p>
                    <p className="text-slate-400 text-[11px]">
                      Chrome will automatically generate and install the official WebAPK onto your Android app drawer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Guide */}
            {selectedPlatform === 'ios' && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Open in Apple Safari</p>
                    <p className="text-slate-400 text-[11px]">
                      Open the Cloud link in Safari on your iPhone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Tap Share icon (⬆️) ➔ "Add to Home Screen"</p>
                    <p className="text-slate-400 text-[11px]">
                      Tap <strong>Add</strong> at top right. Mr. DODO icon will appear on your iPhone screen!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 4. MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Mr. DODO Detailing APK v1.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
