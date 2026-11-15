import React, { useState } from 'react';
import {
  Cloud, ExternalLink, Download, FolderArchive, HardDrive,
  CheckCircle, FileText, Smartphone, RefreshCw, Shield
} from 'lucide-react';
import { exportBackup } from '../utils/storage';
import { openGoogleDrive, saveToFileManager } from '../utils/pdfGenerator';

export default function GoogleDriveView({
  bills,
  customers,
  expenses,
  currentBill,
  settings
}) {
  const [statusMsg, setStatusMsg] = useState('');
  const googleEmail = settings?.googleDriveEmail || 'mrdododetailers@gmail.com';

  const handleOpenDrive = () => {
    openGoogleDrive(googleEmail);
  };

  const handleExportBackup = () => {
    exportBackup();
    setStatusMsg('Downloaded backup archive. Opening Google Drive to upload...');
    setTimeout(() => {
      openGoogleDrive(googleEmail);
      setStatusMsg('');
    }, 1500);
  };

  const handleSaveActiveBillToFileManager = async () => {
    try {
      setStatusMsg('Saving active bill to File Manager...');
      const res = await saveToFileManager('invoice-to-print', currentBill);
      if (!res.canceled) {
        setStatusMsg(`Saved ${res.fileName} to your device files!`);
      }
    } catch {
      setStatusMsg('Downloaded to device storage');
    } finally {
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. CLOUD BANNER */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-blue-950/70 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Cloud size={24} />
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              Google Drive Cloud Hub
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Active Sync Ready
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Central repository for <strong>Mr. DODO Detailing & Car Wash</strong> invoices, client records, and accounting backups linked with <span className="text-emerald-400 font-mono font-semibold">{googleEmail}</span>.
        </p>

        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={handleOpenDrive}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <ExternalLink size={15} /> Open Google Drive ({googleEmail})
          </button>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <FolderArchive size={15} className="text-purple-400" /> Export All Data & Upload
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. SYNC METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoices</span>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono">
            {bills.length} <span className="text-xs font-normal text-slate-400">Bills</span>
          </p>
          <span className="text-[11px] text-blue-400">Saved by vehicle number</span>
        </div>

        <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Records</span>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono">
            {customers.length} <span className="text-xs font-normal text-slate-400">Profiles</span>
          </p>
          <span className="text-[11px] text-emerald-400">Synced with vehicle CRM</span>
        </div>

        <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-4 rounded-2xl shadow-lg space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expense Vouchers</span>
          <p className="text-2xl font-extrabold text-white dark:text-white text-slate-900 font-mono">
            {expenses.length} <span className="text-xs font-normal text-slate-400">Entries</span>
          </p>
          <span className="text-[11px] text-rose-400">Accounting log</span>
        </div>
      </div>

      {/* 3. DEVICE FILE MANAGER INTEGRATION */}
      <div className="bg-slate-900/70 dark:bg-slate-900/70 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive size={18} className="text-blue-400" />
          <h3 className="font-bold text-sm text-white dark:text-white text-slate-900">
            Local Device File Manager Storage
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          You can save bills directly into your phone’s Files / Downloads folder named automatically as <span className="text-white dark:text-white text-slate-800 font-mono font-semibold">KL-05-BE-6091_Toyota-Hyrider_2026-03-07.pdf</span>.
        </p>

        <button
          onClick={handleSaveActiveBillToFileManager}
          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Download size={14} /> Save Current Bill to Device File Manager
        </button>
      </div>

      {/* 4. GOOGLE DRIVE INSTRUCTIONS */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider">
          Recommended Drive Folder Structure:
        </h4>
        <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800">
          <p>📁 Google Drive</p>
          <p>&nbsp;&nbsp;└── 📁 Mr DODO Detailing ({googleEmail})</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Invoices (2026)</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Coating Warranty Cards</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📁 Monthly Backup JSON</p>
        </div>
      </div>
    </div>
  );
}
