import React, { useRef, useState, useEffect, useCallback } from 'react';
import { soundFx } from '../utils/audio';
import { formatYear, getCurrentEra } from '../data/historyData';
import { ChevronLeft, ChevronRight, RotateCcw, Compass, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';

const STEP_OPTIONS = [
  { value: 10, label: '10 Yrs', sub: 'Fine' },
  { value: 50, label: '50 Yrs', sub: 'Era' },
  { value: 100, label: '100 Yrs', sub: 'Century' },
  { value: 500, label: '500 Yrs', sub: 'Epoch' },
  { value: 1000, label: '1000 Yrs', sub: 'Millennium' }
];

export default function TimeDial({
  currentYear,
  onYearChange,
  currentStep,
  onStepChange,
  minYear = -3000,
  maxYear = 2026
}) {
  const dialRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dialAngle, setDialAngle] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastAngleRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);

  const era = getCurrentEra(currentYear);

  // Toggle sound
  const handleToggleSound = () => {
    const newState = soundFx.toggle();
    setSoundEnabled(newState);
  };

  // Step backward or forward by current step
  const stepTime = useCallback((direction) => {
    const delta = direction * currentStep;
    let nextYear = currentYear + delta;
    if (nextYear < minYear) nextYear = minYear;
    if (nextYear > maxYear) nextYear = maxYear;

    soundFx.playTick(direction > 0 ? 1.1 : 0.9);
    onYearChange(nextYear);

    // rotate dial needle visually
    setDialAngle(prev => (prev + direction * 25) % 360);
  }, [currentYear, currentStep, minYear, maxYear, onYearChange]);

  // Handle Rotary Dial mouse / touch drag
  const calculateAngle = (clientX, clientY) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    let deg = rad * (180 / Math.PI);
    deg = (deg + 90 + 360) % 360; // 0 deg is North
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

    // Handle 0/360 wrap-around
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    lastAngleRef.current = angle;
    setDialAngle(prev => (prev + diff + 360) % 360);

    accumulatedDeltaRef.current += diff;
    // Each 18 degrees of rotation triggers one step increment
    const notchThreshold = 18;

    if (Math.abs(accumulatedDeltaRef.current) >= notchThreshold) {
      const stepsToTake = Math.trunc(accumulatedDeltaRef.current / notchThreshold);
      accumulatedDeltaRef.current = accumulatedDeltaRef.current % notchThreshold;

      const yearDelta = stepsToTake * currentStep;
      let nextYear = currentYear + yearDelta;
      if (nextYear < minYear) nextYear = minYear;
      if (nextYear > maxYear) nextYear = maxYear;

      if (nextYear !== currentYear) {
        soundFx.playTick(stepsToTake > 0 ? 1.05 : 0.95);
        onYearChange(nextYear);
      }
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  // Wheel scrubbing on dial
  const handleWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    stepTime(dir);
  };

  if (isCollapsed) {
    return (
      <div className="glass-panel-gold rounded-2xl p-3 shadow-2xl flex items-center gap-3 border border-amber-500/30 backdrop-blur-xl animate-fade-in">
        <button
          onClick={() => stepTime(-1)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300"
          title={`Step -${currentStep}y`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono text-slate-400">Time Dial</span>
          <span className="text-base font-bold font-cinzel text-amber-200">
            {formatYear(currentYear)}
          </span>
          <span className="text-[9px] font-mono text-amber-400/90">±{currentStep}y</span>
        </div>
        <button
          onClick={() => stepTime(1)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300"
          title={`Step +${currentStep}y`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 ml-1"
          title="Expand Rotary Dial"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel-gold rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col items-center gap-5 border border-amber-500/20 backdrop-blur-xl">
      {/* Top Header / Switch Description */}
      <div className="w-full flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <span className="text-xs uppercase tracking-widest font-mono text-amber-300 font-semibold">
            Temporal Chrono-Dial
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute Dial Audio' : 'Enable Dial Audio'}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            title="Minimize Dial"
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Rotary Dial Interface */}
      <div className="relative flex flex-col items-center justify-center my-1">
        {/* Outer Bevel / Ring */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className={`rotary-dial-rim w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center transition-shadow select-none ${
            isDragging ? 'ring-2 ring-amber-400 shadow-amber-500/30' : 'hover:ring-1 hover:ring-amber-400/50'
          }`}
          title="Drag circularly or scroll mouse wheel to turn the time dial"
        >
          {/* Tick marks around perimeter */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-center"
              style={{
                transform: `rotate(${i * 15}deg) translateY(-84px) translateX(-50%)`,
                width: i % 6 === 0 ? '3px' : '1.5px',
                height: i % 6 === 0 ? '12px' : '7px',
                backgroundColor: i % 6 === 0 ? '#d4af37' : 'rgba(255,255,255,0.25)',
                borderRadius: '1px'
              }}
            />
          ))}

          {/* Inner Dial Plate */}
          <div className="rotary-dial-inner w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Compass / Astrolabe Radial Lines */}
            <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
              <div className="w-28 h-28 border border-amber-300 rounded-full" />
              <div className="absolute w-20 h-20 border border-dashed border-amber-300 rounded-full" />
              <div className="absolute w-full h-px bg-amber-400/40" />
              <div className="absolute h-full w-px bg-amber-400/40" />
            </div>

            {/* Rotating Indicator Needle */}
            <div
              className="absolute w-full h-full pointer-events-none transition-transform duration-75"
              style={{ transform: `rotate(${dialAngle}deg)` }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-7 bg-gradient-to-t from-amber-500 to-amber-200 rounded-full shadow-[0_0_10px_#f59e0b]" />
            </div>

            {/* Center Dial Hub: Year Readout */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none px-2 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                ACTIVE YEAR
              </span>
              <span className="text-xl sm:text-2xl font-bold font-cinzel text-amber-200 tracking-wider drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]">
                {formatYear(currentYear)}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full border"
                style={{
                  color: era.themeColor,
                  borderColor: `${era.themeColor}50`,
                  backgroundColor: `${era.themeColor}15`
                }}
              >
                {era.name.split('&')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Dial Stepper Buttons (- / +) */}
        <div className="flex items-center justify-between w-full max-w-[240px] mt-3">
          <button
            onClick={() => stepTime(-1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-amber-400/50 text-slate-200 hover:text-amber-200 text-xs font-mono transition-all shadow-md active:scale-95"
            title={`Step backward by ${currentStep} years`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>-{currentStep}y</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono tracking-tight">
            Turn / Drag Dial
          </span>

          <button
            onClick={() => stepTime(1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-amber-400/50 text-slate-200 hover:text-amber-200 text-xs font-mono transition-all shadow-md active:scale-95"
            title={`Step forward by ${currentStep} years`}
          >
            <span>+{currentStep}y</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Switch Slider Dial Selector (10y, 50y, 100y, 500y, 1000y) */}
      <div className="w-full flex flex-col gap-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Step Granularity Dial:
          </span>
          <span className="font-mono text-amber-300 text-xs bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            ±{currentStep} Years / Tick
          </span>
        </div>

        {/* Notched Slider Switch Track */}
        <div className="switch-slider-track p-1 grid grid-cols-5 gap-1">
          {STEP_OPTIONS.map((opt) => {
            const isActive = currentStep === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  soundFx.playSwitch();
                  onStepChange(opt.value);
                }}
                className={`relative py-1.5 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'switch-slider-thumb text-slate-950 font-bold scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-mono leading-tight">{opt.label}</span>
                <span className={`text-[9px] uppercase tracking-tighter opacity-80 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
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
