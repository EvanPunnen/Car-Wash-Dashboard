import React, { useState } from 'react';
import { X, UserCheck, Plus, Check, Shield, User, Phone, Briefcase } from 'lucide-react';

export default function ManagerModal({
  isOpen,
  onClose,
  managers,
  activeManager,
  onSelectManager,
  onSaveManagers,
  bills
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newManager, setNewManager] = useState({
    name: '',
    role: 'Service Manager',
    phone: '',
    avatarColor: 'bg-black'
  });

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newManager.name.trim()) return;

    const created = {
      ...newManager,
      id: `mgr-${Date.now()}`,
      avatarColor: 'bg-black'
    };

    const updated = [...managers, created];
    onSaveManagers(updated);
    onSelectManager(created);
    setIsAdding(false);
    setNewManager({ name: '', role: 'Service Manager', phone: '', avatarColor: 'bg-black' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-neutral-300 w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-black text-black text-base">Manager & User Access</h3>
              <p className="text-xs text-neutral-500 font-medium">Select active manager for billing & tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Active Manager Banner */}
        <div className="px-5 py-3.5 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white font-black flex items-center justify-center text-sm shadow-sm">
              {(activeManager?.name || 'M').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Active Operator</span>
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
              </div>
              <h4 className="text-sm font-black text-black">{activeManager?.name}</h4>
              <p className="text-xs text-neutral-600 font-medium">{activeManager?.role || 'Manager'}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-black bg-white px-2.5 py-0.5 rounded-lg border border-neutral-300">
            Active
          </span>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Team Members ({managers.length})
            </h4>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="text-xs text-black hover:text-neutral-700 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Add Manager
              </button>
            )}
          </div>

          {/* Add Manager Form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="bg-neutral-50 border border-neutral-300 p-4 rounded-xl space-y-3 mb-3">
              <h5 className="text-xs font-black text-black uppercase tracking-wider">Add New Team Member</h5>
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Manager / Detailing Lead"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Role</label>
                  <select
                    value={newManager.role}
                    onChange={(e) => setNewManager({ ...newManager, role: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
                  >
                    <option value="General Manager">General Manager</option>
                    <option value="Billing & Service Desk">Billing & Service Desk</option>
                    <option value="Detailing Lead">Detailing Lead</option>
                    <option value="Car Wash Lead">Car Wash Lead</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newManager.phone}
                    onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-black font-mono font-bold placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-bold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Save Member
                </button>
              </div>
            </form>
          )}

          {/* List of Managers */}
          <div className="space-y-2">
            {managers.map((mgr) => {
              const isSelected = activeManager?.id === mgr.id;
              const managerBillsCount = (bills || []).filter(b => b.managerName === mgr.name).length;

              return (
                <div
                  key={mgr.id}
                  onClick={() => {
                    onSelectManager(mgr);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100 border-black shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-black hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {(mgr.name || 'M').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-black flex items-center gap-1.5">
                        {mgr.name}
                        {isSelected && (
                          <span className="text-[10px] bg-black text-white px-2 py-0.2 rounded-md font-mono font-bold">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-neutral-600 font-medium">{mgr.role}</p>
                      {mgr.phone && (
                        <p className="text-[11px] text-neutral-500 font-mono font-bold mt-0.5">{mgr.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 font-mono font-bold">
                      {managerBillsCount} bills
                    </span>
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : <User size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
