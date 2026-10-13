import React from 'react';
import { X, MapPin, Maximize2, Flag, Navigation, Layers, Compass, ExternalLink } from 'lucide-react';
import { ADMIN1_REGIONS_INDEX } from '../data/admin1Index';

export default function ProvinceInspector({
  province,
  onClose,
  onFlyTo,
  onSelectProvince
}) {
  if (!province) return null;

  // Find sibling states in the same country to allow quick hopping
  const siblingStates = ADMIN1_REGIONS_INDEX.filter(
    s => s.admin.toLowerCase() === province.admin.toLowerCase() && s.id !== province.id
  ).slice(0, 15);

  const areaFormatted = province.area_km2 > 0
    ? `${province.area_km2.toLocaleString()} km² (${Math.round(province.area_km2 * 0.386102).toLocaleString()} sq mi)`
    : 'Administrative division';

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-emerald-400/40 flex flex-col gap-4 max-h-[85vh] overflow-y-auto w-full max-w-sm sm:max-w-md animate-fade-in backdrop-blur-2xl bg-slate-950/90 pointer-events-auto">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-sans text-slate-100 leading-tight">
                {province.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mt-0.5">
              <span>{province.admin}</span>
              <span>•</span>
              <span className="text-slate-400">{province.type}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Local / Native Name (if different) */}
      {province.name_local && province.name_local !== province.name && (
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs flex items-center justify-between font-mono">
          <span className="text-slate-400">Native Name:</span>
          <span className="text-slate-200 font-semibold">{province.name_local}</span>
        </div>
      )}

      {/* Quick Action: Center / Zoom In */}
      <div className="flex gap-2">
        {onFlyTo && (
          <button
            onClick={() => onFlyTo([province.lat, province.lng], 8)}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Focus State</span>
          </button>
        )}
        {province.bbox && onFlyTo && (
          <button
            onClick={() => {
              const [minLng, minLat, maxLng, maxLat] = province.bbox;
              const centerLat = (minLat + maxLat) / 2;
              const centerLng = (minLng + maxLng) / 2;
              onFlyTo([centerLat, centerLng], 9);
            }}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all"
            title="Zoom closer into this subdivision"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Zoom</span>
          </button>
        )}
      </div>

      {/* Grid Key Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Subdivision Type</span>
          <span className="text-sm font-bold text-slate-100">{province.type}</span>
        </div>
        <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Code / ID</span>
          <span className="text-sm font-bold text-emerald-300">{province.code || province.adm0_a3}</span>
        </div>
        <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col col-span-2">
          <span className="text-[10px] text-slate-400 uppercase">Surface Area</span>
          <span className="text-sm font-bold text-slate-100">{areaFormatted}</span>
        </div>
        <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col col-span-2">
          <span className="text-[10px] text-slate-400 uppercase">Geographic Centroid</span>
          <span className="text-xs text-slate-300 mt-0.5">
            {province.lat.toFixed(3)}°N, {province.lng.toFixed(3)}°E
          </span>
        </div>
      </div>

      {/* Other Provinces in same country */}
      {siblingStates.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
            <span>Other Provinces in {province.admin}:</span>
            <span className="text-emerald-400 font-bold">{siblingStates.length}+ more</span>
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {siblingStates.map(sib => (
              <button
                key={sib.id}
                onClick={() => {
                  if (onSelectProvince) onSelectProvince(sib);
                  if (onFlyTo) onFlyTo([sib.lat, sib.lng], 8);
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-slate-900/80 hover:bg-emerald-950/60 border border-white/5 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-200 transition-all text-left"
              >
                {sib.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
