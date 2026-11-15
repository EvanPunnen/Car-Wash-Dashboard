import React, { useState } from 'react';
import {
  X, Save, RotateCcw, Download, Upload, Store,
  FileText, ShieldCheck, Phone, MapPin, Hash, Check, Mail
} from 'lucide-react';
import { exportBackup, importBackup } from '../utils/storage';
import { DEFAULT_SHOP_SETTINGS } from '../constants/defaultData';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onReloadAll
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all shop settings and address back to original Mr. DODO defaults?')) {
      setFormData({ ...DEFAULT_SHOP_SETTINGS });
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        const result = importBackup(content);
        if (result.success) {
          setImportStatus(`Successfully restored ${result.count} bills!`);
          onReloadAll();
          setTimeout(() => setImportStatus(''), 2500);
        } else {
          setImportStatus(`Restore failed: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Store size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Shop & Invoice Settings</h3>
              <p className="text-xs text-slate-400">Customize header, address, phone numbers, and defaults</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Shop Name & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Shop Brand Name
              </label>
              <input
                type="text"
                value={formData.shopName || ''}
                onChange={(e) => handleChange('shopName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.shopSubtitle || ''}
                onChange={(e) => handleChange('shopSubtitle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin size={13} className="text-blue-400" />
              Shop Address (appears below logo)
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Phone Numbers & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Phone size={13} className="text-blue-400" />
                Contact Phone Numbers
              </label>
              <input
                type="text"
                value={formData.phones || ''}
                onChange={(e) => handleChange('phones', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Mail size={13} className="text-blue-400" />
                Business Email (printed on bill)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="mrdododetailers@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Invoice Prefix & Numbering */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Hash size={13} className="text-blue-400" />
                Invoice Prefix
              </label>
              <input
                type="text"
                value={formData.invoicePrefix || ''}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Next Invoice Number
              </label>
              <input
                type="number"
                value={formData.nextInvoiceNum || ''}
                onChange={(e) => handleChange('nextInvoiceNum', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Default Warranty Box Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <ShieldCheck size={13} className="text-blue-400" />
              Default Warranty Note (Box text)
            </label>
            <textarea
              rows={2}
              value={formData.defaultWarrantyNote || ''}
              onChange={(e) => handleChange('defaultWarrantyNote', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 italic"
            />
          </div>

          {/* Footer Text */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Footer Thank You Note
              </label>
              <input
                type="text"
                value={formData.footerThankYou || ''}
                onChange={(e) => handleChange('footerThankYou', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Footer Team Name
              </label>
              <input
                type="text"
                value={formData.footerTeam || ''}
                onChange={(e) => handleChange('footerTeam', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* BACKUP & RESTORE SECTION */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              App Storage & Backup
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={exportBackup}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Download size={14} /> Export Backup
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer">
                <Upload size={14} /> Restore JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-400 font-medium text-center">
                {importStatus}
              </p>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
          >
            {saveSuccess ? (
              <>
                <Check size={14} /> Saved!
              </>
            ) : (
              <>
                <Save size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
