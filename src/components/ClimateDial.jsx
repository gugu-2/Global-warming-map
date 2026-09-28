import React, { useRef, useState, useCallback } from 'react';
import { soundFx } from '../utils/audio';
import { CLIMATE_STEP_OPTIONS, getClimateMetricsForYear, BASE_YEAR, MAX_CLIMATE_YEAR } from '../data/climateData';
import { ChevronLeft, ChevronRight, Waves, Droplets, Volume2, VolumeX, Minimize2, Maximize2, Flame } from 'lucide-react';

export default function ClimateDial({
  climateYear,
  onYearChange,
  climateStep,
  onStepChange,
  minYear = BASE_YEAR,
  maxYear = MAX_CLIMATE_YEAR
}) {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dialAngle, setDialAngle] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastAngleRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);

  const metrics = getClimateMetricsForYear(climateYear);

  const handleToggleSound = () => {
    const newState = soundFx.toggle();
    setSoundEnabled(newState);
  };

  const stepTime = useCallback((direction) => {
    const delta = direction * climateStep;
    let nextYear = climateYear + delta;
    if (nextYear < minYear) nextYear = minYear;
    if (nextYear > maxYear) nextYear = maxYear;

    soundFx.playTick(direction > 0 ? 1.15 : 0.85);
    onYearChange(nextYear);

    setDialAngle(prev => (prev + direction * 25) % 360);
  }, [climateYear, climateStep, minYear, maxYear, onYearChange]);

  const calculateAngle = (clientX, clientY) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    let deg = rad * (180 / Math.PI);
    deg = (deg + 90 + 360) % 360;
    return deg;
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture?.(e.pointerId);
    const angle = calculateAngle(e.clientX, e.clientY);
    lastAngleRef.current = angle;
    accumulatedDeltaRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const angle = calculateAngle(e.clientX, e.clientY);
    let diff = angle - lastAngleRef.current;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    lastAngleRef.current = angle;
    setDialAngle(prev => (prev + diff + 360) % 360);

    accumulatedDeltaRef.current += diff;
    const notchThreshold = 18;

    if (Math.abs(accumulatedDeltaRef.current) >= notchThreshold) {
      const stepsToTake = Math.trunc(accumulatedDeltaRef.current / notchThreshold);
      accumulatedDeltaRef.current = accumulatedDeltaRef.current % notchThreshold;

      const yearDelta = stepsToTake * climateStep;
      let nextYear = climateYear + yearDelta;
      if (nextYear < minYear) nextYear = minYear;
      if (nextYear > maxYear) nextYear = maxYear;

      if (nextYear !== climateYear) {
        soundFx.playTick(stepsToTake > 0 ? 1.1 : 0.9);
        onYearChange(nextYear);
      }
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    stepTime(dir);
  };

  // Compact collapsed mode
  if (isCollapsed) {
    return (
      <div className="glass-panel rounded-2xl p-3 shadow-2xl flex items-center gap-3 border border-cyan-500/40 backdrop-blur-xl animate-fade-in">
        <button
          onClick={() => stepTime(-1)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300"
          title={`Step -${climateStep}y`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono text-cyan-400">Meltdown Dial</span>
          <span className="text-base font-bold font-mono text-cyan-200">
            {climateYear === BASE_YEAR ? '2026 (Now)' : `Year ${climateYear}`}
          </span>
          <span className="text-[10px] font-mono text-amber-300">
            +{metrics.seaLevelRise}m Sea Level
          </span>
        </div>
        <button
          onClick={() => stepTime(1)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300"
          title={`Step +${climateStep}y`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 ml-1"
          title="Expand Climate Dial"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Determine ocean surge color badge
  const isMeltdownComplete = metrics.remainingIcePct <= 0;

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col items-center gap-5 border border-cyan-500/30 backdrop-blur-xl bg-slate-950/85">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-1 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-300 font-bold">
            Ice Meltdown Chrono-Dial
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute Dial Audio' : 'Enable Dial Audio'}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            title="Minimize Dial"
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Rotary Dial Interface */}
      <div className="relative flex flex-col items-center justify-center my-1">
        {/* Outer Circular Rim */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className={`rotary-dial-rim w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center transition-shadow select-none ${
            isDragging ? 'ring-2 ring-cyan-400 shadow-cyan-500/30' : 'hover:ring-1 hover:ring-cyan-400/50'
          }`}
          title="Drag dial circularly or scroll mouse wheel to shift future ice melt"
        >
          {/* Cyan/Aqua Tick marks around perimeter */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-center"
              style={{
                transform: `rotate(${i * 15}deg) translateY(-84px) translateX(-50%)`,
                width: i % 6 === 0 ? '3px' : '1.5px',
                height: i % 6 === 0 ? '12px' : '7px',
                backgroundColor: i % 6 === 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)',
                borderRadius: '1px'
              }}
            />
          ))}

          {/* Inner Dial Plate */}
          <div className="rotary-dial-inner w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0a192f] to-[#040d1a]">
            {/* Pulsing Water Depth Ring */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <div className="w-28 h-28 border border-cyan-400 rounded-full animate-ping" />
              <div className="absolute w-20 h-20 border border-dashed border-cyan-300 rounded-full" />
            </div>

            {/* Rotating Cyan Needle */}
            <div
              className="absolute w-full h-full pointer-events-none transition-transform duration-75"
              style={{ transform: `rotate(${dialAngle}deg)` }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-7 bg-gradient-to-t from-cyan-500 to-sky-200 rounded-full shadow-[0_0_12px_#38bdf8]" />
            </div>

            {/* Center Dial Hub: Future Year & Sea Level Rise */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none px-2 text-center">
              <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400">
                {climateYear === BASE_YEAR ? 'CURRENT ERA' : `+${climateYear - BASE_YEAR} YEARS`}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-100 tracking-wider drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]">
                {climateYear === BASE_YEAR ? '2026' : `Year ${climateYear}`}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-bold font-mono text-cyan-300">
                  +{metrics.seaLevelRise}m
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  ({Math.round(metrics.seaLevelRise * 3.28)} ft)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center justify-between w-full max-w-[240px] mt-3">
          <button
            onClick={() => stepTime(-1)}
            disabled={climateYear <= minYear}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 border border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-200 text-xs font-mono transition-all shadow-md active:scale-95"
            title={`Step backward by ${climateStep} years`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>-{climateStep}y</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            Turn / Drag Dial
          </span>

          <button
            onClick={() => stepTime(1)}
            disabled={climateYear >= maxYear}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 border border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-200 text-xs font-mono transition-all shadow-md active:scale-95"
            title={`Step forward by ${climateStep} years`}
          >
            <span>+{climateStep}y</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Switch Slider Dial Selector (10y, 50y, 100y, 500y, 1000y, 2500y) */}
      <div className="w-full flex flex-col gap-2 pt-2 border-t border-cyan-500/20">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Shift Step Dial:
          </span>
          <span className="font-mono text-cyan-300 text-xs bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/40">
            ±{climateStep} Years / Notch
          </span>
        </div>

        {/* Notched Slider Switch Track */}
        <div className="switch-slider-track p-1 grid grid-cols-6 gap-1 bg-slate-900 border-cyan-500/30">
          {CLIMATE_STEP_OPTIONS.map((opt) => {
            const isActive = climateStep === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  soundFx.playSwitch();
                  onStepChange(opt.value);
                }}
                className={`relative py-1.5 px-0.5 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-cyan-600 to-sky-400 text-slate-950 font-bold shadow-md shadow-cyan-500/40 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="text-[11px] font-mono leading-tight">{opt.label}</span>
                <span className={`text-[8px] uppercase tracking-tighter opacity-80 ${isActive ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
