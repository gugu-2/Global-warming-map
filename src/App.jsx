import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import Globe3D from './components/Globe3D';
import Map2D from './components/Map2D';
import TimeDial from './components/TimeDial';
import TimelineBar from './components/TimelineBar';
import EmpireInspector from './components/EmpireInspector';
import EventModal from './components/EventModal';
import HelpModal from './components/HelpModal';

// Climate Simulation Components
import ClimateGlobe3D from './components/ClimateGlobe3D';
import ClimateMap2D from './components/ClimateMap2D';
import ClimateDial from './components/ClimateDial';
import ClimateTimelineBar from './components/ClimateTimelineBar';
import ClimateTelemetry from './components/ClimateTelemetry';
import CityFloodingInspector from './components/CityFloodingInspector';
import VulnerableCitiesModal from './components/VulnerableCitiesModal';
import RealWorldMap from './components/RealWorldMap';
import ProvinceInspector from './components/ProvinceInspector';
import { Layers } from 'lucide-react';

import { getActiveEmpires } from './data/historyData';
import { getClimateMetricsForYear, BASE_YEAR } from './data/climateData';
import { soundFx } from './utils/audio';

export default function App() {
  // App Mode: 'history' or 'climate'
  const [appMode, setAppMode] = useState('climate'); // default to climate as requested by user!
  const [viewMode, setViewMode] = useState('real'); // default to 'real' Google Maps style!

  // History Mode State
  const [currentYear, setCurrentYear] = useState(117);
  const [currentStep, setCurrentStep] = useState(100);
  const [selectedEmpire, setSelectedEmpire] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Climate Meltdown Mode State: Default to 2176 (+150 Years, +2.8m rise)
  // At this benchmark, Egypt Alexandria and Iraq Basra/Mesopotamia are actively inundated!
  const [climateYear, setClimateYear] = useState(2176);
  const [climateStep, setClimateStep] = useState(100);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCitiesListOpen, setIsCitiesListOpen] = useState(false);

  // Provinces / States Admin-1 Mode State
  const [selectedProvince, setSelectedProvince] = useState(null);

  // Shared State
  const [focusedCoords, setFocusedCoords] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const activeEmpires = getActiveEmpires(currentYear);
  const climateMetrics = getClimateMetricsForYear(climateYear);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (appMode === 'history') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentYear(y => Math.max(-3000, y - currentStep));
          soundFx.playTick(0.9);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCurrentYear(y => Math.min(2026, y + currentStep));
          soundFx.playTick(1.1);
        }
      } else if (appMode === 'climate') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setClimateYear(y => Math.max(BASE_YEAR, y - climateStep));
          soundFx.playTick(0.85);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setClimateYear(y => Math.min(10000, y + climateStep));
          soundFx.playTick(1.15);
        }
      }

      if (e.key === 'm' || e.key === 'M') {
        setViewMode(v => v === '3d' ? 'real' : '3d');
        soundFx.playSwitch();
      } else if (e.key === 'c' || e.key === 'C') {
        setAppMode(m => m === 'history' ? 'climate' : m === 'climate' ? 'provinces' : 'history');
        soundFx.playWarp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appMode, currentStep, climateStep]);

  // Handle Search Result Selection
  const handleSelectSearchResult = (result) => {
    if (result.type === 'empire') {
      setSelectedEmpire(result.item);
      setCurrentYear(Math.round((result.item.startYear + result.item.endYear) / 2));
      if (result.item.capital) {
        setFocusedCoords([result.item.capital.lat, result.item.capital.lng]);
      }
      soundFx.playWarp();
    } else if (result.type === 'event') {
      setSelectedEvent(result.item);
      setCurrentYear(result.item.year);
      setFocusedCoords(result.item.coords);
      soundFx.playWarp();
    } else if (result.type === 'climateCity') {
      setSelectedCity(result.item);
      setFocusedCoords(result.item.coords);
      soundFx.playWarp();
    } else if (result.type === 'province') {
      setSelectedProvince(result.item);
      setFocusedCoords([result.item.lat, result.item.lng]);
      soundFx.playWarp();
    }
  };

  const handleFlyTo = (coords) => {
    setFocusedCoords(coords);
    soundFx.playWarp();
  };

  const isClimate = appMode === 'climate';
  const isProvinces = appMode === 'provinces';
  const isHistory = appMode === 'history';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050912] font-sans">
      {/* Top Header Bar */}
      <HeaderBar
        appMode={appMode}
        onToggleAppMode={(mode) => {
          setAppMode(mode);
          soundFx.playWarp();
        }}
        currentYear={currentYear}
        climateYear={climateYear}
        viewMode={viewMode}
        onToggleViewMode={(mode) => {
          setViewMode(mode);
          soundFx.playSwitch();
        }}
        activeEmpiresCount={activeEmpires.length}
        onSelectSearchResult={handleSelectSearchResult}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCitiesModal={() => setIsCitiesListOpen(true)}
      />

      {/* Main World Map (Real Google-Style Map or 3D Globe) */}
      <main className="w-full h-full absolute inset-0">
        {viewMode === 'real' ? (
          <RealWorldMap
            appMode={appMode}
            climateYear={climateYear}
            currentYear={currentYear}
            onSelectCity={(city) => setSelectedCity(city)}
            onSelectEmpire={(emp) => setSelectedEmpire(emp)}
            onSelectProvince={(prov) => setSelectedProvince(prov)}
            selectedProvince={selectedProvince}
            focusedCoords={focusedCoords}
            onOpenCitiesModal={() => setIsCitiesListOpen(true)}
          />
        ) : isClimate ? (
          <ClimateGlobe3D
            climateYear={climateYear}
            onSelectCity={(city) => setSelectedCity(city)}
            focusedCoords={focusedCoords}
          />
        ) : (
          <Globe3D
            currentYear={currentYear}
            onSelectEmpire={(emp) => setSelectedEmpire(emp)}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            focusedCoords={focusedCoords}
          />
        )}
      </main>

      {/* Climate Mode: Telemetry Overlay (Top Left) */}
      {isClimate && (
        <div className="absolute top-20 left-4 z-30 pointer-events-none">
          <ClimateTelemetry
            climateYear={climateYear}
            onOpenCitiesModal={() => setIsCitiesListOpen(true)}
          />
        </div>
      )}

      {/* Provinces Mode: Selected Province Inspector Side Drawer (Left) */}
      {isProvinces && selectedProvince && (
        <div className="absolute top-20 left-4 z-30">
          <ProvinceInspector
            province={selectedProvince}
            onClose={() => setSelectedProvince(null)}
            onFlyTo={handleFlyTo}
            onSelectProvince={(p) => setSelectedProvince(p)}
          />
        </div>
      )}

      {/* Provinces Mode: Quick Guide Info Card when no province is selected */}
      {isProvinces && !selectedProvince && (
        <div className="absolute top-20 left-4 z-30 glass-panel rounded-3xl p-4 border border-emerald-500/30 shadow-2xl max-w-xs bg-slate-950/85 backdrop-blur-xl animate-fade-in pointer-events-auto hidden sm:block">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                Provinces & States Map
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono">2,500+ Administrative Divisions</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Google Maps hides internal state borders when zooming. This explorer outlines and labels all <strong>provinces, oblasts, regions, and governorates</strong> with high contrast and zero clutter.
          </p>
          <div className="mt-3 flex flex-col gap-1 text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span>✓</span> <span>Entire Europe, Russia & South America</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span>✓</span> <span>Iran, Iraq, Turkey, Jordan & Lebanon</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span>✓</span> <span>Central Asia, Afghanistan & Caucasus</span>
            </div>
          </div>
        </div>
      )}

      {/* History Mode: Empire Inspector Side Drawer (Left) */}
      {isHistory && selectedEmpire && (
        <div className="absolute top-20 left-4 z-30">
          <EmpireInspector
            selectedEmpire={selectedEmpire}
            onClose={() => setSelectedEmpire(null)}
            currentYear={currentYear}
            onSelectEmpire={(emp) => setSelectedEmpire(emp)}
            onFlyTo={handleFlyTo}
          />
        </div>
      )}

      {/* Floating Time Machine Dial (Right) - History & Climate modes only */}
      {!isProvinces && (
        <div className="absolute right-4 bottom-32 sm:bottom-36 z-30">
          {isClimate ? (
            <ClimateDial
              climateYear={climateYear}
              onYearChange={(y) => setClimateYear(y)}
              climateStep={climateStep}
              onStepChange={(s) => setClimateStep(s)}
              minYear={BASE_YEAR}
              maxYear={10000}
            />
          ) : (
            <TimeDial
              currentYear={currentYear}
              onYearChange={(y) => setCurrentYear(y)}
              currentStep={currentStep}
              onStepChange={(s) => setCurrentStep(s)}
              minYear={-3000}
              maxYear={2026}
            />
          )}
        </div>
      )}

      {/* Master Bottom Timeline Controller - History & Climate modes only */}
      {!isProvinces && (
        <footer className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
          <div className="w-full max-w-5xl pointer-events-auto">
            {isClimate ? (
              <ClimateTimelineBar
                climateYear={climateYear}
                onYearChange={(y) => setClimateYear(y)}
                climateStep={climateStep}
                minYear={BASE_YEAR}
                maxYear={10000}
              />
            ) : (
              <TimelineBar
                currentYear={currentYear}
                onYearChange={(y) => setCurrentYear(y)}
                currentStep={currentStep}
                minYear={-3000}
                maxYear={2026}
              />
            )}
          </div>
        </footer>
      )}

      {/* Climate City Flooding Inspector Modal */}
      {isClimate && selectedCity && (
        <CityFloodingInspector
          city={selectedCity}
          seaLevelRise={climateMetrics.seaLevelRise}
          onClose={() => setSelectedCity(null)}
          onFlyTo={handleFlyTo}
        />
      )}

      {/* Vulnerable Cities Full List Modal */}
      {isClimate && (
        <VulnerableCitiesModal
          isOpen={isCitiesListOpen}
          onClose={() => setIsCitiesListOpen(false)}
          seaLevelRise={climateMetrics.seaLevelRise}
          onSelectCity={(city) => {
            setSelectedCity(city);
            setFocusedCoords(city.coords);
          }}
        />
      )}

      {/* History Event Modal */}
      {!isClimate && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onFlyTo={handleFlyTo}
        />
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
