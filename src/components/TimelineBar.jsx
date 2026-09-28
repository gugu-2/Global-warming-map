import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { ERAS, TIMELINE_PRESETS, formatYear } from '../data/historyData';
import { soundFx } from '../utils/audio';

export default function TimelineBar({
  currentYear,
  onYearChange,
  currentStep,
  minYear = -3000,
  maxYear = 2026
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x
  const playIntervalRef = useRef(null);

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      if (currentYear >= maxYear) {
        setIsPlaying(false);
        return;
      }

      const intervalMs = Math.max(120, 450 / playbackSpeed);
      playIntervalRef.current = setInterval(() => {
        onYearChange((prevYear) => {
          const next = prevYear + currentStep;
          if (next >= maxYear) {
            return maxYear;
          }
          soundFx.playTick(1.0);
          return next;
        });
      }, intervalMs);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, currentStep, maxYear, onYearChange, currentYear]);

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
    // snap to nearest multiple of step if desired, or smooth
    onYearChange(val);
  };

  const jumpToPreset = (preset) => {
    soundFx.playWarp();
    onYearChange(preset.year);
  };

  return (
    <div className="glass-panel-gold rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 border border-amber-500/20 backdrop-blur-xl w-full">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback & Timelapse Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-xs transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-300'
                : 'btn-gold'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Timelapse</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Timelapse</span>
              </>
            )}
          </button>

          <button
            onClick={cycleSpeed}
            className="px-3 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 hover:text-amber-300 font-mono text-xs flex items-center gap-1 transition-all"
            title="Cycle Timelapse Playback Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{playbackSpeed}x</span>
          </button>

          <button
            onClick={() => {
              soundFx.playWarp();
              onYearChange(minYear);
            }}
            className="px-3 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-400 hover:text-amber-200 text-xs flex items-center gap-1 transition-all"
            title="Reset to 3000 BCE"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Current Year Large Center Readout */}
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-1.5 px-4 py-1.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-inner">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Epoch:</span>
            <span className="text-lg sm:text-xl font-extrabold font-cinzel text-amber-300 tracking-wide">
              {formatYear(currentYear)}
            </span>
          </div>
        </div>

        {/* Jump to Today Button */}
        <button
          onClick={() => {
            soundFx.playWarp();
            onYearChange(2026);
          }}
          className="px-3 py-2 rounded-2xl btn-cyan text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          title="Jump directly to present day (2026 CE)"
        >
          <span>Present Day (2026)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Master Continuous Slider Track with Era Colored Segments */}
      <div className="relative w-full pt-1 pb-1">
        {/* Visual Era Color Bars background */}
        <div className="w-full h-2 rounded-full overflow-hidden flex opacity-65 mb-1.5">
          {ERAS.map(era => {
            const totalSpan = maxYear - minYear;
            const eraSpan = era.end - era.start;
            const pct = (eraSpan / totalSpan) * 100;
            return (
              <div
                key={era.id}
                style={{ width: `${pct}%`, backgroundColor: era.themeColor }}
                title={`${era.name} (${formatYear(era.start)} - ${formatYear(era.end)})`}
                className="h-full border-r border-slate-950/40 first:rounded-l-full last:rounded-r-full"
              />
            );
          })}
        </div>

        {/* Interactive Range Input */}
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={currentYear}
          onChange={handleSliderChange}
          className="time-scrubber"
          title={`Scrub Year: ${formatYear(currentYear)}`}
        />

        {/* Era Labels beneath slider */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1 px-1">
          <span>3000 BCE</span>
          <span>1000 BCE</span>
          <span>1 CE</span>
          <span>1000 CE</span>
          <span>1800 CE</span>
          <span className="text-amber-400 font-bold">2026 CE</span>
        </div>
      </div>

      {/* Era / Preset Bookmarks Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-white/5">
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 whitespace-nowrap flex items-center gap-1 mr-1">
          <Bookmark className="w-3 h-3 text-amber-400" />
          Milestones:
        </span>
        {TIMELINE_PRESETS.map((p) => {
          const isSelected = Math.abs(currentYear - p.year) < 25;
          return (
            <button
              key={p.year}
              onClick={() => jumpToPreset(p)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30 scale-105'
                  : 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-amber-200 border border-white/5'
              }`}
              title={`${p.title}: ${p.desc}`}
            >
              <span>{p.label}</span>
              <span className="text-[9px] opacity-70 hidden md:inline">({p.title})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
