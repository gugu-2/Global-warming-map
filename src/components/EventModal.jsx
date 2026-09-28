import React from 'react';
import { X, Calendar, MapPin, Sparkles, Navigation } from 'lucide-react';
import { formatYear } from '../data/historyData';

export default function EventModal({
  event,
  onClose,
  onFlyTo
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-gold rounded-3xl p-6 shadow-2xl max-w-lg w-full border border-amber-400/40 flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {event.category}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatYear(event.year)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold font-cinzel text-amber-100 pr-6">
          {event.title}
        </h3>

        {/* Location with Coordinates */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{event.location}</span>
          <span className="text-slate-500 ml-auto">
            ({event.coords[0].toFixed(2)}°, {event.coords[1].toFixed(2)}°)
          </span>
        </div>

        {/* Description */}
        <div className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <p>{event.desc}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onFlyTo && (
            <button
              onClick={() => {
                onFlyTo(event.coords);
                onClose();
              }}
              className="py-2.5 px-4 rounded-2xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Center on Map</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
