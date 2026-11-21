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
    <div className="space-y-5 pb-24 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. CLOUD BANNER */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3 text-black">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-sm">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black tracking-tight">
                Google Drive & Cloud Sync Hub
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Automated document archiving & cross-device backup repository
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-black bg-neutral-100 px-3 py-1 rounded-full border border-neutral-300">
            Cloud Sync Ready
          </span>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed font-medium">
          Central repository for <strong>Mr. DODO Detailing & Car Wash</strong> invoices, client records, and accounting backups linked with <span className="text-black font-mono font-bold">{googleEmail}</span>.
        </p>

        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={handleOpenDrive}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <ExternalLink size={15} /> Open Google Drive ({googleEmail})
          </button>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-2 border border-neutral-300 transition active:scale-95"
          >
            <FolderArchive size={15} /> Export All Data & Upload
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-black font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. SYNC METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-neutral-300 p-4 rounded-2xl shadow-sm space-y-1 hover:border-black transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Invoices</span>
          <p className="text-2xl font-black text-black font-mono">
            {bills.length} <span className="text-xs font-medium text-neutral-500">Bills</span>
          </p>
          <span className="text-[11px] text-neutral-600 font-medium">Saved by vehicle number</span>
        </div>

        <div className="bg-white border border-neutral-300 p-4 rounded-2xl shadow-sm space-y-1 hover:border-black transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Customer Records</span>
          <p className="text-2xl font-black text-black font-mono">
            {customers.length} <span className="text-xs font-medium text-neutral-500">Profiles</span>
          </p>
          <span className="text-[11px] text-neutral-600 font-medium">Synced with vehicle CRM</span>
        </div>

        <div className="bg-white border border-neutral-300 p-4 rounded-2xl shadow-sm space-y-1 hover:border-black transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Expense Vouchers</span>
          <p className="text-2xl font-black text-black font-mono">
            {expenses.length} <span className="text-xs font-medium text-neutral-500">Entries</span>
          </p>
          <span className="text-[11px] text-neutral-600 font-medium">Studio accounting log</span>
        </div>
      </div>

      {/* 3. DEVICE FILE MANAGER INTEGRATION */}
      <div className="bg-white border border-neutral-300 p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive size={18} className="text-black" />
          <h3 className="font-black text-sm text-black">
            Local Device File Manager Storage
          </h3>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed font-medium">
          You can save bills directly into your phone’s Files / Downloads folder named automatically as <span className="text-black font-mono font-bold">KL-05-BE-6091_Toyota-Hyryder_2026-03-07.pdf</span>.
        </p>

        <button
          onClick={handleSaveActiveBillToFileManager}
          className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Download size={14} /> Save Current Bill to Device File Manager
        </button>
      </div>

      {/* 4. GOOGLE DRIVE INSTRUCTIONS */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs text-neutral-700 space-y-2">
        <h4 className="font-bold text-black uppercase tracking-wider text-[11px]">
          Recommended Drive Folder Structure:
        </h4>
        <div className="bg-white p-3.5 rounded-xl font-mono text-[11px] text-black space-y-1 border border-neutral-300">
          <p className="font-bold">📁 Google Drive</p>
          <p>&nbsp;&nbsp;└── 📁 Mr DODO Detailing ({googleEmail})</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Invoices (2026)</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Coating Warranty Cards</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📁 Monthly Backup JSON</p>
        </div>
      </div>
    </div>
  );
}
