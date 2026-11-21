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
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const [selectedPlatform, setSelectedPlatform] = useState(isIOS ? 'ios' : 'apk');

  // Permanent 24/7 Web App hosted on GitHub Pages (Always online, no laptop or server needed)
  const permanentWebUrl = 'https://evanpunnen.github.io/Car-Wash-Dashboard/';
  
  // Direct APK download from official GitHub release
  const directApkUrl = 'https://github.com/EvanPunnen/Car-Wash-Dashboard/releases/download/release-apk-latest/MrDodo-CarWash.apk';

  // Active URL for QR and sharing: Always point to permanent 24/7 URL for 100% phone compatibility!
  const mobileUrl = permanentWebUrl;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(mobileUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
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
      `Open Mr. DODO Car Wash & Detailing Billing App:\n${permanentWebUrl}\n\nOr download Android APK:\n${directApkUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadAPK = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-neutral-300 text-black rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* 1. MODAL HEADER */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-neutral-50/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-black flex items-center gap-2">
                Mobile App & APK
                <span className="text-[10px] bg-neutral-100 text-black border border-neutral-300 px-2 py-0.5 rounded-md font-bold uppercase font-mono">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Install Mr. DODO on your Android phone or iPhone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="p-5 space-y-5 bg-white">

          {/* 🌟 1. IPHONE (iOS) SPECIAL INSTALLATION BANNER */}
          {isIOS ? (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  🍎
                </div>
                <div>
                  <h4 className="font-black text-sm text-black">
                    iPhone (iOS) Installation
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Apple iOS does not use APK files. Install via Safari in 2 steps:
                  </p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">1</span>
                  <p className="text-neutral-700">
                    Tap the <strong>Share button (⬆️)</strong> at the bottom of your Safari screen.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">2</span>
                  <p className="text-neutral-700">
                    Scroll down and tap <strong>"Add to Home Screen" (➕)</strong> ➔ Tap <strong>Add</strong>.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-black bg-neutral-100 border border-neutral-300 rounded-lg p-2.5 flex items-center gap-1.5 font-bold">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>Mr. DODO icon will appear on your iPhone screen and run full-screen!</span>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
                    <Download size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-black flex items-center gap-1.5">
                      Android APK File
                      <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        1.1 MB
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Standalone installer file for Android phones
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-neutral-100 text-black border border-neutral-300 px-2 py-0.5 rounded-md font-bold uppercase">
                  Official
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={directApkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDownloadAPK}
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl text-center shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Download size={15} />
                  <span>Download MrDodo-CarWash.apk</span>
                </a>
                <button
                  onClick={handleShareToWhatsApp}
                  className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 rounded-xl transition shadow-sm"
                  title="Send link to phone via WhatsApp"
                >
                  <Share2 size={16} />
                </button>
              </div>

              <div className="text-[10px] text-neutral-600 bg-white border border-neutral-200 rounded-lg p-2.5 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-black flex-shrink-0" />
                <span>Tap downloaded file on your phone ➔ Tap <strong>Install</strong>. Runs offline seamlessly!</span>
              </div>
            </div>
          )}

          {/* 🌟 2. LIVE CLOUD HTTPS ACCESS */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-center space-y-3.5">
            <div className="space-y-1">
              <span className="text-xs font-black text-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Globe size={14} />
                Live Cloud Access (Any Phone / Any Network)
              </span>
              <p className="text-[11px] text-neutral-500 font-medium">
                Works on cellular data (4G/5G) or Wi-Fi. 24/7 Always online.
              </p>
            </div>

            {/* QR Code Box */}
            <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl shadow-sm border border-neutral-300 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code for Mobile Access"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="animate-pulse text-xs text-neutral-400 font-medium">Generating QR...</div>
              )}
            </div>

            {/* Live Cloud URL */}
            <div className="space-y-2">
              <div className="bg-white border border-neutral-300 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-black truncate">
                  {mobileUrl}
                </span>
                <button
                  onClick={() => handleCopyLink(mobileUrl)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold rounded-lg border border-neutral-300 flex items-center gap-1 transition flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      <span>Copied</span>
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
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Share2 size={14} />
                <span>Send to My Phone via WhatsApp</span>
              </button>
            </div>
          </div>

          {/* 🌟 3. STEP-BY-STEP INSTRUCTIONS TABS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Installation Guides
              </span>
              <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-300 text-[11px] font-bold">
                <button
                  onClick={() => setSelectedPlatform('apk')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPlatform === 'apk'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  APK Install
                </button>
                <button
                  onClick={() => setSelectedPlatform('cloud')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPlatform === 'cloud'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Android Chrome
                </button>
                <button
                  onClick={() => setSelectedPlatform('ios')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPlatform === 'ios'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  iPhone (iOS)
                </button>
              </div>
            </div>

            {/* APK Guide */}
            {selectedPlatform === 'apk' && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2.5 text-xs text-neutral-800">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-black">Download the APK file</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Click <strong>Download MrDodo-CarWash.apk</strong> or send the link to your phone via WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-black">Open the downloaded file</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Tap on <code>MrDodo-CarWash.apk</code> in your phone notifications or Downloads folder.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-black">Tap "Install"</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      If Android asks to <em>"Allow installation from this source"</em>, toggle it to ON. The app will install cleanly!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Android Chrome PWA Guide */}
            {selectedPlatform === 'cloud' && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2.5 text-xs text-neutral-800">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-black">Scan QR or Open Cloud Link</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Open <code>{permanentWebUrl}</code> in Chrome on your phone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-black">Tap Chrome Menu (⋮) ➔ "Install app"</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Chrome will automatically generate and install the official WebAPK onto your Android app drawer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Guide */}
            {selectedPlatform === 'ios' && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2.5 text-xs text-neutral-800">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-black">Open in Apple Safari</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Open the Cloud link in Safari on your iPhone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-black">Tap Share icon (⬆️) ➔ "Add to Home Screen"</p>
                    <p className="text-neutral-500 text-[11px] font-medium">
                      Tap <strong>Add</strong> at top right. Mr. DODO icon will appear on your iPhone screen!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 4. MODAL FOOTER */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono font-medium">
            Mr. DODO Detailing v1.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
