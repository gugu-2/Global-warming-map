import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  AlertTriangle,
  Navigation,
  Waves,
  Search,
  Filter,
  Globe2,
  Users,
  Compass,
  CheckCircle2,
  Skull
} from 'lucide-react';
import { VULNERABLE_CITIES, getCityFloodStatus } from '../data/climateData';

const REGION_TABS = [
  'All Regions',
  'Middle East & North Africa',
  'Asia',
  'Europe',
  'Africa',
  'Americas',
  'Oceania'
];

export default function VulnerableCitiesModal({
  isOpen,
  onClose,
  seaLevelRise,
  onSelectCity
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'submerged' | 'critical' | 'secure'

  // Filter and search cities
  const filteredCities = useMemo(() => {
    return VULNERABLE_CITIES.filter((city) => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q) ||
        city.regionGroup.toLowerCase().includes(q) ||
        city.description.toLowerCase().includes(q);

      // Region match
      const matchesRegion =
        selectedRegion === 'All Regions' || city.regionGroup === selectedRegion;

      // Status match
      const floodInfo = getCityFloodStatus(city, seaLevelRise);
      let matchesStatus = true;
      if (selectedStatus === 'submerged') {
        matchesStatus = floodInfo.status === 'SUBMERGED';
      } else if (selectedStatus === 'critical') {
        matchesStatus = floodInfo.status === 'CRITICAL' || floodInfo.status === 'FLOODED';
      } else if (selectedStatus === 'secure') {
        matchesStatus = floodInfo.status === 'SECURE';
      }

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [searchQuery, selectedRegion, selectedStatus, seaLevelRise]);

  // Aggregate calculations
  const submergedCount = useMemo(() => {
    return VULNERABLE_CITIES.filter(
      (c) => getCityFloodStatus(c, seaLevelRise).status === 'SUBMERGED'
    ).length;
  }, [seaLevelRise]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto select-none">
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl max-w-4xl w-full border border-cyan-400/40 flex flex-col gap-4 relative bg-slate-950/95 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Waves className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-sans text-cyan-100 flex items-center gap-2">
                <span>Global Inundation & Submergence Directory</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                  {VULNERABLE_CITIES.length} Key Regions
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Current Sea Level Surge: <strong className="text-cyan-300">+{seaLevelRise}m</strong> •
                Submerged: <strong className="text-rose-400">{submergedCount} / {VULNERABLE_CITIES.length} Megacities</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Aggregate Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Submerged Now</span>
            <span className="text-base font-bold text-rose-400">{submergedCount} Cities</span>
          </div>
          <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Threat Level</span>
            <span className="text-base font-bold text-amber-300">
              {seaLevelRise >= 3.0 ? 'Catastrophic' : seaLevelRise >= 1.0 ? 'Severe Delta Loss' : 'Early Warning'}
            </span>
          </div>
          <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Global Land Inundated</span>
            <span className="text-base font-bold text-cyan-300">
              {Math.round(Math.pow(seaLevelRise / 68.0, 0.75) * 5400000).toLocaleString()} km²
            </span>
          </div>
          <div className="glass-panel p-2.5 rounded-2xl border border-white/5 bg-slate-900/60 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Current Filtered</span>
            <span className="text-base font-bold text-slate-200">{filteredCities.length} Locations</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Egypt, Iraq, Venice, Vietnam, Miami..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedStatus === 'all'
                  ? 'bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white bg-slate-900/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('submerged')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedStatus === 'submerged'
                  ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-400/50'
                  : 'text-slate-400 hover:text-rose-300 bg-slate-900/50'
              }`}
            >
              Submerged ({submergedCount})
            </button>
            <button
              onClick={() => setSelectedStatus('critical')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedStatus === 'critical'
                  ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/50'
                  : 'text-slate-400 hover:text-amber-300 bg-slate-900/50'
              }`}
            >
              Critical Risk
            </button>
            <button
              onClick={() => setSelectedStatus('secure')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedStatus === 'secure'
                  ? 'bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/50'
                  : 'text-slate-400 hover:text-emerald-300 bg-slate-900/50'
              }`}
            >
              Safe
            </button>
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-white/5 pb-2">
          {REGION_TABS.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                selectedRegion === region
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Scrollable Cities & Regional Deltas List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {filteredCities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              No cities match the query "{searchQuery}" in {selectedRegion}.
            </div>
          ) : (
            filteredCities.map((city) => {
              const floodInfo = getCityFloodStatus(city, seaLevelRise);
              const isSubmerged = floodInfo.status === 'SUBMERGED';

              return (
                <div
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                  className={`glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 border transition-all cursor-pointer hover:bg-slate-900/90 ${
                    isSubmerged
                      ? 'border-rose-500/30 bg-rose-950/15'
                      : 'border-white/5 hover:border-cyan-500/40 bg-slate-900/40'
                  }`}
                >
                  {/* Left: City Info & Submergence Timeline */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full mt-1 shrink-0 shadow-md"
                      style={{ backgroundColor: floodInfo.color }}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100">{city.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                          {city.country}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                          Floods at +{city.floodThreshold}m (Year ~{city.submergenceYear})
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono">
                        <span>Elevation: <strong className="text-slate-200">{city.elevation}m</strong></span>
                        <span>Population: <strong className="text-slate-200">{city.population}</strong></span>
                        <span>Estimated Area Submerged: <strong className="text-cyan-300">{city.submergedAreaKm2}</strong></span>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                        {city.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Submergence Status Badge & Fly-To Action */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="flex flex-col items-start md:items-end">
                      <span
                        className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
                        style={{
                          color: floodInfo.color,
                          borderColor: `${floodInfo.color}50`,
                          backgroundColor: `${floodInfo.color}20`
                        }}
                      >
                        {floodInfo.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {floodInfo.depth}
                      </span>
                    </div>

                    <button
                      className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 flex items-center gap-1.5 text-xs font-mono transition-all"
                      title="Fly camera to this flooded location"
                    >
                      <span>Fly To</span>
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
