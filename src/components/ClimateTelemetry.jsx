import React from 'react';
import { Waves, Flame, Snowflake, Users, AlertTriangle, Building2 } from 'lucide-react';
import { getClimateMetricsForYear, VULNERABLE_CITIES, getCityFloodStatus } from '../data/climateData';

export default function ClimateTelemetry({
  climateYear,
  onOpenCitiesModal
}) {
  const metrics = getClimateMetricsForYear(climateYear);

  // Count how many vulnerable cities are currently flooded or submerged
  const floodedCitiesCount = VULNERABLE_CITIES.filter(c => metrics.seaLevelRise >= c.floodThreshold).length;

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl border border-cyan-500/30 flex flex-col gap-3.5 max-w-sm sm:max-w-md backdrop-blur-2xl bg-slate-950/80 animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-300">
            Global Warming Planetary Telemetry
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
          Year {climateYear}
        </span>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Sea Level Rise */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Waves className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono">Sea Level Rise</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-cyan-100">
              +{metrics.seaLevelRise}m
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({Math.round(metrics.seaLevelRise * 3.28)} ft)
            </span>
          </div>
          <span className="text-[9px] text-slate-400">
            {metrics.seaLevelRise >= 66 ? 'Max: All ice melted' : `Target: +68m max`}
          </span>
        </div>

        {/* Remaining Glacier & Ice Sheet Volume */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-1.5 text-sky-400">
            <Snowflake className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono">Planetary Ice</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-sky-200">
              {metrics.remainingIcePct}%
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Remaining</span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-0.5">
            <div
              className="bg-gradient-to-r from-sky-400 to-cyan-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.remainingIcePct}%` }}
            />
          </div>
        </div>

        {/* Global Temperature Anomaly */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-amber-500/20 bg-slate-900/60">
          <div className="flex items-center gap-1.5 text-rose-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono">Global Temp Anomaly</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-amber-200">
              +{metrics.tempAnomaly}°C
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Above baseline</span>
          </div>
          <span className="text-[9px] text-slate-400">
            {metrics.tempAnomaly >= 5.0 ? 'Extreme Hothouse' : 'High Warming'}
          </span>
        </div>

        {/* Displaced Population */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1 border border-white/5 bg-slate-900/60">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono">Displaced People</span>
          </div>
          <span className="text-base font-bold font-mono text-slate-100">
            {metrics.currentMilestone.displacedPop}
          </span>
          <span className="text-[9px] text-slate-400 truncate">
            Coastal population inundated
          </span>
        </div>
      </div>

      {/* Milestone Context Box */}
      <div className="bg-slate-900/70 p-3 rounded-2xl border border-cyan-500/20 text-xs flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{metrics.currentMilestone.title}</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {metrics.currentMilestone.desc}
        </p>
      </div>

      {/* Submerged Coastal Megacities Button */}
      <button
        onClick={onOpenCitiesModal}
        className="w-full py-2.5 px-3 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 hover:text-white font-mono text-xs font-semibold flex items-center justify-between transition-all active:scale-95 shadow-md"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Vulnerable Coastal Cities:</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
          {floodedCitiesCount} / {VULNERABLE_CITIES.length} Submerged
        </span>
      </button>
    </div>
  );
}
