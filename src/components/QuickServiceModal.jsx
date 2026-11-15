import React, { useState } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../constants/defaultData';
import { formatCurrency } from '../utils/storage';

export default function QuickServiceModal({ isOpen, onClose, onSelectService }) {
  const [activeCategory, setActiveCategory] = useState(SERVICE_CATEGORIES[0].category);
  const [addedNames, setAddedNames] = useState(new Set());

  if (!isOpen) return null;

  const handleSelect = (service) => {
    onSelectService(service);
    setAddedNames(prev => new Set(prev).add(service.name));
    setTimeout(() => {
      setAddedNames(prev => {
        const next = new Set(prev);
        next.delete(service.name);
        return next;
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Quick Add Services</h3>
              <p className="text-xs text-slate-400">1-Tap to add packages with standard rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-slate-950/70 border-b border-slate-800 scrollbar-none">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition ${
                activeCategory === cat.category
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-800/60">
          {SERVICE_CATEGORIES.find(c => c.category === activeCategory)?.services.map((service) => {
            const isAdded = addedNames.has(service.name);
            return (
              <div
                key={service.name}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition truncate">
                    {service.name}
                  </h4>
                  {service.note && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {service.note}
                    </p>
                  )}
                  <p className="text-xs font-bold text-emerald-400 mt-1">
                    ₹{formatCurrency(service.amount)}
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(service)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
