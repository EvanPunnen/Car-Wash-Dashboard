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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-neutral-300 w-full sm:max-w-xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Cloud size={20} />
            </div>
            <div>
              <h3 className="font-black text-black text-base">Google Drive & File Manager</h3>
              <p className="text-xs text-neutral-500 font-medium">Cloud backup & device storage access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Banner */}
        <div className="px-5 py-3.5 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Connected Business Drive
            </span>
            <p className="text-sm font-black text-black font-mono flex items-center gap-1.5 mt-0.5">
              <span>{googleEmail}</span>
            </p>
          </div>
          <button
            onClick={handleOpenDrive}
            className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <ExternalLink size={13} /> Open Drive
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-white">
          {statusMsg && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-black font-bold flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Active Bill Vehicle File Target */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Current Bill Vehicle File Name:
            </span>
            <div className="flex items-center gap-2 text-black font-mono text-xs bg-white px-3 py-2 rounded-lg border border-neutral-300 truncate">
              <FileText size={15} className="text-neutral-700 flex-shrink-0" />
              <span className="truncate font-bold">{fileName}</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Standardized format: <span className="text-black font-mono">VehicleNumber_VehicleMake_Date.pdf</span>
            </p>
          </div>

          {/* Storage Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Save to Device File Manager */}
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center mb-2 shadow-sm">
                  <HardDrive size={16} />
                </div>
                <h4 className="text-sm font-black text-black">Save to File Manager</h4>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Saves directly to your phone's or computer's File Manager with the exact vehicle name.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveFileManager}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Download size={14} /> Save to Files
              </button>
            </div>

            {/* Option 2: Upload to Google Drive */}
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center mb-2 shadow-sm">
                  <Cloud size={16} />
                </div>
                <h4 className="text-sm font-black text-black">Sync with Google Drive</h4>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Opens Google Drive directly for <span className="text-black font-mono font-bold">{googleEmail}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenDrive}
                className="w-full py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <ExternalLink size={14} /> Open Mr. DODO Drive
              </button>
            </div>
          </div>

          {/* Backup Database to Drive */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <FolderArchive size={16} className="text-black" />
              <h4 className="text-xs font-black uppercase tracking-wider text-black">
                Full Database Backup for Google Drive
              </h4>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Download all saved bills and settings into a single backup file to store in your Google Drive folder for safe record-keeping.
            </p>
            <button
              type="button"
              onClick={handleBackupToDrive}
              className="py-2 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <FolderArchive size={14} /> Export Backup & Open Drive
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
