import React, { useState } from 'react';
import { Globe, Map, Search, HelpCircle, Layers, Waves, Landmark } from 'lucide-react';
import { getCurrentEra, formatYear, EMPIRES, HISTORICAL_EVENTS } from '../data/historyData';
import { VULNERABLE_CITIES, getClimateMetricsForYear } from '../data/climateData';
import { ADMIN1_REGIONS_INDEX } from '../data/admin1Index';

export default function HeaderBar({
  appMode, // 'history' | 'climate' | 'provinces'
  onToggleAppMode,
  currentYear,
  climateYear,
  viewMode,
  onToggleViewMode,
  activeEmpiresCount,
  onSelectSearchResult,
  onOpenHelp,
  onOpenCitiesModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const era = getCurrentEra(currentYear);
  const climateMetrics = getClimateMetricsForYear(climateYear);

  const isClimate = appMode === 'climate';
  const isProvinces = appMode === 'provinces';
  const isHistory = appMode === 'history';

  // Search logic depending on mode
  const filteredResults = searchQuery.trim().length > 1
    ? (isProvinces
        ? ADMIN1_REGIONS_INDEX.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.name_local && s.name_local.toLowerCase().includes(searchQuery.toLowerCase())) ||
            s.admin.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 8).map(s => ({ type: 'province', item: s }))
        : isClimate
        ? VULNERABLE_CITIES.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(c => ({ type: 'climateCity', item: c })).slice(0, 6)
        : [
            ...EMPIRES.filter(e =>
              e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              e.civilization.toLowerCase().includes(searchQuery.toLowerCase()) ||
              e.ruler.toLowerCase().includes(searchQuery.toLowerCase()) ||
              e.capital?.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(e => ({ type: 'empire', item: e })),
            ...HISTORICAL_EVENTS.filter(ev =>
              ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ev.location.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(ev => ({ type: 'event', item: ev }))
          ].slice(0, 6)
      )
    : [];

  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-3 pointer-events-none">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div
          className={`rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl backdrop-blur-xl transition-all ${
            isProvinces
              ? 'glass-panel border-emerald-500/40 bg-slate-950/85'
              : isClimate
              ? 'glass-panel border-cyan-500/40 bg-slate-950/85'
              : 'glass-panel-gold border-amber-500/30'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
              isProvinces
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-300 text-slate-950 shadow-emerald-500/30'
                : isClimate
                ? 'bg-gradient-to-tr from-cyan-600 to-sky-300 text-slate-950 shadow-cyan-500/30'
                : 'bg-gradient-to-tr from-amber-600 to-amber-300 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isProvinces ? (
              <Layers className="w-5 h-5 text-slate-950" />
            ) : isClimate ? (
              <Waves className="w-5 h-5 animate-pulse" />
            ) : (
              <Globe className="w-5 h-5 animate-spin-slow" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1
                className={`text-base font-extrabold tracking-wider ${
                  isProvinces
                    ? 'font-sans text-emerald-100 font-black'
                    : isClimate
                    ? 'font-sans text-cyan-100 font-black'
                    : 'font-cinzel text-amber-100'
                }`}
              >
                {isProvinces ? 'PROVINCES & STATES' : isClimate ? 'GLACIER MELTDOWN' : 'CHRONO-TERRA'}
              </h1>
              <span
                className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  isProvinces
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : isClimate
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                    : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                }`}
              >
                {isProvinces ? 'ADMIN-1 MAP' : isClimate ? 'CLIMATE SIM' : 'HISTORY'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">
                {isProvinces ? 'Subdivisions:' : isClimate ? 'Sea Level:' : 'Era:'}
              </span>
              <span
                className={
                  isProvinces
                    ? 'font-bold text-emerald-300'
                    : isClimate
                    ? 'font-bold text-cyan-300'
                    : 'font-semibold text-amber-300'
                }
              >
                {isProvinces
                  ? 'Europe, Russia, South America & MENA'
                  : isClimate
                  ? `+${climateMetrics.seaLevelRise}m (Ice: ${climateMetrics.remainingIcePct}%)`
                  : era.name}
              </span>
            </div>
          </div>
        </div>

        {/* Global Map Mode Toggle (History vs Climate vs Provinces) */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl glass-panel border border-white/10 shadow-xl bg-slate-950/70">
          <button
            onClick={() => onToggleAppMode('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isHistory
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>History (3000 BCE)</span>
          </button>
          <button
            onClick={() => onToggleAppMode('climate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isClimate
                ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold shadow-md shadow-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Glacier Melt (+70m)</span>
          </button>
          <button
            onClick={() => onToggleAppMode('provinces')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isProvinces
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>States & Provinces</span>
          </button>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="relative pointer-events-auto hidden md:block max-w-xs w-full">
        <div className="glass-panel rounded-2xl flex items-center px-3 py-1.5 border border-white/10 focus-within:border-cyan-400/50 shadow-lg bg-slate-950/70">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={
              isProvinces
                ? 'Search province/state (e.g. Bavaria, Tehran)...'
                : isClimate
                ? 'Search coastal city (e.g. Miami, Venice)...'
                : 'Search empire, ruler, event...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl p-2 shadow-2xl border border-cyan-400/40 flex flex-col gap-1 z-50 bg-slate-950/95 max-h-72 overflow-y-auto">
            {filteredResults.map((res, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectSearchResult(res);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-cyan-500/20 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        res.type === 'province'
                          ? '#10b981'
                          : res.type === 'empire'
                          ? res.item.color
                          : res.type === 'climateCity'
                          ? '#06b6d4'
                          : '#fbbf24'
                    }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-100 truncate">
                      {res.type === 'province'
                        ? res.item.name
                        : res.type === 'empire'
                        ? res.item.name
                        : res.type === 'climateCity'
                        ? res.item.name
                        : res.item.title}
                    </span>
                    {res.type === 'province' && (
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        {res.item.admin} • {res.item.type}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 shrink-0 ml-2">
                  {res.type === 'province'
                    ? (res.item.area_km2 > 0 ? `${res.item.area_km2.toLocaleString()} km²` : res.item.admin)
                    : res.type === 'climateCity'
                    ? `Flood at +${res.item.floodThreshold}m`
                    : formatYear(res.type === 'empire' ? res.item.startYear : res.item.year)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: 2D/3D Switcher & Info */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mobile Mode Switcher */}
        <div className="flex sm:hidden">
          <button
            onClick={() => onToggleAppMode(isProvinces ? 'history' : isClimate ? 'provinces' : 'climate')}
            className="glass-panel px-2.5 py-1.5 rounded-2xl text-[11px] font-bold border border-emerald-400/30 text-emerald-300"
          >
            {isProvinces ? 'Switch to History' : isClimate ? 'Switch to States' : 'Switch to Melt'}
          </button>
        </div>

        {/* Real Map (Google Style) / 3D Globe Toggle */}
        <div className="glass-panel rounded-2xl p-1 flex items-center gap-1 border border-white/10 shadow-xl bg-slate-950/70">
          <button
            onClick={() => onToggleViewMode('real')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'real'
                ? isClimate
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold shadow-md shadow-cyan-400/30'
                  : 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Real Map</span>
          </button>
          <button
            onClick={() => onToggleViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === '3d'
                ? isClimate
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold shadow-md shadow-cyan-400/30'
                  : 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3D Globe</span>
          </button>
        </div>

        {/* Submerged Cities Directory Button (Climate Mode) */}
        {isClimate && onOpenCitiesModal && (
          <button
            onClick={onOpenCitiesModal}
            className="glass-panel px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-cyan-400/40 shadow-xl text-cyan-200 hover:text-white bg-slate-950/70 hover:bg-cyan-950/50 text-xs font-mono font-bold transition-all"
            title="Open Complete Research Directory of all 52 Global Inundation Regions"
          >
            <span>📊 Directory</span>
          </button>
        )}

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          className="glass-panel p-2 rounded-2xl hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-white/10 shadow-xl transition-all bg-slate-950/70"
          title="Guide & Information"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
