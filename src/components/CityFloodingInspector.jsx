import React from 'react';
import { X, Navigation, Building2, Waves, Users, AlertTriangle } from 'lucide-react';
import { getCityFloodStatus } from '../data/climateData';

export default function CityFloodingInspector({
  city,
  seaLevelRise,
  onClose,
  onFlyTo
}) {
  if (!city) return null;

  const floodInfo = getCityFloodStatus(city, seaLevelRise);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 shadow-2xl max-w-lg w-full border border-cyan-400/40 flex flex-col gap-4 relative bg-slate-950/90">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border"
            style={{
              color: floodInfo.color,
              borderColor: `${floodInfo.color}50`,
              backgroundColor: `${floodInfo.color}20`
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {floodInfo.badge}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Current Sea Rise: +{seaLevelRise}m
          </span>
        </div>

        {/* City Title */}
        <div className="flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-cyan-400 shrink-0" />
          <h3 className="text-xl font-bold font-sans text-cyan-100">
            {city.name}
          </h3>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-mono text-slate-400">Mean Elevation</span>
            <span className="text-base font-bold font-mono text-slate-100">{city.elevation}m above sea</span>
          </div>

          <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-mono text-slate-400">Inundation Threshold</span>
            <span className="text-base font-bold font-mono text-amber-300">+{city.floodThreshold}m rise</span>
          </div>

          <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-mono text-slate-400">At-Risk Population</span>
            <span className="text-base font-bold font-mono text-slate-100 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              {city.population}
            </span>
          </div>

          <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-mono text-slate-400">Water Level Status</span>
            <span className="text-base font-bold font-mono" style={{ color: floodInfo.color }}>
              {floodInfo.depth}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <p>{city.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onFlyTo && (
            <button
              onClick={() => {
                onFlyTo(city.coords);
                onClose();
              }}
              className="py-2.5 px-4 rounded-2xl btn-cyan text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Center Camera on City</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
