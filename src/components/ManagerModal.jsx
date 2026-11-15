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
    avatarColor: 'bg-blue-600'
  });

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newManager.name.trim()) return;

    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created = {
      ...newManager,
      id: `mgr-${Date.now()}`,
      avatarColor: randomColor
    };

    const updated = [...managers, created];
    onSaveManagers(updated);
    onSelectManager(created);
    setIsAdding(false);
    setNewManager({ name: '', role: 'Service Manager', phone: '', avatarColor: 'bg-blue-600' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Manager & User Access</h3>
              <p className="text-xs text-slate-400">Select active manager for billing & tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Active Manager Banner */}
        <div className="px-5 py-3.5 bg-blue-950/40 border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${activeManager?.avatarColor || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
              {(activeManager?.name || 'M').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Active User</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h4 className="text-sm font-bold text-white">{activeManager?.name}</h4>
              <p className="text-xs text-slate-400">{activeManager?.role || 'Manager'}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Online
          </span>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Team Members ({managers.length})
            </h4>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <Plus size={14} /> Add Manager
              </button>
            )}
          </div>

          {/* Add Manager Form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="bg-slate-950 border border-slate-700/80 p-4 rounded-xl space-y-3 mb-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Add New Team Member</h5>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Manager / Detailing Lead"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Role</label>
                  <select
                    value={newManager.role}
                    onChange={(e) => setNewManager({ ...newManager, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="General Manager">General Manager</option>
                    <option value="Billing & Service Desk">Billing & Service Desk</option>
                    <option value="Detailing Lead">Detailing Lead</option>
                    <option value="Car Wash Lead">Car Wash Lead</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newManager.phone}
                    onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
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
                      ? 'bg-blue-600/15 border-blue-500/60 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${mgr.avatarColor || 'bg-slate-700'} text-white font-bold flex items-center justify-center text-xs`}>
                      {(mgr.name || 'M').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {mgr.name}
                        {isSelected && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">{mgr.role}</p>
                      {mgr.phone && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{mgr.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">
                      {managerBillsCount} bills
                    </span>
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
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
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
