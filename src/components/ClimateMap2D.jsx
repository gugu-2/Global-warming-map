import React, { useRef, useState } from 'react';
import { CONTINENTS } from '../data/worldGeo';
import {
  getClimateMetricsForYear,
  VULNERABLE_CITIES,
  FLOOD_ZONES,
  getCityFloodStatus
} from '../data/climateData';

export default function ClimateMap2D({
  climateYear,
  onSelectCity,
  focusedCoords
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const metrics = getClimateMetricsForYear(climateYear);
  const { seaLevelRise, remainingIcePct } = metrics;

  const mapWidth = 1200;
  const mapHeight = 600;

  function toSvgCoords(lat, lng) {
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return [x, y];
  }

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom(prev => Math.max(0.8, Math.min(6.0, prev * scaleFactor)));
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="w-full h-full relative overflow-hidden bg-[#050d1a] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(6, z * 1.25))}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-cyan-500/20"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.8, z / 1.25))}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-cyan-500/20"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center text-xs font-mono border border-cyan-500/20"
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* SVG Canvas Map */}
      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#08182b" />
            <stop offset="100%" stopColor="#030914" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="url(#oceanGrad)" />

        {/* Graticule Grid */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const y = ((90 - lat) / 180) * mapHeight;
          return (
            <line
              key={`lat-${lat}`}
              x1="0"
              y1={y}
              x2={mapWidth}
              y2={y}
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Continents Base */}
        {CONTINENTS.map((cont, idx) => {
          const pathD = cont.points
            .map((pt, i) => {
              const [x, y] = toSvgCoords(pt[0], pt[1]);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ') + ' Z';
          return (
            <path
              key={`cont-${idx}`}
              d={pathD}
              fill="#142132"
              stroke="#0ea5e9"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
          );
        })}

        {/* Greenland Ice Sheet (Melts with remainingIcePct) */}
        {remainingIcePct > 0 && (
          <ellipse
            cx={toSvgCoords(72, -40)[0]}
            cy={toSvgCoords(72, -40)[1]}
            rx={45 * (remainingIcePct / 100)}
            ry={28 * (remainingIcePct / 100)}
            fill="#ffffff"
            fillOpacity={0.7 * (remainingIcePct / 100)}
            stroke="#bae6fd"
            strokeWidth="1.5"
          />
        )}

        {/* Inundated Low-Elevation Coastal Flood Zones */}
        {FLOOD_ZONES.map(zone => {
          if (seaLevelRise < zone.threshold) return null;
          const floodProgress = Math.min(1.0, (seaLevelRise - zone.threshold) / (zone.maxFloodThreshold - zone.threshold));
          const pathD = zone.points
            .map((pt, i) => {
              const [x, y] = toSvgCoords(pt[0], pt[1]);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ') + ' Z';

          return (
            <path
              key={zone.id}
              d={pathD}
              fill="#0284c7"
              fillOpacity={0.4 + floodProgress * 0.45}
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeDasharray="4,2"
              className="animate-pulse"
            />
          );
        })}

        {/* Vulnerable Coastal Cities */}
        {VULNERABLE_CITIES.map(city => {
          const floodInfo = getCityFloodStatus(city, seaLevelRise);
          const [cx, cy] = toSvgCoords(city.coords[0], city.coords[1]);

          return (
            <g
              key={city.name}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCity(city);
              }}
              onMouseEnter={(e) => {
                setHovered({ city, floodInfo });
                setMousePos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              {floodInfo.status === 'SUBMERGED' && (
                <circle cx={cx} cy={cy} r="9" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
              )}
              <circle
                cx={cx}
                cy={cy}
                r="4.5"
                fill={floodInfo.color}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={cy - 7}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="8"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                className="pointer-events-none drop-shadow"
              >
                {city.name.split(',')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hovered && (
        <div
          className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl glass-panel border border-cyan-400/50 text-xs shadow-xl z-50 bg-slate-950/95"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-cyan-200">{hovered.city.name}</span>
            <span className="text-[10px] text-slate-300">
              Elevation: {hovered.city.elevation}m • Inundation at: +{hovered.city.floodThreshold}m
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: hovered.floodInfo.color }}>
              Status: {hovered.floodInfo.depth} ({hovered.floodInfo.badge})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
