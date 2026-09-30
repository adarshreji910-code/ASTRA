import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SolarSystemState, Planet, AstronomicalEvent } from '../../types';

interface SolarSystemCanvasProps {
  solarState: SolarSystemState | null;
  events: AstronomicalEvent[];
  selectedPlanet: Planet | null;
  selectedEvent: AstronomicalEvent | null;
  onSelectPlanet: (planet: Planet | null) => void;
  onSelectEvent: (event: AstronomicalEvent | null) => void;
  onEnterActivityCenter: () => void;
  cameraPreset: 'earth' | 'system' | 'planet' | 'event' | 'activity' | null;
}

// Helper to create sharp canvas sprite text labels
function createTextLabel(
  text: string,
  color: string = '#ffffff',
  subtext?: string,
  isBadge: boolean = false
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = isBadge ? 360 : 512;
  canvas.height = isBadge ? 96 : 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(6, 12, 28, 0.82)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
  } else {
    ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
  }
  ctx.fill();
  ctx.stroke();

  ctx.font = isBadge ? 'bold 28px sans-serif' : 'bold 36px sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, subtext ? (isBadge ? 44 : 58) : (isBadge ? 58 : 76));

  if (subtext) {
    ctx.font = isBadge ? '19px monospace' : '22px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtext, canvas.width / 2, isBadge ? 72 : 94);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  if (isBadge) {
    sprite.scale.set(4.8, 1.28, 1);
  } else {
    sprite.scale.set(16.0, 4.0, 1);
  }
  return sprite;
}

// Procedural luminous beacon texture for distant celestial visibility
function createBeaconTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, colorHex);
  grad.addColorStop(0.35, colorHex);
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Procedural dynamic Earth texture with continents and clouds
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Ocean Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0a2544');
  oceanGrad.addColorStop(0.5, '#134e7c');
  oceanGrad.addColorStop(1, '#091e36');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Continents (stylized landmasses)
  ctx.fillStyle = '#2d6a4f';
  // North America
  ctx.beginPath();
  ctx.ellipse(250, 160, 115, 75, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(320, 330, 80, 110, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(660, 160, 190, 85, 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(540, 280, 85, 115, 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(830, 350, 70, 50, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Polar ice caps
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 1024, 30);
  ctx.fillRect(0, 480, 1024, 32);

  // 3. Dynamic cloud swirl bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  for (let i = 0; i < 48; i++) {
    const cx = (i * 23) % 1024;
    const cy = 50 + ((i * 47) % 400);
    const rw = 55 + (i % 6) * 20;
    const rh = 12 + (i % 4) * 6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({
  solarState,
  events,
  selectedPlanet,
  selectedEvent,
  onSelectPlanet,
  onSelectEvent,
  onEnterActivityCenter,
  cameraPreset,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh registries
  const planetMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const planetLabelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const orbitLinesRef = useRef<THREE.Group>(new THREE.Group());
  const eventMarkersRef = useRef<Map<string, THREE.Group>>(new Map());

  // Camera targets (Default to Earth focus)
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(28.4, 3.2, -1.4));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(39.84, 0, -4.29));
  const isTransitioning = useRef<boolean>(true);

  // Tooltips
  const [hoveredEvent, setHoveredEvent] = useState<{ event: AstronomicalEvent; screenX: number; screenY: number } | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<{ planet: Planet; screenX: number; screenY: number } | null>(null);

  // Quick preset view selector state
  const [activeView, setActiveView] = useState<'earth' | 'system' | 'sun'>('earth');

  // Initialize Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // 1. SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    // Initial camera position framed cleanly on sunlit side of Earth
    camera.position.set(28.4, 3.2, -1.4);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 4000;
    controls.target.set(39.84, 0, -4.29); // Target Earth initially
    controls.addEventListener('start', () => {
      isTransitioning.current = false;
    });
    controlsRef.current = controls;

    // Attach to window for diagnostics
    (window as any).__spaceverseScene = scene;
    (window as any).__spaceverseCamera = camera;
    (window as any).__spaceverseControls = controls;
    (window as any).__spaceverseRenderer = renderer;
    (window as any).THREE = THREE;

    // 5. LIGHTING
    // Ambient light high enough so dark sides of planets remain softly visible
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    // Direct Sun Light
    const sunLight = new THREE.PointLight(0xfffaed, 5.0, 5000, 0.2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Secondary soft fill
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.4);
    fillLight.position.set(50, 100, 50);
    scene.add(fillLight);

    // 6. STARFIELD
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 3000 + Math.random() * 2000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      if (r > 0.8) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
      } else if (r > 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.7;
      } else {
        starColors[i * 3] = 0.95; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 7. ASTEROID BELT (Between Mars and Jupiter ~2.2-3.2 AU = 88 - 128 units)
    const astCount = 1500;
    const astGeo = new THREE.BufferGeometry();
    const astPos = new Float32Array(astCount * 3);
    for (let i = 0; i < astCount; i++) {
      const dist = 85 + Math.random() * 45;
      const angle = Math.random() * Math.PI * 2;
      astPos[i * 3] = dist * Math.cos(angle);
      astPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      astPos[i * 3 + 2] = dist * Math.sin(angle);
    }
    astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3));
    const astMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.2, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(astGeo, astMat));

    // 8. SUN MESH & RADIANT CORONA
    const sunGroup = new THREE.Group();
    sunGroup.name = 'sun_group';
    sunGroup.position.set(0, 0, 0);

    const sunGeo = new THREE.SphereGeometry(8.5, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd033 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { id: 'sun', type: 'star' };
    sunGroup.add(sunMesh);

    // Glowing Sun Corona
    const coronaGeo = new THREE.SphereGeometry(11.0, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    sunGroup.add(new THREE.Mesh(coronaGeo, coronaMat));

    // Sun Label
    const sunLabel = createTextLabel('☀️ Sun', '#ffd033', 'Star (99.86% solar mass)');
    sunLabel.scale.set(16, 4.0, 1);
    sunLabel.position.set(0, 14.0, 0);
    sunGroup.add(sunLabel);

    scene.add(sunGroup);

    // Add orbit lines container
    scene.add(orbitLinesRef.current);

    // 9. ANIMATION LOOP
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = performance.now() * 0.001;

      // Rotate Sun
      sunMesh.rotation.y += 0.002;

      // Rotate planet spheres on their axes & adapt beacon visibility by distance
      planetMeshesRef.current.forEach((group) => {
        const body = group.getObjectByName('planet_body');
        if (body) body.rotation.y += 0.008;

        const beacon = group.getObjectByName('planet_beacon');
        if (beacon) {
          const dist = camera.position.distanceTo(group.position);
          // Distant planets show brilliant glowing beacons; close planets show realistic 3D globes
          beacon.visible = dist > 42.0;
        }
      });

      // Animate pulsing event markers
      eventMarkersRef.current.forEach((m) => {
        const ring = m.getObjectByName('event_ring');
        if (ring) {
          const s = 1.0 + 0.25 * Math.sin(elapsed * 4.0);
          ring.scale.set(s, s, s);
        }
        m.quaternion.copy(camera.quaternion);
      });

      // Smooth camera interpolation
      if (isTransitioning.current) {
        camera.position.lerp(targetCamPos.current, 0.05);
        controls.target.lerp(targetLookAt.current, 0.05);

        if (
          camera.position.distanceTo(targetCamPos.current) < 0.15 &&
          controls.target.distanceTo(targetLookAt.current) < 0.15
        ) {
          isTransitioning.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. RESIZE LISTENER
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    // Trigger immediate resize after mount
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (mountRef.current) {
        mountRef.current.replaceChildren();
      }
      renderer.dispose();
      planetMeshesRef.current.clear();
      planetLabelsRef.current.clear();
      orbitLinesRef.current.clear();
      eventMarkersRef.current.clear();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // UPDATE PLANET POSITIONS & ORBITS WHEN SOLAR STATE IS AVAILABLE
  useEffect(() => {
    if (!solarState || !sceneRef.current) return;
    const scene = sceneRef.current;
    const AU_SCALE = 40.0;

    // Clear old orbit lines and ensure container is attached to active scene
    orbitLinesRef.current.clear();
    if (orbitLinesRef.current.parent !== scene) {
      scene.add(orbitLinesRef.current);
    }

    Object.entries(solarState.planets).forEach(([id, p]) => {
      // 1. Draw Orbit Line
      if (p.orbital_trail && p.orbital_trail.length > 0) {
        const pts = p.orbital_trail.map(
          (pt) => new THREE.Vector3(pt.x * AU_SCALE, pt.y * AU_SCALE, pt.z * AU_SCALE)
        );
        pts.push(pts[0].clone()); // Close loop
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: new THREE.Color(p.color),
          transparent: true,
          opacity: 0.75,
        });
        orbitLinesRef.current.add(new THREE.Line(geo, mat));
      }

      // 2. Position or create planet mesh
      let group = planetMeshesRef.current.get(id);
      if (!group) {
        group = new THREE.Group();
        group.name = `planet_${id}`;

        // Planet visual radius - enlarged for immediate high visibility across Solar System
        const radius = Math.max(2.6, p.visual_scale * 1.45);
        const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

        // Planet Material with emissive color to ensure visibility in deep space
        const sphereMat = id === 'earth'
          ? new THREE.MeshStandardMaterial({
              map: createEarthTexture(),
              roughness: 0.5,
              metalness: 0.1,
              emissive: new THREE.Color(0x1e3a8a).multiplyScalar(0.35),
            })
          : new THREE.MeshStandardMaterial({
              color: new THREE.Color(p.color),
              roughness: 0.5,
              metalness: 0.1,
              emissive: new THREE.Color(p.color).multiplyScalar(0.32),
            });
        const body = new THREE.Mesh(sphereGeo, sphereMat);
        body.name = 'planet_body';
        body.userData = { id, type: 'planet', data: p };
        group.add(body);

        // Radiant Celestial Beacon (Ensures every planet is brightly visible across the entire Solar System)
        const beaconMat = new THREE.SpriteMaterial({
          map: createBeaconTexture(p.color),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });
        const beacon = new THREE.Sprite(beaconMat);
        beacon.name = 'planet_beacon';
        const beaconSize = Math.max(16.0, radius * 3.8);
        beacon.scale.set(beaconSize, beaconSize, 1);
        group.add(beacon);

        // Atmosphere halo
        const atmoGeo = new THREE.SphereGeometry(radius * 1.15, 24, 24);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: id === 'earth' ? 0x38bdf8 : new THREE.Color(p.color),
          transparent: true,
          opacity: id === 'earth' ? 0.35 : 0.28,
          side: THREE.BackSide,
        });
        group.add(new THREE.Mesh(atmoGeo, atmoMat));

        // Saturn Rings
        if (p.has_rings) {
          const innerR = radius * 1.4;
          const outerR = radius * 2.7;
          const ringGeo = new THREE.RingGeometry(innerR, outerR, 64);
          ringGeo.rotateX(Math.PI / 2);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0xead6a6,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            emissive: 0xead6a6,
            emissiveIntensity: 0.15,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.z = THREE.MathUtils.degToRad(26.7);
          group.add(ringMesh);
        }

        // Earth Moon
        if (id === 'earth') {
          const moonGeo = new THREE.SphereGeometry(0.85, 16, 16);
          const moonMat = new THREE.MeshStandardMaterial({
            color: 0xd1d5db,
            roughness: 0.85,
            emissive: new THREE.Color(0x9ca3af).multiplyScalar(0.25),
          });
          const moonMesh = new THREE.Mesh(moonGeo, moonMat);
          moonMesh.name = 'earth_moon';
          moonMesh.position.set(5.5, 0.6, -1.8);
          moonMesh.userData = { id: 'moon', type: 'moon' };
          group.add(moonMesh);

          // Moon orbit circle line
          const mPts: THREE.Vector3[] = [];
          for (let a = 0; a <= Math.PI * 2; a += 0.15) {
            mPts.push(new THREE.Vector3(5.8 * Math.cos(a), 0, 5.8 * Math.sin(a)));
          }
          const mGeo = new THREE.BufferGeometry().setFromPoints(mPts);
          const mLine = new THREE.Line(mGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.45 }));
          group.add(mLine);
        }

        // Jupiter Galilean Moons
        if (id === 'jupiter' && p.major_moons) {
          const moonsGroup = new THREE.Group();
          p.major_moons.forEach((m, idx) => {
            const mGeo = new THREE.SphereGeometry(0.45, 12, 12);
            const mMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(m.color),
              emissive: new THREE.Color(m.color).multiplyScalar(0.2),
            });
            const mMesh = new THREE.Mesh(mGeo, mMat);
            const dist = radius + 3.2 + idx * 2.4;
            mMesh.position.set(dist, (idx - 1.5) * 0.35, (idx % 2 === 0 ? 1 : -1) * 1.2);
            mMesh.userData = { id: `j_moon_${m.name}`, type: 'galilean_moon', data: m };
            moonsGroup.add(mMesh);
          });
          group.add(moonsGroup);
        }

        // Luminous Billboard Label
        const planetEmojis: Record<string, string> = {
          mercury: '☿',
          venus: '♀',
          earth: '🌍',
          mars: '♂',
          jupiter: '♃',
          saturn: '🪐',
          uranus: '♅',
          neptune: '♆',
        };
        const emoji = planetEmojis[id] || '🪐';
        const labelText = id === 'earth' ? '🌍 Earth (You are here)' : `${emoji} ${p.name}`;
        const subtext = id === 'earth'
          ? `${p.distance_from_sun_au} AU • Double-click for Activity`
          : `${p.distance_from_earth_million_km}M km from Earth (${p.distance_from_sun_au} AU)`;
        const label = createTextLabel(
          labelText,
          p.color,
          subtext
        );
        label.scale.set(16.0, 4.0, 1);
        label.position.set(0, radius + 4.8, 0);
        group.add(label);
        planetLabelsRef.current.set(id, label);

        scene.add(group);
        planetMeshesRef.current.set(id, group);
      } else if (group.parent !== scene) {
        scene.add(group);
      }

      // Update position
      const posX = p.coordinates.three_js.x * AU_SCALE;
      const posY = p.coordinates.three_js.y * AU_SCALE;
      const posZ = p.coordinates.three_js.z * AU_SCALE;
      group.position.set(posX, posY, posZ);
    });

    // If initial load and Earth mesh is ready, ensure camera focuses Earth on its sunlit side
    const earthGroup = planetMeshesRef.current.get('earth');
    if (earthGroup && activeView === 'earth') {
      const ePos = earthGroup.position;
      targetLookAt.current.set(ePos.x, ePos.y, ePos.z);
      targetCamPos.current.set(ePos.x - 11.4, ePos.y + 3.2, ePos.z + 2.8);
      isTransitioning.current = true;
    }
  }, [solarState, activeView]);

  // UPDATE EVENT MARKERS ANCHORED VISUALLY & ACCURATELY
  useEffect(() => {
    if (!sceneRef.current || !solarState) return;
    const scene = sceneRef.current;

    eventMarkersRef.current.forEach((m) => {
      if (m.parent) m.parent.remove(m);
    });
    eventMarkersRef.current.clear();

    const earthGroup = planetMeshesRef.current.get('earth');
    const earthPos = earthGroup ? earthGroup.position : new THREE.Vector3(39.84, 0, -4.25);

    events.forEach((ev, idx) => {
      const markerGroup = new THREE.Group();
      markerGroup.name = `marker_${ev.id}`;

      // Calculate anchor location based on event target
      const anchorPos = new THREE.Vector3();
      const target = ev.spatial_anchor?.target || 'earth_orbit';

      if (target === 'saturn_orbit') {
        const saturn = planetMeshesRef.current.get('saturn');
        if (saturn) {
          anchorPos.set(saturn.position.x + 8.0, saturn.position.y + 3.0, saturn.position.z + 8.0);
        } else {
          anchorPos.set(120, 2, -140);
        }
      } else if (target === 'mars_orbit') {
        const mars = planetMeshesRef.current.get('mars');
        if (mars) {
          anchorPos.set(mars.position.x + 5.0, mars.position.y + 2.0, mars.position.z + 5.0);
        } else {
          anchorPos.set(58, 1.5, -12);
        }
      } else if (target === 'sun_surface') {
        anchorPos.set(10.5, 3.5, 0.0);
      } else if (target === 'moon_orbit') {
        anchorPos.set(earthPos.x + 3.6, earthPos.y + 1.0, earthPos.z - 1.8);
      } else {
        // Distribute Earth-orbital events in a clean outer constellation
        const angle = (idx / Math.max(1, events.length)) * Math.PI * 2;
        const dist = 5.6 + (idx % 3) * 1.8;
        anchorPos.set(
          earthPos.x + Math.cos(angle) * dist,
          earthPos.y + (idx % 2 === 0 ? 0.8 : -0.8),
          earthPos.z + Math.sin(angle) * dist
        );
      }

      // 🔴 Sleek Glowing Red Core Sphere (Celestial Pinpoint Beacon)
      const coreGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.userData = { id: ev.id, type: 'event_marker', data: ev };
      markerGroup.add(core);

      // Radar Pulse Halo Ring (Thin, high-tech radar line)
      const ringGeo = new THREE.RingGeometry(0.26, 0.32, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = 'event_ring';
      markerGroup.add(ring);

      // Show focused badge label ONLY if actively selected to keep viewport pristine
      if (selectedEvent?.id === ev.id) {
        const evLabel = createTextLabel(`🔴 ${ev.title}`, '#f87171', ev.type, true);
        evLabel.position.set(0, 1.1, 0);
        markerGroup.add(evLabel);
      }

      markerGroup.position.copy(anchorPos);
      scene.add(markerGroup);
      eventMarkersRef.current.set(ev.id, markerGroup);
    });
  }, [events, solarState, selectedEvent]);

  // CAMERA PRESETS
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    if (cameraPreset === 'earth') {
      setActiveView('earth');
      const earthGroup = planetMeshesRef.current.get('earth');
      const ePos = earthGroup ? earthGroup.position : new THREE.Vector3(39.84, 0, -4.25);
      targetLookAt.current.set(ePos.x, ePos.y, ePos.z);
      targetCamPos.current.set(ePos.x - 13.5, ePos.y + 3.8, ePos.z + 3.2);
      isTransitioning.current = true;
    } else if (cameraPreset === 'system') {
      setActiveView('system');
      targetLookAt.current.set(0, 0, 0);
      targetCamPos.current.set(0, 260, 360);
      isTransitioning.current = true;
    } else if (cameraPreset === 'activity') {
      const earthGroup = planetMeshesRef.current.get('earth');
      const ePos = earthGroup ? earthGroup.position : new THREE.Vector3(39.84, 0, -4.25);
      targetLookAt.current.set(ePos.x, ePos.y, ePos.z);
      targetCamPos.current.set(ePos.x + 3.8, ePos.y + 1.8, ePos.z + 4.2);
      isTransitioning.current = true;
    }
  }, [cameraPreset]);

  // SELECT PLANET
  useEffect(() => {
    if (!selectedPlanet) return;
    const group = planetMeshesRef.current.get(selectedPlanet.id);
    if (group && controlsRef.current) {
      targetLookAt.current.copy(group.position);
      const dist = Math.max(12.0, selectedPlanet.visual_scale * 4.2);
      targetCamPos.current.set(group.position.x + dist, group.position.y + dist * 0.35, group.position.z + dist);
      isTransitioning.current = true;
    }
  }, [selectedPlanet]);

  // SELECT EVENT
  useEffect(() => {
    if (!selectedEvent) return;
    const marker = eventMarkersRef.current.get(selectedEvent.id);
    if (marker && controlsRef.current) {
      targetLookAt.current.copy(marker.position);
      targetCamPos.current.set(marker.position.x + 3.0, marker.position.y + 1.5, marker.position.z + 3.5);
      isTransitioning.current = true;
    }
  }, [selectedEvent]);

  // RAYCASTING & POINTER INTERACTION
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const lastClickTime = useRef<number>(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const hits = raycaster.current.intersectObjects(sceneRef.current.children, true);

    let hitEvent: AstronomicalEvent | null = null;
    let hitPlanet: Planet | null = null;

    for (const h of hits) {
      if (h.object.userData?.type === 'event_marker') {
        hitEvent = h.object.userData.data;
        break;
      }
      if (h.object.userData?.type === 'planet') {
        hitPlanet = h.object.userData.data;
        break;
      }
    }

    if (hitEvent) {
      setHoveredEvent({ event: hitEvent, screenX: e.clientX, screenY: e.clientY });
      setHoveredPlanet(null);
    } else if (hitPlanet) {
      setHoveredPlanet({ planet: hitPlanet, screenX: e.clientX, screenY: e.clientY });
      setHoveredEvent(null);
    } else {
      setHoveredEvent(null);
      setHoveredPlanet(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const hits = raycaster.current.intersectObjects(sceneRef.current.children, true);

    const now = Date.now();
    const isDoubleClick = now - lastClickTime.current < 350;
    lastClickTime.current = now;

    for (const h of hits) {
      if (h.object.userData?.type === 'event_marker') {
        onSelectEvent(h.object.userData.data);
        onSelectPlanet(null);
        return;
      }
      if (h.object.userData?.type === 'planet') {
        const p: Planet = h.object.userData.data;
        if (p.id === 'earth' && isDoubleClick) {
          onEnterActivityCenter();
          return;
        }
        onSelectPlanet(p);
        onSelectEvent(null);
        return;
      }
    }
  };

  // Quick Camera Presets Handler
  const handleQuickPreset = (preset: 'earth' | 'system' | 'sun') => {
    setActiveView(preset);
    if (!controlsRef.current || !cameraRef.current) return;

    if (preset === 'earth') {
      const earthGroup = planetMeshesRef.current.get('earth');
      const ePos = earthGroup ? earthGroup.position : new THREE.Vector3(39.84, 0, -4.25);
      targetLookAt.current.set(ePos.x, ePos.y, ePos.z);
      targetCamPos.current.set(ePos.x - 13.5, ePos.y + 3.8, ePos.z + 3.2);
      isTransitioning.current = true;
    } else if (preset === 'system') {
      targetLookAt.current.set(0, 0, 0);
      targetCamPos.current.set(0, 260, 360);
      isTransitioning.current = true;
    } else if (preset === 'sun') {
      targetLookAt.current.set(0, 0, 0);
      targetCamPos.current.set(0, 16, 28);
      isTransitioning.current = true;
    }
    onSelectPlanet(null);
    onSelectEvent(null);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none overflow-hidden"
    >
      {/* Dedicated Three.js canvas container (Isolated from React children) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* Quick Camera Preset Pills (Top Left) */}
      <div className="absolute top-20 left-6 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel p-1 rounded-2xl flex items-center gap-1 text-xs">
          <button
            onClick={() => handleQuickPreset('earth')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'earth'
                ? 'bg-sky-500 text-black font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🌍 Earth</span>
          </button>

          <button
            onClick={() => handleQuickPreset('system')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'system'
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🌌 Solar System</span>
          </button>

          <button
            onClick={() => handleQuickPreset('sun')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'sun'
                ? 'bg-orange-500 text-black font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>☀️ Sun</span>
          </button>
        </div>
      </div>

      {/* Tooltip for Event Marker Hover */}
      {hoveredEvent && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredEvent.screenX, top: hoveredEvent.screenY - 14 }}
        >
          <div className="glass-panel-red px-3 py-2 rounded-xl text-left shadow-2xl border border-red-500/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>{hoveredEvent.event.type}</span>
            </div>
            <div className="text-white font-medium text-sm mt-0.5">{hoveredEvent.event.title}</div>
            <div className="text-slate-300 text-[11px] mt-1">
              📅 {hoveredEvent.event.date} • Best: {hoveredEvent.event.best_visibility.primary_regions[0]}
            </div>
            <div className="text-red-300/80 text-[10px] mt-1 font-mono">
              Click to inspect event & watch 3D simulation
            </div>
          </div>
        </div>
      )}

      {/* Tooltip for Planet Hover */}
      {hoveredPlanet && !hoveredEvent && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredPlanet.screenX, top: hoveredPlanet.screenY - 14 }}
        >
          <div className="glass-panel px-3 py-2 rounded-xl text-left shadow-2xl border border-white/20 text-xs">
            <div className="text-sky-400 font-bold tracking-wider uppercase text-[10px]">
              Celestial Object
            </div>
            <div className="text-white font-bold text-sm">{hoveredPlanet.planet.name}</div>
            <div className="text-slate-300 text-[11px] mt-0.5">
              Distance: {hoveredPlanet.planet.distance_from_earth_million_km}M km from Earth
            </div>
            {hoveredPlanet.planet.id === 'earth' && (
              <div className="text-emerald-400 text-[10px] mt-1 font-mono">
                💡 Double-click to enter Space Activity Center
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scientific Transparency Disclosure Badge (Bottom Left) */}
      <div className="absolute bottom-5 left-5 pointer-events-auto z-10 hidden sm:block">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-slate-400 max-w-sm">
          <span className="text-sky-400 font-semibold">Scientific Disclosure:</span> Planet sizes are visually exaggerated for interactive visibility. Positions, distances, and celestial ephemerides are computed live via NASA JPL Keplerian equations.
        </div>
      </div>
    </div>
  );
};
