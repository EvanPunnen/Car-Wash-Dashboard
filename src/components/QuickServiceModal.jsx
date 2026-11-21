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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-neutral-300 w-full sm:max-w-xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-black text-black text-base">Quick Add Services</h3>
              <p className="text-xs text-neutral-500 font-medium">1-Tap to add packages with standard rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-neutral-100 border-b border-neutral-200 scrollbar-none">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition ${
                activeCategory === cat.category
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:text-black border border-neutral-300'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-neutral-200 bg-white">
          {SERVICE_CATEGORIES.find(c => c.category === activeCategory)?.services.map((service) => {
            const isAdded = addedNames.has(service.name);
            return (
              <div
                key={service.name}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-black text-black truncate">
                    {service.name}
                  </h4>
                  {service.note && (
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 font-medium">
                      {service.note}
                    </p>
                  )}
                  <p className="text-xs font-black text-black font-mono mt-1">
                    ₹{formatCurrency(service.amount)}
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(service)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                    isAdded
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-neutral-100 hover:bg-black text-black hover:text-white border border-neutral-300'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> + Add
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
