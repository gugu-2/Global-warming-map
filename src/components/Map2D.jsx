import React, { useRef, useState } from 'react';
import { CONTINENTS } from '../data/worldGeo';
import { getActiveEmpires, getActiveEvents, getActiveTradeRoutes, formatYear } from '../data/historyData';

export default function Map2D({
  currentYear,
  onSelectEmpire,
  onSelectEvent,
  focusedCoords
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeEmpires = getActiveEmpires(currentYear);
  const activeEvents = getActiveEvents(currentYear, 50);
  const activeRoutes = getActiveTradeRoutes(currentYear);

  // SVG dimensions (Equirectangular 360 x 180 degrees scaled to 1200 x 600)
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
      className="w-full h-full relative overflow-hidden bg-[#070b14] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Zoom / Reset Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(6, z * 1.25))}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-white/10"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.8, z / 1.25))}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-white/10"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center text-xs font-mono border border-white/10"
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
          <radialGradient id="waterGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a1426" />
            <stop offset="100%" stopColor="#050811" />
          </radialGradient>
        </defs>

        {/* Ocean Background */}
        <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="url(#waterGrad)" />

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
              stroke={lat === 0 ? 'rgba(212, 175, 55, 0.3)' : 'rgba(56, 189, 248, 0.08)'}
              strokeWidth={lat === 0 ? '1.5' : '1'}
              strokeDasharray={lat === 0 ? 'none' : '4,4'}
            />
          );
        })}
        {[-120, -60, 0, 60, 120].map(lng => {
          const x = ((lng + 180) / 360) * mapWidth;
          return (
            <line
              key={`lng-${lng}`}
              x1={x}
              y1="0"
              x2={x}
              y2={mapHeight}
              stroke="rgba(56, 189, 248, 0.08)"
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
              fill="#182334"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
          );
        })}

        {/* Active Trade Routes */}
        {activeRoutes.map(route => {
          const pathD = route.waypoints
            .map((pt, i) => {
              const [x, y] = toSvgCoords(pt[0], pt[1]);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
          return (
            <path
              key={route.id}
              d={pathD}
              fill="none"
              stroke={route.color}
              strokeWidth="2.5"
              strokeOpacity="0.75"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
          );
        })}

        {/* Active Empires Territory Polygons */}
        {activeEmpires.map(empire => {
          if (!empire.territory || empire.territory.length < 3) return null;
          const pathD = empire.territory
            .map((pt, i) => {
              const [x, y] = toSvgCoords(pt[0], pt[1]);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ') + ' Z';

          return (
            <path
              key={empire.id}
              d={pathD}
              fill={empire.color}
              fillOpacity="0.28"
              stroke={empire.color}
              strokeWidth="2.0"
              strokeOpacity="0.9"
              className="cursor-pointer transition-all hover:fill-opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEmpire(empire);
              }}
              onMouseEnter={(e) => {
                setHovered({ type: 'empire', data: empire });
                setMousePos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Active Empires Capitals */}
        {activeEmpires.map(empire => {
          if (!empire.capital) return null;
          const [cx, cy] = toSvgCoords(empire.capital.lat, empire.capital.lng);
          return (
            <g
              key={`cap-${empire.id}`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEmpire(empire);
              }}
              onMouseEnter={(e) => {
                setHovered({ type: 'empire', data: empire });
                setMousePos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <circle cx={cx} cy={cy} r="8" fill={empire.color} fillOpacity="0.3" className="animate-ping" />
              <circle cx={cx} cy={cy} r="4.5" fill={empire.color} stroke="#ffffff" strokeWidth="1.5" />
              <text
                x={cx}
                y={cy - 7}
                textAnchor="middle"
                fill="#fde047"
                fontSize="8"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                className="pointer-events-none drop-shadow"
              >
                {empire.capital.name.split('/')[0]}
              </text>
            </g>
          );
        })}

        {/* Active Historical Events */}
        {activeEvents.map(evt => {
          const [ex, ey] = toSvgCoords(evt.coords[0], evt.coords[1]);
          return (
            <g
              key={evt.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEvent(evt);
              }}
              onMouseEnter={(e) => {
                setHovered({ type: 'event', data: evt });
                setMousePos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <polygon
                points={`${ex},${ey - 7} ${ex + 6},${ey} ${ex},${ey + 7} ${ex - 6},${ey}`}
                fill="#fbbf24"
                stroke="#ffffff"
                strokeWidth="1.2"
                className="animate-bounce"
              />
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hovered && (
        <div
          className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl glass-panel-gold border border-amber-400/40 text-xs shadow-xl z-50"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          {hovered.type === 'empire' ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-amber-200">{hovered.data.name}</span>
              <span className="text-[10px] text-slate-300">Capital: {hovered.data.capital?.name}</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {formatYear(hovered.data.startYear)} – {formatYear(hovered.data.endYear)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-amber-300">{hovered.data.title}</span>
              <span className="text-[10px] text-slate-300">{formatYear(hovered.data.year)} • {hovered.data.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
