import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw, Waves, Bookmark, ChevronRight } from 'lucide-react';
import { CLIMATE_MILESTONES, getClimateMetricsForYear, BASE_YEAR, MAX_CLIMATE_YEAR } from '../data/climateData';
import { soundFx } from '../utils/audio';

export default function ClimateTimelineBar({
  climateYear,
  onYearChange,
  climateStep,
  minYear = BASE_YEAR,
  maxYear = MAX_CLIMATE_YEAR
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playIntervalRef = useRef(null);

  const metrics = getClimateMetricsForYear(climateYear);

  useEffect(() => {
    if (isPlaying) {
      if (climateYear >= maxYear) {
        setIsPlaying(false);
        return;
      }

      const intervalMs = Math.max(100, 400 / playbackSpeed);
      playIntervalRef.current = setInterval(() => {
        onYearChange((prevYear) => {
          const next = prevYear + climateStep;
          if (next >= maxYear) {
            return maxYear;
          }
          soundFx.playTick(1.05);
          return next;
        });
      }, intervalMs);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, climateStep, maxYear, onYearChange, climateYear]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    soundFx.playSwitch();
  };

  const cycleSpeed = () => {
    const speeds = [1, 2, 5, 10];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
    soundFx.playSwitch();
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    onYearChange(val);
  };

  const jumpToMilestone = (m) => {
    soundFx.playWarp();
    onYearChange(m.year);
  };

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 border border-cyan-500/30 backdrop-blur-xl w-full bg-slate-950/85">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-xs transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-cyan-400 text-slate-950 shadow-cyan-400/40 ring-2 ring-cyan-300'
                : 'btn-cyan'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Melt Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Simulate Ice Meltdown</span>
              </>
            )}
          </button>

          <button
            onClick={cycleSpeed}
            className="px-3 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 hover:text-cyan-300 font-mono text-xs flex items-center gap-1 transition-all"
            title="Cycle Playback Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{playbackSpeed}x</span>
          </button>

          <button
            onClick={() => {
              soundFx.playWarp();
              onYearChange(BASE_YEAR);
            }}
            className="px-3 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-400 hover:text-cyan-200 text-xs flex items-center gap-1 transition-all"
            title="Reset to Present Day (2026)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Center Readout: Year & Sea Level Rise */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-inner">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Time:</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-cyan-200 tracking-wide">
              {climateYear === BASE_YEAR ? '2026 (Now)' : `Year ${climateYear}`}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              +{metrics.seaLevelRise}m Sea Level
            </span>
          </div>
        </div>

        {/* Total Meltdown Button */}
        <button
          onClick={() => {
            soundFx.playWarp();
            onYearChange(MAX_CLIMATE_YEAR);
          }}
          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          title="Jump directly to complete ice meltdown (+68m)"
        >
          <span>Total Meltdown (+68m)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Continuous Timeline Range Scrubber */}
      <div className="relative w-full pt-1 pb-1">
        {/* Visual Sea Level Rise Gradient Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex opacity-75 mb-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-cyan-400 rounded-full transition-all"
            style={{ width: `${((climateYear - minYear) / (maxYear - minYear)) * 100}%` }}
          />
        </div>

        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={climateYear}
          onChange={handleSliderChange}
          className="time-scrubber"
          title={`Scrub Future Year: ${climateYear} (+${metrics.seaLevelRise}m)`}
        />

        {/* Labels underneath */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1 px-1">
          <span className="text-emerald-400 font-bold">2026 (Present)</span>
          <span>2100 (+1.15m)</span>
          <span className="text-amber-300 font-bold hidden sm:inline">2176 (+150y Delta Inundation)</span>
          <span>2500 (+14.5m)</span>
          <span>5000 (+52m)</span>
          <span className="text-cyan-400 font-bold">10000 (+68m Full Melt)</span>
        </div>
      </div>

      {/* Key Climate Milestones Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-white/5">
        <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 whitespace-nowrap flex items-center gap-1 mr-1">
          <Bookmark className="w-3 h-3 text-cyan-400" />
          Projections:
        </span>
        {CLIMATE_MILESTONES.map((m) => {
          const isSelected = Math.abs(climateYear - m.year) < 100;
          const is150y = m.year === 2176;
          return (
            <button
              key={m.year}
              onClick={() => jumpToMilestone(m)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/40 scale-105'
                  : is150y
                  ? 'bg-amber-950/60 text-amber-200 border border-amber-400/50 hover:bg-amber-900/60 font-semibold'
                  : 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-cyan-200 border border-white/5'
              }`}
              title={`${m.title}: ${m.desc}`}
            >
              <span>{m.year === BASE_YEAR ? '2026' : is150y ? '2176 (+150y)' : `Year ${m.year}`}</span>
              <span className={`text-[9px] ${isSelected ? 'text-slate-900 font-bold' : is150y ? 'text-amber-300 font-bold' : 'text-cyan-400'}`}>
                (+{m.seaLevelRise}m)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
