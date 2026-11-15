import React, { useState } from 'react';
import {
  X, Cloud, ExternalLink, Download, FolderArchive,
  CheckCircle, Shield, FileText, Smartphone, HardDrive
} from 'lucide-react';
import { getVehicleFileName, downloadInvoicePDF, saveToFileManager, openGoogleDrive } from '../utils/pdfGenerator';
import { exportBackup } from '../utils/storage';

export default function GoogleDriveModal({
  isOpen,
  onClose,
  currentBill,
  settings
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const googleEmail = settings?.googleDriveEmail || 'mrdododetailers@gmail.com';
  const fileName = getVehicleFileName(currentBill, 'pdf');

  if (!isOpen) return null;

  const handleSaveFileManager = async () => {
    setIsProcessing(true);
    setStatusMsg('Saving to File Manager with vehicle name...');
    try {
      const res = await saveToFileManager('invoice-to-print', currentBill);
      if (res.canceled) {
        setStatusMsg('Save canceled');
      } else {
        setStatusMsg(`Saved as ${res.fileName} to your device files!`);
      }
    } catch (e) {
      setStatusMsg('File saved to Downloads');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleOpenDrive = () => {
    openGoogleDrive(googleEmail);
  };

  const handleBackupToDrive = () => {
    exportBackup();
    setStatusMsg('Downloaded backup file. Opening Google Drive to upload...');
    setTimeout(() => {
      openGoogleDrive(googleEmail);
      setStatusMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Cloud size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Google Drive & File Manager</h3>
              <p className="text-xs text-slate-400">Cloud backup & device storage access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Banner */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Connected Business Drive
            </span>
            <p className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{googleEmail}</span>
            </p>
          </div>
          <button
            onClick={handleOpenDrive}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ExternalLink size={13} /> Open Drive
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {statusMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle size={15} />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Active Bill Vehicle File Target */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Bill Vehicle File Name:
            </span>
            <div className="flex items-center gap-2 text-white font-mono text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 truncate">
              <FileText size={15} className="text-blue-400 flex-shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Standardized format: <span className="text-slate-300">VehicleNumber_VehicleMake_Date.pdf</span>
            </p>
          </div>

          {/* Storage Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Save to Device File Manager */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
                  <HardDrive size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">Save to File Manager</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Saves directly to your phone's or computer's File Manager with the exact vehicle name.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveFileManager}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md"
              >
                <Download size={14} /> Save to Files
              </button>
            </div>

            {/* Option 2: Upload to Google Drive */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Cloud size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">Sync with Google Drive</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Opens Google Drive directly for <span className="text-slate-300 font-mono">{googleEmail}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenDrive}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md"
              >
                <ExternalLink size={14} /> Open Mr. DODO Drive
              </button>
            </div>
          </div>

          {/* Backup Database to Drive */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <FolderArchive size={16} className="text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Full Database Backup for Google Drive
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Download all saved bills and settings into a single backup file to store in your Google Drive folder for safe record-keeping.
            </p>
            <button
              type="button"
              onClick={handleBackupToDrive}
              className="py-2 px-4 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FolderArchive size={14} /> Export Backup & Open Drive
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
