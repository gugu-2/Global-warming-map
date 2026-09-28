import React from 'react';
import { X, Crown, Landmark, Users, MapPin, Award, Navigation, Globe } from 'lucide-react';
import { formatYear, getActiveEmpires } from '../data/historyData';

export default function EmpireInspector({
  selectedEmpire,
  onClose,
  currentYear,
  onSelectEmpire,
  onFlyTo
}) {
  const activeEmpires = getActiveEmpires(currentYear);

  if (!selectedEmpire) return null;

  return (
    <div className="glass-panel-gold rounded-3xl p-5 shadow-2xl border border-amber-500/30 flex flex-col gap-4 max-h-[85vh] overflow-y-auto w-full max-w-sm sm:max-w-md animate-fade-in backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${selectedEmpire.color}25`, border: `2px solid ${selectedEmpire.color}` }}
          >
            <Crown className="w-5 h-5" style={{ color: selectedEmpire.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold font-cinzel text-amber-100 leading-snug">
              {selectedEmpire.name}
            </h2>
            <span className="text-xs font-mono text-amber-400">
              {formatYear(selectedEmpire.startYear)} – {formatYear(selectedEmpire.endYear)}
            </span>
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

      {/* Fly To / Center Button */}
      {selectedEmpire.capital && onFlyTo && (
        <button
          onClick={() => onFlyTo([selectedEmpire.capital.lat, selectedEmpire.capital.lng])}
          className="w-full py-2 px-3 rounded-xl btn-gold text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Focus Globe on Capital ({selectedEmpire.capital.name})</span>
        </button>
      )}

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="glass-panel rounded-2xl p-3 flex flex-col gap-1 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase font-mono">Imperial Capital</span>
          </div>
          <span className="font-bold text-slate-100">{selectedEmpire.capital?.name || 'Various'}</span>
        </div>

        <div className="glass-panel rounded-2xl p-3 flex flex-col gap-1 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase font-mono">Notable Ruler</span>
          </div>
          <span className="font-bold text-slate-100 truncate">{selectedEmpire.ruler}</span>
        </div>

        <div className="glass-panel rounded-2xl p-3 flex flex-col gap-1 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] uppercase font-mono">Peak Population</span>
          </div>
          <span className="font-bold text-slate-100">{selectedEmpire.peakPopulation}</span>
        </div>

        <div className="glass-panel rounded-2xl p-3 flex flex-col gap-1 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] uppercase font-mono">Territory Area</span>
          </div>
          <span className="font-bold text-slate-100">{selectedEmpire.area}</span>
        </div>
      </div>

      {/* Historical Description */}
      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-2xl border border-white/5">
        <p>{selectedEmpire.description}</p>
      </div>

      {/* Cultural & Technological Achievements */}
      {selectedEmpire.achievements && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Key Civilizational Breakthroughs:</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {selectedEmpire.achievements.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs bg-slate-800/40 px-3 py-1.5 rounded-xl border border-white/5 text-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Active Civilizations in this Year */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
          Other Realms Active in {formatYear(currentYear)} ({activeEmpires.length}):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {activeEmpires.map(emp => (
            <button
              key={emp.id}
              onClick={() => onSelectEmpire(emp)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                selectedEmpire.id === emp.id
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emp.color }} />
              <span>{emp.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
