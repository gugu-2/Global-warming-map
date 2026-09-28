import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  VULNERABLE_CITIES,
  getActiveFloodTiers,
  getCityFloodStatus,
  getClimateMetricsForYear,
  BASE_YEAR
} from '../data/climateData';
import { getActiveEmpires, formatYear } from '../data/historyData';
import { chaikinSmooth } from '../utils/geoSmooth';
import {
  Layers,
  Navigation,
  Waves,
  AlertTriangle,
  X,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
  Anchor
} from 'lucide-react';

// Tile Layer Configurations (Photorealistic Satellite, Clean Street/Vector, and Topo)
const TILE_LAYERS = {
  satellite: {
    name: 'Satellite (Google Earth Style)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
  },
  street: {
    name: 'Street / Vector (Google Maps Style)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  },
  terrain: {
    name: 'Topographic Terrain (Elevation Contours)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap, SRTM &copy; OpenTopoMap',
    subdomains: 'abc',
    maxZoom: 17
  }
};

export default function RealWorldMap({
  appMode, // 'climate' | 'history'
  climateYear,
  currentYear,
  onSelectCity,
  onSelectEmpire,
  focusedCoords,
  onOpenCitiesModal
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const labelsTileLayerRef = useRef(null);
  const floodLayerGroupRef = useRef(null);
  const markersLayerGroupRef = useRef(null);

  const [activeLayerType, setActiveLayerType] = useState('satellite');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showCityMarkers, setShowCityMarkers] = useState(true);
  const [activeSpotlight, setActiveSpotlight] = useState('bangladesh');

  const climateMetrics = getClimateMetricsForYear(climateYear);
  const isClimate = appMode === 'climate';

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [25, 45], // Global focus centering Middle East, Africa & South Asia
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true
    });
    mapInstanceRef.current = map;

    // Default to high-resolution satellite imagery
    const baseConfig = TILE_LAYERS.satellite;
    const baseLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom
    }).addTo(map);
    baseTileLayerRef.current = baseLayer;

    // English country & city place labels on top of satellite
    const labelsLayer = L.tileLayer(baseConfig.labelsUrl, {
      maxZoom: baseConfig.maxZoom,
      opacity: 0.85
    }).addTo(map);
    labelsTileLayerRef.current = labelsLayer;

    const floodGroup = L.layerGroup().addTo(map);
    floodLayerGroupRef.current = floodGroup;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      try {
        map.stop();
        map.remove();
      } catch (err) {
        // ignore animation race condition during unmount/HMR
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Map Tile Provider
  const handleSwitchLayer = (type) => {
    if (!mapInstanceRef.current || !TILE_LAYERS[type]) return;
    const map = mapInstanceRef.current;
    const config = TILE_LAYERS[type];

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }

    const newBase = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || 'abc',
      maxZoom: config.maxZoom
    }).addTo(map);
    baseTileLayerRef.current = newBase;

    if (config.labelsUrl) {
      const labels = L.tileLayer(config.labelsUrl, {
        maxZoom: config.maxZoom,
        opacity: 0.85
      }).addTo(map);
      labelsTileLayerRef.current = labels;
    }

    setActiveLayerType(type);
    setShowLayerMenu(false);
  };

  // 3. Smooth Camera Fly-To
  useEffect(() => {
    if (!mapInstanceRef.current || !focusedCoords) return;
    const [lat, lng] = focusedCoords;
    try {
      mapInstanceRef.current.stop();
      mapInstanceRef.current.flyTo([lat, lng], 8, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    } catch (err) {
      // safe fallback
    }
  }, [focusedCoords]);

  // 4. Update Dynamic Map Overlays with Smooth, Realistic Coastline Contours & Depth-Based Shading
  useEffect(() => {
    if (!mapInstanceRef.current || !floodLayerGroupRef.current || !markersLayerGroupRef.current) return;

    const floodGroup = floodLayerGroupRef.current;
    const markersGroup = markersLayerGroupRef.current;

    floodGroup.clearLayers();
    markersGroup.clearLayers();

    if (isClimate) {
      // --- CLIMATE FLOODING OVERLAYS ---
      const { seaLevelRise } = climateMetrics;
      const activeTiers = getActiveFloodTiers(seaLevelRise);

      // Group and determine highest active stage per region to highlight the advancing water front
      const highestTierByRegion = {};
      activeTiers.forEach(t => {
        if (!highestTierByRegion[t.region] || t.minRise > highestTierByRegion[t.region].minRise) {
          highestTierByRegion[t.region] = t;
        }
      });

      // Render Each Progressive Contour with Bathymetric Depth Shading & Chaikin Smoothing (3 passes!)
      activeTiers.forEach(tier => {
        const isLeadingEdge = highestTierByRegion[tier.region] === tier;
        const smoothPoints = chaikinSmooth(tier.points, 3);

        // BATHYMETRIC DENSITY:
        // Deep interior areas are DARK NAVY BLUE (#021a36) with high opacity (0.85-0.92)
        // Near newly crept shoreline is LIGHT SKY BLUE (#38bdf8) with glowing cyan edge (#7dd3fc)
        const polygon = L.polygon(smoothPoints, {
          color: isLeadingEdge ? '#7dd3fc' : tier.strokeColor,
          weight: isLeadingEdge ? 2.8 : tier.weight,
          opacity: isLeadingEdge ? 0.95 : 0.65,
          fillColor: isLeadingEdge ? '#0ea5e9' : tier.fillColor,
          fillOpacity: isLeadingEdge ? Math.min(0.55, tier.fillOpacity) : tier.fillOpacity,
          className: isLeadingEdge ? 'realistic-flood-layer active-water-front' : 'realistic-flood-layer',
          smoothFactor: 0.5
        });

        polygon.bindTooltip(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; padding: 4px; min-width: 180px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <strong style="color: #38bdf8; font-size: 12px;">🌊 ${tier.region}</strong>
              <span style="font-size: 9px; background: rgba(56,189,248,0.25); color: #7dd3fc; padding: 1px 6px; border-radius: 6px; font-weight: bold;">
                Stage ${tier.tier}
              </span>
            </div>
            <div style="color: #f1f5f9; font-weight: 600; margin-bottom: 3px; line-height: 1.3;">${tier.name}</div>
            <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 3px; display: flex; justify-content: space-between;">
              <span>Depth: <strong style="color: #38bdf8;">~${tier.localDepth}m water</strong></span>
              <span style="text-transform: capitalize; color: #cbd5e1;">${tier.depthCategory}</span>
            </div>
          </div>
        `);

        floodGroup.addLayer(polygon);
      });

      // Render Vulnerable Coastal Megacity Markers (if toggled on)
      if (showCityMarkers) {
        VULNERABLE_CITIES.forEach(city => {
          const floodInfo = getCityFloodStatus(city, seaLevelRise);
          const isSubmerged = floodInfo.status === 'SUBMERGED';
          const isAbyss = floodInfo.isAbyss;

          // Google Maps style modern pill marker
          const customIcon = L.divIcon({
            className: 'custom-city-marker',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                ${isSubmerged && !isAbyss
                  ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${floodInfo.color}; opacity: 0.45; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                  : ''}
                ${isAbyss
                  ? `<div style="width: 22px; height: 22px; border-radius: 50%; background: #021a36; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(56,189,248,0.8); font-size: 10px;">🌊</div>`
                  : `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${floodInfo.color}; border: 2.5px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.8);"></div>`}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([city.coords[0], city.coords[1]], { icon: customIcon });

          marker.on('click', () => {
            if (onSelectCity) onSelectCity(city);
          });

          // Rich Google Maps Place Card Popup
          marker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 210px; padding: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); pb-1;">
                <div>
                  <strong style="font-size: 13px; color: #f8fafc;">${city.name}</strong>
                  <span style="font-size: 10px; color: #94a3b8; display: block;">${city.country}</span>
                </div>
                <span style="font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; background: ${floodInfo.color}30; color: ${floodInfo.color}; border: 1px solid ${floodInfo.color}60;">
                  ${floodInfo.badge}
                </span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.5;">
                Elevation: <strong style="color: #f1f5f9;">${city.elevation}m</strong><br/>
                Submergence Threshold: <strong style="color: #f59e0b;">+${city.floodThreshold}m</strong> (Year ~${city.submergenceYear})<br/>
                At-Risk Population: <strong>${city.population}</strong><br/>
                Submerged Area: <strong style="color: #38bdf8;">${city.submergedAreaKm2}</strong>
              </div>
              <div style="font-size: 11px; font-weight: bold; color: ${floodInfo.color}; background: rgba(0,0,0,0.5); padding: 5px 8px; border-radius: 8px;">
                ${isAbyss ? '🌊 EXTINCT RUIN: ' : isSubmerged ? '⚠️ ' : ''}Status: ${floodInfo.depth}
              </div>
            </div>
          `);

          markersGroup.addLayer(marker);
        });
      }
    } else {
      // --- WORLD HISTORY OVERLAYS ---
      const activeEmpires = getActiveEmpires(currentYear);

      activeEmpires.forEach(empire => {
        if (empire.territory && empire.territory.length > 2) {
          const smoothEmpirePoints = chaikinSmooth(empire.territory, 2);

          const poly = L.polygon(smoothEmpirePoints, {
            color: empire.color,
            weight: 2.5,
            opacity: 0.9,
            fillColor: empire.color,
            fillOpacity: 0.35,
            smoothFactor: 0.8
          });

          poly.on('click', () => {
            if (onSelectEmpire) onSelectEmpire(empire);
          });

          poly.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px;">
              <strong style="color: ${empire.color};">${empire.name}</strong><br/>
              ${formatYear(empire.startYear)} – ${formatYear(empire.endYear)}
            </div>
          `);

          floodGroup.addLayer(poly);
        }

        if (empire.capital) {
          const capIcon = L.divIcon({
            className: 'custom-cap-marker',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${empire.color}; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.6);"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const capMarker = L.marker([empire.capital.lat, empire.capital.lng], { icon: capIcon });
          capMarker.on('click', () => {
            if (onSelectEmpire) onSelectEmpire(empire);
          });

          capMarker.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px;">
              <strong>${empire.capital.name}</strong> (Capital)<br/>
              ${empire.name}
            </div>
          `);

          markersGroup.addLayer(capMarker);
        }
      });
    }
  }, [appMode, climateYear, currentYear, climateMetrics, isClimate, onSelectCity, onSelectEmpire, showCityMarkers]);

  // Quick Fly to Vulnerable Region
  const handleFlyToRegion = (coords, zoom = 7, spotlightKey = null) => {
    if (!mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.stop();
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 1.5 });
    } catch (err) {
      // safe fallback
    }
    if (spotlightKey) setActiveSpotlight(spotlightKey);
  };

  // Helper for Bangladesh Submergence calculation
  const getBangladeshInundation = (seaRise) => {
    if (seaRise < 0.15) return { pct: 0, desc: 'Coastline intact at present 2026 baseline. Outer dykes holding.' };
    if (seaRise < 0.50) return { pct: 8, desc: 'Outer Sundarbans mudflats & Dublar Char flooded.' };
    if (seaRise < 0.85) return { pct: 15, desc: 'Sundarbans core mangrove perimeter & Nijhum Dwip submerged.' };
    if (seaRise < 1.25) return { pct: 24, desc: 'Kuakata coastline, Barguna south & Lower Bhola Island under water.' };
    if (seaRise < 1.60) return { pct: 32, desc: 'Barguna coastal polders, Bagerhat & Sandwip submerged.' };
    if (seaRise < 2.10) return { pct: 42, desc: 'Khulna south, Mongla Port channels & Barisal south inundated.' };
    if (seaRise < 2.65) return { pct: 52, desc: 'Pirojpur, Jhalokati & Lower Meghna channels submerged.' };
    if (seaRise < 3.30) return { pct: 64, desc: '🎯 +150 YEARS MILESTONE (+2.8m): Gopalganj, Madaripur, Shariatpur & Chandpur submerged! Over 64% of delta plains lost.' };
    if (seaRise < 4.80) return { pct: 72, desc: 'Faridpur southern plains & Lower Meghna confluence merged into marine bay.' };
    if (seaRise < 8.00) return { pct: 80, desc: 'Inundation approaches southern borders of Dhaka (Munshiganj & Comilla).' };
    if (seaRise < 16.0) return { pct: 88, desc: 'Central delta plains & Dhaka low-lying metropolitan districts submerged.' };
    if (seaRise < 35.0) return { pct: 93, desc: 'Greater Central Bangladesh (Dhaka completely underwater).' };
    return { pct: 98, desc: 'Total Bengal Gulf: Bay of Bengal laps directly against the Himalayan foothills.' };
  };

  const bdInfo = getBangladeshInundation(climateMetrics.seaLevelRise);

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Map Style & Marker Controls Selector (Top Right) */}
      <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Toggle Sunken City Markers */}
          {isClimate && (
            <button
              onClick={() => setShowCityMarkers(!showCityMarkers)}
              className="glass-panel p-2.5 rounded-2xl flex items-center gap-1.5 border border-cyan-500/30 shadow-2xl hover:bg-slate-800 text-slate-100 transition-all active:scale-95 bg-slate-950/90"
              title={showCityMarkers ? 'Hide Coastal City Markers' : 'Show Coastal City Markers'}
            >
              {showCityMarkers ? (
                <>
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono hidden sm:inline">Cities On</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">Cities Off</span>
                </>
              )}
            </button>
          )}

          {/* Map Layer Switcher Button */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="glass-panel p-2.5 rounded-2xl flex items-center gap-2 border border-cyan-500/30 shadow-2xl hover:bg-slate-800 text-slate-100 transition-all active:scale-95 bg-slate-950/90"
            title="Change Map Style (Satellite / Street / Terrain)"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold capitalize font-mono hidden sm:inline">
              {TILE_LAYERS[activeLayerType].name.split(' ')[0]}
            </span>
          </button>
        </div>

        {showLayerMenu && (
          <div className="glass-panel rounded-2xl p-2 shadow-2xl border border-cyan-500/40 flex flex-col gap-1 w-64 bg-slate-950/95 animate-fade-in">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1">
              Select Map Style:
            </span>
            {Object.entries(TILE_LAYERS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleSwitchLayer(key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                  activeLayerType === key
                    ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{config.name}</span>
                {activeLayerType === key && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Research-Based Quick Fly-To Hotspots Bar (Bottom Left) */}
      <div className="absolute bottom-24 left-4 z-20 hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl bg-slate-950/90 pointer-events-auto flex-wrap max-w-3xl">
        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 px-2 flex items-center gap-1 font-bold">
          <Navigation className="w-3 h-3 text-cyan-400" />
          Hotspots:
        </span>
        <button
          onClick={() => handleFlyToRegion([31.0, 31.0], 8, 'egypt')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors font-bold ${
            activeSpotlight === 'egypt'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-lg'
              : 'text-cyan-200 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/80'
          }`}
          title="Zoom to Egypt (Alexandria & Nile Delta Inundation)"
        >
          🇪🇬 Egypt (Nile)
        </button>
        <button
          onClick={() => handleFlyToRegion([31.0, 47.0], 8, 'iraq')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors font-bold ${
            activeSpotlight === 'iraq'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-lg'
              : 'text-cyan-200 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/80'
          }`}
          title="Zoom to Iraq (Tigris-Euphrates Valleys & Basra Inundation)"
        >
          🇮🇶 Iraq (Tigris)
        </button>
        <button
          onClick={() => handleFlyToRegion([22.8, 90.2], 8, 'bangladesh')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors font-bold ${
            activeSpotlight === 'bangladesh'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-lg'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Bangladesh Delta (Watch water creep inland stage by stage!)"
        >
          🇧🇩 Bangladesh
        </button>
        <button
          onClick={() => handleFlyToRegion([10.2, 105.8], 8, 'vietnam')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors font-bold ${
            activeSpotlight === 'vietnam'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-lg'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Vietnam Mekong Delta (70% drowned by +2.8m!)"
        >
          🇻🇳 Vietnam
        </button>
        <button
          onClick={() => handleFlyToRegion([-29.5, 137.5], 6, 'australia')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors font-bold ${
            activeSpotlight === 'australia'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-lg'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Australia (Lake Eyre Basin Inland Sea & Spencer Gulf)"
        >
          🇦🇺 Australia (Lake Eyre)
        </button>
        <button
          onClick={() => handleFlyToRegion([14.8, 120.8], 8, 'philippines')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'philippines'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Philippines (Manila Bay & Central Luzon Channel)"
        >
          🇵🇭 Philippines
        </button>
        <button
          onClick={() => handleFlyToRegion([45.4387, 12.3271], 10, 'venice')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'venice'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Venice & Po Valley (submerged at +1.1m; 63m deep at 7000y!)"
        >
          Venice (Italy)
        </button>
        <button
          onClick={() => handleFlyToRegion([26.5, -81.5], 7, 'florida')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'florida'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Florida Peninsula (erased at +68m)"
        >
          Florida
        </button>
        <button
          onClick={() => handleFlyToRegion([-2.5, -54.5], 6, 'amazon')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'amazon'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Amazon Basin (river trough floods, Brazilian Highlands remain DRY!)"
        >
          Amazon (Brazil)
        </button>
        <button
          onClick={() => handleFlyToRegion([52.5, 5.0], 8, 'netherlands')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'netherlands'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Netherlands & Flanders"
        >
          Netherlands
        </button>
        <button
          onClick={() => handleFlyToRegion([31.2, 121.5], 8, 'shanghai')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'shanghai'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Shanghai & Yangtze River Plain"
        >
          🇨🇳 Shanghai
        </button>
        <button
          onClick={() => handleFlyToRegion([51.5, 0.0], 9, 'london')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'london'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to London & Thames Estuary"
        >
          🇬🇧 London
        </button>
        <button
          onClick={() => handleFlyToRegion([6.5, 3.4], 9, 'lagos')}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeSpotlight === 'lagos'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60'
              : 'text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50'
          }`}
          title="Zoom to Lagos & Niger Delta (West Africa)"
        >
          🇳🇬 Lagos
        </button>
        <button
          onClick={() => handleFlyToRegion([20, 0], 3, null)}
          className="px-2.5 py-1 rounded-xl text-xs font-mono text-cyan-300 hover:bg-cyan-950/60 font-bold transition-colors"
          title="Reset to Global World View"
        >
          ⟲ World
        </button>
        {onOpenCitiesModal && isClimate && (
          <button
            onClick={onOpenCitiesModal}
            className="ml-1 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 transition-all flex items-center gap-1 shadow-sm"
            title="Open Complete Research Directory of all 52 Global Inundation Regions"
          >
            <span>📊 Global Directory</span>
          </button>
        )}
      </div>

      {/* Dynamic Regional Spotlight HUD Card: EGYPT */}
      {isClimate && activeSpotlight === 'egypt' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇪🇬</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Egypt: Alexandria & Nile Delta
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Nile Delta Inundation Profile (+{climateMetrics.seaLevelRise}m Rise):
              </div>
              {climateMetrics.seaLevelRise < 0.8
                ? 'Coastline intact. Ancient seawalls protect Alexandria and Rosetta.'
                : climateMetrics.seaLevelRise < 2.0
                ? 'Alexandria coastal lagoons (Lake Maryut, Lake Idku, Lake Manzala) breach. Alexandria beaches underwater.'
                : climateMetrics.seaLevelRise < 4.5
                ? 'Historic Alexandria permanently submerged. Kafr El Sheikh and northern Egyptian agricultural breadbasket lost.'
                : climateMetrics.seaLevelRise < 14.0
                ? 'Central Nile Delta plains (Tanta, Mansoura, Damanhur) drowned beneath the Mediterranean Sea.'
                : 'Mediterranean Sea converts the entire Nile Delta into an open marine gulf reaching the foot of Cairo and Giza.'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              Average elevation is only 1.5m to 3.0m in the northern delta. Over 18,500 km² of fertile land is lost.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: IRAQ */}
      {isClimate && activeSpotlight === 'iraq' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇮🇶</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Iraq: Tigris & Euphrates (Mesopotamia)
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Persian Gulf Incursion Profile (+{climateMetrics.seaLevelRise}m Rise):
              </div>
              {climateMetrics.seaLevelRise < 1.0
                ? 'Tigris-Euphrates river mouths and Shatt al-Arab flowing normally.'
                : climateMetrics.seaLevelRise < 3.0
                ? 'Shatt al-Arab tidal salt water pushes past Basra. Al-Faw peninsula and Kuwait lowlands flood.'
                : climateMetrics.seaLevelRise < 12.0
                ? 'Basra permanently submerged. The Mesopotamian marshes (Al-Ahwar, Chibayish) drowned beneath the sea.'
                : climateMetrics.seaLevelRise < 28.0
                ? 'The Persian Gulf pushes 250 km inland up the Tigris and Euphrates river valleys towards Amarah and Nasiriyah.'
                : '🌊 ANCIENT GULF REOPENED: Persian Gulf extends over 380 km inland, drowning southern Iraq and approaching Baghdad.'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              Southern Iraq is an ultra-flat alluvial floodplain with an elevation of only 2m to 5m across over 45,000 km².
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: BANGLADESH */}
      {isClimate && activeSpotlight === 'bangladesh' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇧🇩</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Bangladesh Progressive Inundation
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs">
            {/* Submergence Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-slate-300">Delta Plains Submerged:</span>
                <span className="text-cyan-300 font-bold text-sm">{bdInfo.pct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${bdInfo.pct}%` }}
                />
              </div>
            </div>

            {/* Stage Description */}
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed text-slate-200">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1 flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-400" />
                Active Water Front (+{climateMetrics.seaLevelRise}m Rise):
              </div>
              {bdInfo.desc}
            </div>

            {/* Scientific Explanation */}
            <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Realistic elevation mechanics:</strong> Ground elevation slopes gently upward from 0m at the Bay of Bengal to 4m at Dhaka. Inundation creeps inland year-by-year along river channels rather than flooding all at once.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: VIETNAM */}
      {isClimate && activeSpotlight === 'vietnam' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇻🇳</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Vietnam: Mekong & Red River Deltas
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Mekong Delta Inundation Profile:
              </div>
              {climateMetrics.seaLevelRise < 0.6
                ? 'Coastline intact. Mangrove polders in Ca Mau and Bac Lieu protect paddy fields.'
                : climateMetrics.seaLevelRise < 2.0
                ? 'Water creeps through Tra Vinh, Ben Tre, and Soc Trang coastal canals. Rice production severely impacted.'
                : climateMetrics.seaLevelRise < 5.0
                ? 'Over 70% of Vietnam’s Mekong Delta breadbasket permanently underwater (Can Tho, Long An, HCMC south).'
                : 'Mekong Delta completely submerged into an open marine gulf extending past Phnom Penh to Tonle Sap.'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              Average elevation is only 1.2m across the southern delta. By +2.8m (150 years), the entire lower delta is lost to the sea.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: AUSTRALIA */}
      {isClimate && activeSpotlight === 'australia' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇦🇺</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Australia: Lake Eyre Inland Sea
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Ancient Basin Re-flooding:
              </div>
              {climateMetrics.seaLevelRise < 1.5
                ? 'Southern Australian coastline intact. Adelaide and Spencer Gulf at normal levels.'
                : climateMetrics.seaLevelRise < 22.0
                ? 'Spencer Gulf and Gulf St Vincent expand deeply into coastal South Australia. Port Pirie and Adelaide lowlands submerged.'
                : '🌊 INTERIOR OCEAN FORMED: Southern Ocean breaches into the below-sea-level Lake Eyre basin (-15m elevation), creating an Australian Inland Sea of over 120,000 km²!'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              Lake Eyre is naturally 15 meters below global sea level. Once sea level exceeds +22m to +68m, the desert basin transforms into a permanent interior ocean.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: VENICE */}
      {isClimate && activeSpotlight === 'venice' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇮🇹</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Venice & Po Valley Submergence
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2.5 text-xs text-slate-300">
            <div className="font-mono text-[11px] flex justify-between">
              <span>Street Elevation:</span>
              <strong className="text-amber-300">1.0m MSL</strong>
            </div>
            <div className="font-mono text-[11px] flex justify-between">
              <span>Water Depth Above Venice:</span>
              <strong className={climateMetrics.seaLevelRise >= 1.1 ? 'text-cyan-300 font-bold' : 'text-emerald-400'}>
                {climateMetrics.seaLevelRise >= 1.1
                  ? `${(climateMetrics.seaLevelRise - 1.0).toFixed(1)}m underwater`
                  : `${(1.0 - climateMetrics.seaLevelRise).toFixed(1)}m above water`}
              </strong>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/60 p-2.5 rounded-2xl border border-white/5">
              {climateMetrics.seaLevelRise < 1.1
                ? 'Venice is protected by high-tide MOSE mobile floodgates.'
                : climateMetrics.seaLevelRise < 15.0
                ? 'Venice is permanently submerged beneath the Adriatic Sea. Water invades Po Valley up to Ferrara.'
                : `🌊 ABYSSAL DEEP OCEAN: Venice lies under ${Math.round(climateMetrics.seaLevelRise - 1.0)}m of dark open ocean in the deep Padan Gulf extending 200km inland to Cremona and Piacenza.`}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: AMAZON (BRAZIL) */}
      {isClimate && activeSpotlight === 'amazon' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇧🇷</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Brazil / Amazon Basin Dynamics
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2.5 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] leading-relaxed text-emerald-200 font-semibold">
              🛡️ Brazilian Highlands (Brasília, São Paulo, Rio) are 600m–1200m high and NEVER flood.
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/60 p-2.5 rounded-2xl border border-white/5">
              {climateMetrics.seaLevelRise < 4.5
                ? 'No inland flooding in Brazil during the first 150-200 years (+0 to +2.8m). Interior rainforest is safely elevated.'
                : climateMetrics.seaLevelRise < 35.0
                ? 'The Atlantic enters the narrow Amazon river channel between Belém and Santarém.'
                : 'At +35m to +68m, the low riverbed forms an inland sea reaching Manaus, while surrounding highlands remain 100% dry.'}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: SHANGHAI */}
      {isClimate && activeSpotlight === 'shanghai' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇨🇳</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                China: Shanghai & Yangtze Plain
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Yangtze River Inundation (+{climateMetrics.seaLevelRise}m Rise):
              </div>
              {climateMetrics.seaLevelRise < 1.5
                ? 'Yangtze estuary Chongming Island mudflats protected by coastal seawalls.'
                : climateMetrics.seaLevelRise < 3.5
                ? 'Chongming Island submerged. Pudong airport perimeter and coastal Yangtze marshes breach.'
                : climateMetrics.seaLevelRise < 7.0
                ? 'Shanghai metropolitan lowlands and Hangzhou Bay flood. Lake Taihu basin inundated.'
                : '🌊 EAST CHINA SEA INVADES: The ocean pushes over 400 km inland past Nanjing, converting the East China Plain into an interior sea of 120,000 km².'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              Yangtze Delta elevation averages 3m to 5m. Over 120,000 km² of the most densely populated plains in the world are submerged at +68m.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: LONDON */}
      {isClimate && activeSpotlight === 'london' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                United Kingdom: London & Thames
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Thames Estuary Inundation Profile:
              </div>
              {climateMetrics.seaLevelRise < 1.5
                ? 'Thames Barrier successfully protects London from North Sea tidal surges.'
                : climateMetrics.seaLevelRise < 5.0
                ? 'Thames Barrier permanently overwhelmed. Southend, Isle of Sheppey, and Thames marshes submerged.'
                : 'Canary Wharf, Westminster, Parliament, and London Docklands permanently submerged beneath the North Sea.'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              At +68m total deglaciation, London lies under 55 meters of seawater, and the North Sea covers East Anglia.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Regional Spotlight HUD Card: LAGOS */}
      {isClimate && activeSpotlight === 'lagos' && (
        <div className="absolute top-28 right-4 z-20 glass-panel rounded-3xl p-4 border border-cyan-500/40 shadow-2xl max-w-xs sm:max-w-sm bg-slate-950/90 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🇳🇬</span>
              <strong className="text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Nigeria: Lagos & Niger River Delta
              </strong>
            </div>
            <button
              onClick={() => setActiveSpotlight(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] leading-relaxed">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
                Gulf of Guinea Incursion (+{climateMetrics.seaLevelRise}m Rise):
              </div>
              {climateMetrics.seaLevelRise < 1.0
                ? 'Lagos coastal lagoons intact. Beach erosion active along Bar Beach and Lekki.'
                : climateMetrics.seaLevelRise < 3.0
                ? 'Victoria Island, Lekki Peninsula, and Makoko stilt districts permanently submerged. Niger Delta mangrove loss.'
                : 'The Atlantic Ocean drowns Port Harcourt, Warri, and 26,000 km² of the Niger River Delta, displacing over 24 million people.'}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              Average coastal elevation is under 2.0m. Over 24 million people and Africa’s largest economic zone face total displacement.
            </div>
          </div>
        </div>
      )}
      {isClimate && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 glass-panel px-4 py-2 rounded-2xl border border-cyan-400/40 shadow-xl bg-slate-950/90 hidden sm:flex flex-col items-center gap-1.5 text-xs font-mono pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300 font-semibold">Water Front:</span>
              <span className="text-cyan-300 font-bold">+{climateMetrics.seaLevelRise}m</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1 text-slate-300">
              <span>Flooded Land:</span>
              <span className="text-sky-300 font-bold">{climateMetrics.floodedAreaKm2?.toLocaleString()} km²</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1 text-slate-300">
              <span>Active Stages:</span>
              <span className="text-amber-300 font-bold">{getActiveFloodTiers(climateMetrics.seaLevelRise).length} Contours</span>
            </div>
          </div>

          {/* Visual Bathymetric Color Density Legend */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[9px] uppercase tracking-wider text-slate-400">
            <span className="text-cyan-400 font-bold">Depth Density:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-2 rounded bg-[#38bdf8] inline-block opacity-75" />
              <span>Shallow Sky Blue (&lt;2m)</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-2 rounded bg-[#0284c7] inline-block opacity-85" />
              <span>Marine Blue (5-15m)</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-2 rounded bg-[#021a36] inline-block border border-cyan-400/40" />
              <span className="text-cyan-200 font-bold">Dark Abyssal Navy (&gt;30m)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
