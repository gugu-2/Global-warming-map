import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CONTINENTS, latLngToVector3, createEarthCanvasTexture } from '../data/worldGeo';
import {
  getClimateMetricsForYear,
  VULNERABLE_CITIES,
  FLOOD_ZONES,
  getCityFloodStatus
} from '../data/climateData';

export default function ClimateGlobe3D({
  climateYear,
  onSelectCity,
  focusedCoords
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);
  const floodGroupRef = useRef(null);
  const iceGroupRef = useRef(null);
  const cityGroupRef = useRef(null);
  const atmosMeshRef = useRef(null);

  const [hoveredCity, setHoveredCity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.25, y: -0.5 });
  const currentRotationRef = useRef({ x: 0.25, y: -0.5 });
  const cameraDistanceRef = useRef(4.8);
  const targetCameraDistanceRef = useRef(4.8);

  const metrics = getClimateMetricsForYear(climateYear);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvasContainer = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
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
      roughness: 0.65,
      metalness: 0.2
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. Atmospheric Glow (shifts with greenhouse warming)
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.055, 48, 48);
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
        uniform vec3 uColor;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(uColor, 1.0) * intensity * 1.4;
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Vector3(0.2, 0.7, 0.95) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);
    atmosMeshRef.current = atmosMesh;

    // 3. Continent Coastlines
    CONTINENTS.forEach(cont => {
      const points = cont.points.map(pt => {
        const v = latLngToVector3(pt[0], pt[1], earthRadius * 1.002);
        return new THREE.Vector3(v.x, v.y, v.z);
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        linewidth: 1.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);
    });

    // Groups for Climate Elements
    const floodGroup = new THREE.Group();
    globeGroup.add(floodGroup);
    floodGroupRef.current = floodGroup;

    const iceGroup = new THREE.Group();
    globeGroup.add(iceGroup);
    iceGroupRef.current = iceGroup;

    const cityGroup = new THREE.Group();
    globeGroup.add(cityGroup);
    cityGroupRef.current = cityGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 1.9);
    sunLight.position.set(6, 4, 8);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    rimLight.position.set(-6, -3, -6);
    scene.add(rimLight);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

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

      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0006;
      }

      renderer.render(scene, camera);
    };
    animate();

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

  // Update Dynamic Flooding & Ice Sheet Melting when climateYear changes
  useEffect(() => {
    if (!floodGroupRef.current || !iceGroupRef.current || !cityGroupRef.current) return;

    // Clear previous children
    while (floodGroupRef.current.children.length > 0) {
      const obj = floodGroupRef.current.children[0];
      floodGroupRef.current.remove(obj);
    }
    while (iceGroupRef.current.children.length > 0) {
      const obj = iceGroupRef.current.children[0];
      iceGroupRef.current.remove(obj);
    }
    while (cityGroupRef.current.children.length > 0) {
      const obj = cityGroupRef.current.children[0];
      cityGroupRef.current.remove(obj);
    }

    const earthRadius = 2.0;
    const { seaLevelRise, remainingIcePct, tempAnomaly } = metrics;

    // Adjust atmospheric haze color with warming
    if (atmosMeshRef.current) {
      const heatFactor = Math.min(1.0, (tempAnomaly - 1.3) / 10.0);
      const r = 0.2 + heatFactor * 0.6; // shift towards reddish-gold greenhouse haze
      const g = 0.7 - heatFactor * 0.2;
      const b = 0.95 - heatFactor * 0.5;
      atmosMeshRef.current.material.uniforms.uColor.value.set(r, g, b);
    }

    // 1. Render Shrinking Polar Ice Caps (Greenland & Antarctica)
    if (remainingIcePct > 0) {
      const iceScale = Math.max(0.01, remainingIcePct / 100);

      // Greenland Ice Sheet Mesh (centered around Lat 72, Lng -40)
      const greenlandPos = latLngToVector3(72, -40, earthRadius * 1.006);
      const greenlandGeo = new THREE.SphereGeometry(0.28 * Math.sqrt(iceScale), 16, 16);
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85 * iceScale
      });
      const greenlandMesh = new THREE.Mesh(greenlandGeo, iceMat);
      greenlandMesh.position.set(greenlandPos.x, greenlandPos.y, greenlandPos.z);
      iceGroupRef.current.add(greenlandMesh);

      // Antarctic Ice Sheet (South Pole Cap)
      const antarcticaPos = latLngToVector3(-85, 0, earthRadius * 1.006);
      const antarcticaGeo = new THREE.SphereGeometry(0.72 * Math.sqrt(iceScale), 24, 24);
      const antarcticaMesh = new THREE.Mesh(antarcticaGeo, iceMat);
      antarcticaMesh.position.set(antarcticaPos.x, antarcticaPos.y, antarcticaPos.z);
      iceGroupRef.current.add(antarcticaMesh);

      // Arctic Sea Ice (North Pole Cap)
      const arcticPos = latLngToVector3(86, 0, earthRadius * 1.006);
      const arcticGeo = new THREE.SphereGeometry(0.48 * Math.sqrt(iceScale), 20, 20);
      const arcticMesh = new THREE.Mesh(arcticGeo, iceMat);
      arcticMesh.position.set(arcticPos.x, arcticPos.y, arcticPos.z);
      iceGroupRef.current.add(arcticMesh);
    }

    // 2. Render Inundated Coastal Flood Zones
    FLOOD_ZONES.forEach(zone => {
      if (seaLevelRise >= zone.threshold) {
        // Compute how fully flooded this zone is (0.0 to 1.0)
        const floodProgress = Math.min(1.0, (seaLevelRise - zone.threshold) / (zone.maxFloodThreshold - zone.threshold));
        const waterHeight = earthRadius * (1.008 + floodProgress * 0.015);

        const polyPoints = zone.points.map(pt => {
          const v = latLngToVector3(pt[0], pt[1], waterHeight);
          return new THREE.Vector3(v.x, v.y, v.z);
        });
        polyPoints.push(polyPoints[0]);

        // Boundary outline of flooded incursion
        const floodLineGeo = new THREE.BufferGeometry().setFromPoints(polyPoints);
        const floodLineMat = new THREE.LineBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.85,
          linewidth: 2.0
        });
        const floodLine = new THREE.Line(floodLineGeo, floodLineMat);
        floodGroupRef.current.add(floodLine);

        // Submerged flood water fill (triangulated fan)
        const centerV = latLngToVector3(
          zone.points.reduce((s, p) => s + p[0], 0) / zone.points.length,
          zone.points.reduce((s, p) => s + p[1], 0) / zone.points.length,
          waterHeight
        );
        const centerVec = new THREE.Vector3(centerV.x, centerV.y, centerV.z);

        const vertices = [];
        for (let i = 0; i < polyPoints.length - 1; i++) {
          vertices.push(centerVec.x, centerVec.y, centerVec.z);
          vertices.push(polyPoints[i].x, polyPoints[i].y, polyPoints[i].z);
          vertices.push(polyPoints[i + 1].x, polyPoints[i + 1].y, polyPoints[i + 1].z);
        }

        const meshGeo = new THREE.BufferGeometry();
        meshGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        meshGeo.computeVertexNormals();

        const floodWaterMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.1,
          metalness: 0.8,
          transparent: true,
          opacity: 0.45 + floodProgress * 0.4,
          side: THREE.DoubleSide
        });
        const floodMesh = new THREE.Mesh(meshGeo, floodWaterMat);
        floodGroupRef.current.add(floodMesh);
      }
    });

    // 3. Render Coastal Megacities with Dynamic Submergence Status
    VULNERABLE_CITIES.forEach(city => {
      const floodInfo = getCityFloodStatus(city, seaLevelRise);
      const pos = latLngToVector3(city.coords[0], city.coords[1], earthRadius * 1.018);

      const colorNum = parseInt(floodInfo.color.replace('#', '0x'), 16);

      // City beacon marker
      const cityGeo = new THREE.SphereGeometry(0.038, 16, 16);
      const cityMat = new THREE.MeshStandardMaterial({
        color: colorNum,
        emissive: colorNum,
        emissiveIntensity: floodInfo.status === 'SUBMERGED' ? 1.5 : 0.8,
        roughness: 0.2
      });
      const cityMesh = new THREE.Mesh(cityGeo, cityMat);
      cityMesh.position.set(pos.x, pos.y, pos.z);
      cityMesh.userData = { type: 'city', data: city, floodInfo };
      cityGroupRef.current.add(cityMesh);

      // Pulsing alert ring for flooded / submerged cities
      if (floodInfo.status === 'FLOODED' || floodInfo.status === 'SUBMERGED') {
        const ringGeo = new THREE.RingGeometry(0.045, 0.07, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorNum,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(pos.x, pos.y, pos.z);
        ringMesh.lookAt(new THREE.Vector3(pos.x * 2, pos.y * 2, pos.z * 2));
        ringMesh.userData = { type: 'city', data: city, floodInfo };
        cityGroupRef.current.add(ringMesh);
      }
    });
  }, [climateYear, metrics]);

  // Smooth camera transition when focusedCoords changes
  useEffect(() => {
    if (!focusedCoords) return;
    const [lat, lng] = focusedCoords;
    const targetY = -(lng + 90) * (Math.PI / 180);
    const targetX = lat * (Math.PI / 180) * 0.6;
    targetRotationRef.current = { x: targetX, y: targetY };
    targetCameraDistanceRef.current = 3.6;
  }, [focusedCoords]);

  // Interaction handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      targetRotationRef.current.x = Math.max(-1.3, Math.min(1.3, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactive = (cityGroupRef.current?.children || []).filter(c => c.userData && c.userData.type === 'city' && c.userData.data);
    const intersects = raycaster.intersectObjects(interactive);

    if (intersects.length > 0) {
      const topObj = intersects[0].object;
      setHoveredCity(topObj.userData);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      containerRef.current.style.cursor = 'pointer';
    } else {
      setHoveredCity(null);
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredCity && hoveredCity.data && onSelectCity) {
      onSelectCity(hoveredCity.data);
    }
  };

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

      {/* City Hover Tooltip */}
      {hoveredCity && hoveredCity.data && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl glass-panel border border-cyan-400/50 text-xs shadow-xl animate-fade-in bg-slate-950/90"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex flex-col gap-1 min-w-[150px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-cyan-200">{hoveredCity.data.name}</span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                style={{
                  color: hoveredCity.floodInfo?.color || '#38bdf8',
                  backgroundColor: `${hoveredCity.floodInfo?.color || '#38bdf8'}20`
                }}
              >
                {hoveredCity.floodInfo?.badge}
              </span>
            </div>
            <span className="text-[10px] text-slate-300">
              Elevation: {hoveredCity.data.elevation}m • Inundation Threshold: +{hoveredCity.data.floodThreshold}m
            </span>
            <span className="text-[10px] font-mono" style={{ color: hoveredCity.floodInfo?.color || '#38bdf8' }}>
              Status: {hoveredCity.floodInfo?.depth}
            </span>
            <span className="text-[9px] text-slate-400">Click to inspect flood projection</span>
          </div>
        </div>
      )}

      {/* Floating 3D Navigation Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            targetCameraDistanceRef.current = Math.max(2.8, targetCameraDistanceRef.current - 0.7);
          }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-cyan-500/20"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            targetCameraDistanceRef.current = Math.min(8.5, targetCameraDistanceRef.current + 0.7);
          }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-lg border border-cyan-500/20"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            targetRotationRef.current = { x: 0.25, y: -0.5 };
            targetCameraDistanceRef.current = 4.8;
          }}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-slate-700/80 text-slate-200 flex items-center justify-center text-xs font-mono border border-cyan-500/20"
          title="Reset View"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
