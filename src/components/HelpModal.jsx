import React from 'react';
import { X, Compass, Sliders, Globe, FastForward, Waves, AlertTriangle, Landmark } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-gold rounded-3xl p-6 md:p-8 shadow-2xl max-w-xl w-full border border-cyan-400/40 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto bg-slate-950/95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 border border-cyan-400/40 flex items-center justify-center text-slate-950 font-bold">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans text-cyan-100">
              Planetary Explorer & Climate Meltdown Guide
            </h2>
            <p className="text-xs text-slate-400">
              Dual Modes: 5,000-Yr World History & Future Glacier Meltdown (+70m)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 flex flex-col gap-2 bg-slate-900/60">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Waves className="w-4 h-4" />
              <span>Glacier Meltdown Mode</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Travel from <strong>2026 into the deep future up to Year 10,000</strong>. See how Earth looks after all Antarctic and Greenland ice sheets melt (+68m / 223 ft sea level rise).
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 flex flex-col gap-2 bg-slate-900/60">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Landmark className="w-4 h-4" />
              <span>World History Mode</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Explore <strong>3000 BCE to 2026 CE</strong> across major empires (Rome, Han Dynasty, Mongols, Ottomans, etc.), capitals, battles, and historic trade routes.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-2 bg-slate-900/60">
            <div className="flex items-center gap-2 text-sky-300 font-bold">
              <Compass className="w-4 h-4" />
              <span>Rotary Time Dial</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Drag your mouse circularly or scroll your mouse wheel on the dial rim. Each click advances or rewinds time with realistic audio feedback.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-2 bg-slate-900/60">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Sliders className="w-4 h-4" />
              <span>Step Granularity Switch</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Shift between <strong>10y, 50y, 100y, 500y, 1000y, 2500y</strong> per tick to move through decades, centuries, or millennia.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 text-xs text-cyan-200/90 leading-relaxed flex flex-col gap-1.5">
          <p className="font-semibold flex items-center gap-1.5 text-cyan-100">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            What happens when all glacier ice melts?
          </p>
          <p className="text-slate-300">
            If all ice melts (~58m from Antarctica, ~7.5m from Greenland, ~0.5m from mountain glaciers), global sea levels rise by ~68 meters. Florida, the Netherlands, Denmark, Bangladesh, and the Nile Delta vanish underwater; the Amazon Basin becomes an inland ocean; and London, New York, Tokyo, and Shanghai are submerged.
          </p>
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
          <span>Shortcuts: `C` (Switch Mode) • `M` (2D/3D) • `←/→` (Step Time)</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl btn-cyan font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
        >
          Explore the Planetary Simulation
        </button>
      </div>
    </div>
  );
}
