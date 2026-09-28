import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CONTINENTS, latLngToVector3, createEarthCanvasTexture } from '../data/worldGeo';
import { getActiveEmpires, getActiveEvents, getActiveTradeRoutes, formatYear } from '../data/historyData';

export default function Globe3D({
  currentYear,
  onSelectEmpire,
  onSelectEvent,
  focusedCoords
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);
  const empireGroupRef = useRef(null);
  const eventGroupRef = useRef(null);
  const routeGroupRef = useRef(null);

  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: 0.8 });
  const currentRotationRef = useRef({ x: 0.2, y: 0.8 });
  const cameraDistanceRef = useRef(5.0);
  const targetCameraDistanceRef = useRef(5.0);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvasContainer = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.0;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 160;
      starPositions[i + 1] = (Math.random() - 0.5) * 160;
      starPositions[i + 2] = (Math.random() - 0.5) * 160;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.7,
      transparent: true,
      opacity: 0.7
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Main Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 1. Earth Sphere
    const earthRadius = 2.0;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const canvasTexture = new THREE.CanvasTexture(createEarthCanvasTexture());
    canvasTexture.colorSpace = THREE.SRGBColorSpace;

    const earthMat = new THREE.MeshStandardMaterial({
      map: canvasTexture,
      roughness: 0.7,
      metalness: 0.15
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. Atmosphere Glow Rim
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.05, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.25, 0.65, 0.95, 1.0) * intensity * 1.3;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 3. Continent Outlines
    CONTINENTS.forEach(cont => {
      const points = cont.points.map(pt => {
        const v = latLngToVector3(pt[0], pt[1], earthRadius * 1.002);
        return new THREE.Vector3(v.x, v.y, v.z);
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55,
        linewidth: 1.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);
    });

    // Groups for Dynamic Elements
    const empireGroup = new THREE.Group();
    globeGroup.add(empireGroup);
    empireGroupRef.current = empireGroup;

    const eventGroup = new THREE.Group();
    globeGroup.add(eventGroup);
    eventGroupRef.current = eventGroup;

    const routeGroup = new THREE.Group();
    globeGroup.add(routeGroup);
    routeGroupRef.current = routeGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(6, 4, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-6, -3, -6);
    scene.add(dirLight2);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera orbit rotation damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;
      cameraDistanceRef.current += (targetCameraDistanceRef.current - cameraDistanceRef.current) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
      }
      if (cameraRef.current) {
        cameraRef.current.position.z = cameraDistanceRef.current;
      }

      // Gentle auto spin when not dragging
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0007;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Dynamic Overlays (Empires, Events, Trade Routes) when currentYear changes
  useEffect(() => {
    if (!empireGroupRef.current || !eventGroupRef.current || !routeGroupRef.current) return;

    // Clear previous children
    while (empireGroupRef.current.children.length > 0) {
      const obj = empireGroupRef.current.children[0];
      empireGroupRef.current.remove(obj);
    }
    while (eventGroupRef.current.children.length > 0) {
      const obj = eventGroupRef.current.children[0];
      eventGroupRef.current.remove(obj);
    }
    while (routeGroupRef.current.children.length > 0) {
      const obj = routeGroupRef.current.children[0];
      routeGroupRef.current.remove(obj);
    }

    const earthRadius = 2.0;

    // 1. Add Active Empires
    const activeEmpires = getActiveEmpires(currentYear);
    activeEmpires.forEach(empire => {
      const colorNum = parseInt(empire.color.replace('#', '0x'), 16);

      // Territory boundary ring
      if (empire.territory && empire.territory.length > 2) {
        const polyPoints = empire.territory.map(pt => {
          const v = latLngToVector3(pt[0], pt[1], earthRadius * 1.008);
          return new THREE.Vector3(v.x, v.y, v.z);
        });
        polyPoints.push(polyPoints[0]); // close loop

        const borderGeo = new THREE.BufferGeometry().setFromPoints(polyPoints);
        const borderMat = new THREE.LineBasicMaterial({
          color: colorNum,
          linewidth: 2.5,
          transparent: true,
          opacity: 0.85
        });
        const borderLine = new THREE.Line(borderGeo, borderMat);
        empireGroupRef.current.add(borderLine);
      }

      // Capital Marker Beacon
      if (empire.capital) {
        const capPos = latLngToVector3(empire.capital.lat, empire.capital.lng, earthRadius * 1.012);
        const capGeo = new THREE.SphereGeometry(0.035, 16, 16);
        const capMat = new THREE.MeshStandardMaterial({
          color: colorNum,
          emissive: colorNum,
          emissiveIntensity: 0.9,
          roughness: 0.2
        });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.set(capPos.x, capPos.y, capPos.z);
        capMesh.userData = { type: 'empire', data: empire };
        empireGroupRef.current.add(capMesh);

        // Pulsing Ring around capital
        const ringGeo = new THREE.RingGeometry(0.045, 0.065, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorNum,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(capPos.x, capPos.y, capPos.z);
        ringMesh.lookAt(new THREE.Vector3(capPos.x * 2, capPos.y * 2, capPos.z * 2));
        empireGroupRef.current.add(ringMesh);
      }
    });

    // 2. Add Active Historical Events
    const activeEvents = getActiveEvents(currentYear, 50);
    activeEvents.forEach(evt => {
      const pos = latLngToVector3(evt.coords[0], evt.coords[1], earthRadius * 1.018);
      const evtGeo = new THREE.OctahedronGeometry(0.04, 0);
      const evtMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.2,
        roughness: 0.1
      });
      const evtMesh = new THREE.Mesh(evtGeo, evtMat);
      evtMesh.position.set(pos.x, pos.y, pos.z);
      evtMesh.userData = { type: 'event', data: evt };
      eventGroupRef.current.add(evtMesh);
    });

    // 3. Add Historic Trade Routes
    const activeRoutes = getActiveTradeRoutes(currentYear);
    activeRoutes.forEach(route => {
      const routeColor = parseInt(route.color.replace('#', '0x'), 16);
      const pts = route.waypoints.map(pt => {
        const v = latLngToVector3(pt[0], pt[1], earthRadius * 1.006);
        return new THREE.Vector3(v.x, v.y, v.z);
      });
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.007, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: routeColor,
        transparent: true,
        opacity: 0.7
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      routeGroupRef.current.add(tube);
    });
  }, [currentYear]);

  // Smooth camera rotation when focusedCoords changes
  useEffect(() => {
    if (!focusedCoords) return;
    const [lat, lng] = focusedCoords;
    const targetY = -(lng + 90) * (Math.PI / 180);
    const targetX = lat * (Math.PI / 180) * 0.6;
    targetRotationRef.current = { x: targetX, y: targetY };
    targetCameraDistanceRef.current = 3.6; // zoom in smoothly
  }, [focusedCoords]);

  // Mouse / Touch Interaction Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    // 1. Orbit Globe Drag
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;

      // Clamp X rotation to prevent flipping upside down
      targetRotationRef.current.x = Math.max(-1.3, Math.min(1.3, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Raycasting for hover tooltips
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactiveObjects = [
      ...(empireGroupRef.current?.children || []),
      ...(eventGroupRef.current?.children || [])
    ].filter(obj => obj.userData && obj.userData.type);

    const intersects = raycaster.intersectObjects(interactiveObjects);

    if (intersects.length > 0) {
      const topObj = intersects[0].object;
      setHoveredItem(topObj.userData);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      containerRef.current.style.cursor = 'pointer';
    } else {
      setHoveredItem(null);
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e) => {
    if (!hoveredItem) return;
    if (hoveredItem.type === 'empire' && onSelectEmpire) {
      onSelectEmpire(hoveredItem.data);
    } else if (hoveredItem.type === 'event' && onSelectEvent) {
      onSelectEvent(hoveredItem.data);
    }
  };

  // Zoom with Wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.002;
    targetCameraDistanceRef.current = Math.max(2.8, Math.min(8.5, targetCameraDistanceRef.current + zoomDelta));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      <div ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-none" />

      {/* Interactive Hover Tooltip */}
      {hoveredItem && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl glass-panel-gold border border-amber-400/40 text-xs shadow-xl animate-fade-in"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          {hoveredItem.type === 'empire' ? (
            <div className="flex flex-col gap-0.5 min-w-[140px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: hoveredItem.data.color }}
                />
                <span className="font-bold text-amber-200">{hoveredItem.data.name}</span>
              </div>
              <span className="text-[10px] text-slate-300">
                Capital: {hoveredItem.data.capital?.name}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {formatYear(hoveredItem.data.startYear)} – {formatYear(hoveredItem.data.endYear)}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">Click to inspect civilization</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 min-w-[140px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold text-amber-300">{hoveredItem.data.title}</span>
              </div>
              <span className="text-[10px] text-slate-300">
                {formatYear(hoveredItem.data.year)} • {hoveredItem.data.location}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">Click for historical event details</span>
            </div>
          )}
        </div>
      )}

      {/* Floating 3D Navigation Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            targetCameraDistanceRef.current = Math.max(2.8, targetCameraDistanceRef.current - 0.7);
          }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-white/10"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            targetCameraDistanceRef.current = Math.min(8.5, targetCameraDistanceRef.current + 0.7);
          }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-white/10"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            targetRotationRef.current = { x: 0.2, y: 0.8 };
            targetCameraDistanceRef.current = 5.0;
          }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center text-xs font-mono border border-white/10"
          title="Reset View"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
