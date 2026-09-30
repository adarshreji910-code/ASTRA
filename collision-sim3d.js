/**
 * ASTRA — ASTEROID COLLISION
 * 3D Unreal Engine 5 Aesthetic WebGL Space Simulation Engine
 * 
 * Cinematic visual pipeline:
 * - Procedural physically based craggy asteroid with craters and micro-fractures
 * - Multi-layer photorealistic Earth with day/night terminator, clouds and Rayleigh scattering
 * - Seamless 2D map to 3D Earth spherical transition
 * - Hypersonic atmospheric entry plasma shock cone and ionization wake
 * - Hypervelocity kinetic impact flash, expanding supersonic shockwave ring, ejecta plume and camera shake
 */

(function (window) {
  'use strict';

  class CollisionSim3D {
    /**
     * @param {HTMLCanvasElement} canvas - Dedicated simulation canvas
     * @param {Object} options
     */
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.onTelemetryUpdate = options.onTelemetryUpdate || null;
      this.onImpactComplete = options.onImpactComplete || null;

      // Graphics quality preset: 'high' | 'medium' | 'low'
      this.quality = options.quality || 'high';

      // Three.js core
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.clock = new THREE.Clock();

      // Scene elements
      this.sunLight = null;
      this.ambientLight = null;
      this.starField = null;
      this.earthGroup = null;
      this.earthMesh = null;
      this.cloudMesh = null;
      this.atmoMesh = null;
      this.targetMarkerMesh = null;
      this.asteroidMesh = null;
      this.asteroidDust = null;
      this.trajectoryLine = null;
      this.entryPlasmaCone = null;
      this.entryTrailParticles = null;
      this.impactFlashMesh = null;
      this.impactShockwaveRing = null;
      this.impactEjectaPlume = null;

      // Parameters & State
      this.currentStage = 'IDLE'; // 'INTRO' | 'PREVIEW' | 'TRANSITION' | 'APPROACH' | 'ENTRY' | 'IMPACT'
      this.currentAsteroid = null;
      this.currentTarget = { lat: 19.0760, lon: 72.8777 }; // Mumbai default
      this.simPhysics = null;

      // Trajectory & approach animation variables
      this.approachProgress = 0; // 0 to 1
      this.approachDuration = 10.0; // seconds for cinematic approach
      this.impactProgress = 0;
      this.impactDuration = 3.5;
      this.cameraShakeIntensity = 0;

      // Camera control target points
      this.cameraCurrentPos = new THREE.Vector3(0, 0, 15);
      this.cameraTargetPos = new THREE.Vector3(0, 0, 15);
      this.cameraLookCurrent = new THREE.Vector3(0, 0, 0);
      this.cameraLookTarget = new THREE.Vector3(0, 0, 0);

      this.isAnimating = false;
      this.animFrameId = null;

      this.init();
    }

    init() {
      // 1. Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x010307);

      // 2. Camera: Cinematic 42mm focal length perspective
      const aspect = (this.canvas.clientWidth || window.innerWidth) / (this.canvas.clientHeight || window.innerHeight);
      this.camera = new THREE.PerspectiveCamera(38, aspect, 0.05, 5000);
      this.camera.position.set(0, 2, 14);
      this.camera.lookAt(0, 0, 0);

      // 3. Renderer with ACES Filmic HDR Tone Mapping
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: this.quality !== 'low',
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.canvas.clientWidth || window.innerWidth, this.canvas.clientHeight || window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.25));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;

      // 4. Lighting: Realistic Sun & Deep Space Ambient Fill
      this.sunLight = new THREE.DirectionalLight(0xfff7e6, 2.8);
      this.sunLight.position.set(-25, 14, 18);
      this.scene.add(this.sunLight);

      this.ambientLight = new THREE.AmbientLight(0x061120, 0.45);
      this.scene.add(this.ambientLight);

      // Blue Earth atmospheric reflection rim light
      const earthRimLight = new THREE.DirectionalLight(0x3ba5d8, 0.9);
      earthRimLight.position.set(10, -5, -8);
      this.scene.add(earthRimLight);

      // 5. Build Universe
      this.createMilkyWayStarfield();
      this.createPhotorealisticEarth();
      this.createProceduralAsteroid();
      this.createAtmosphericEntryEffects();
      this.createImpactEffects();

      window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
      const w = this.canvas.clientWidth || window.innerWidth;
      const h = this.canvas.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    setQuality(quality) {
      this.quality = quality;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.25));
      if (this.starField) {
        this.starField.material.size = quality === 'high' ? 1.4 : 1.0;
      }
    }

    /**
     * Deep Space Starfield & Cosmic Dust
     */
    createMilkyWayStarfield() {
      const count = this.quality === 'high' ? 3500 : 1800;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Distribute stars on massive sphere
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 800 + Math.random() * 600;

        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Star spectral temperature colors (blue-white giants, yellow, red dwarfs)
        const rnd = Math.random();
        if (rnd > 0.8) {
          // Blue-white
          colors[i * 3] = 0.75; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 1.0;
        } else if (rnd > 0.4) {
          // Warm white
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.98; colors[i * 3 + 2] = 0.92;
        } else if (rnd > 0.15) {
          // Yellow-orange
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 0.65;
        } else {
          // Pale red
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.55; colors[i * 3 + 2] = 0.55;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Circular soft star particle texture
      const c = document.createElement('canvas');
      c.width = 32; c.height = 32;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(230,245,255,0.85)');
      grad.addColorStop(0.8, 'rgba(180,220,255,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);

      const starTex = new THREE.CanvasTexture(c);
      const material = new THREE.PointsMaterial({
        size: 1.4,
        vertexColors: true,
        map: starTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.starField = new THREE.Points(geometry, material);
      this.scene.add(this.starField);
    }

    /**
     * Multi-Layer Photorealistic Earth with Rayleigh Atmosphere
     */
    createPhotorealisticEarth() {
      this.earthGroup = new THREE.Group();
      this.earthRadius = 4.0;

      // 1. Procedural Surface Texture (Continents, Oceans, Specular)
      const dayCanvas = document.createElement('canvas');
      dayCanvas.width = 1024; dayCanvas.height = 512;
      const dctx = dayCanvas.getContext('2d');

      // Deep ocean fill
      dctx.fillStyle = '#061a33';
      dctx.fillRect(0, 0, 1024, 512);

      // Continents (simplified landmasses with biome shading)
      dctx.fillStyle = '#223d2b';
      // Africa
      dctx.beginPath(); dctx.ellipse(540, 270, 75, 110, 0.2, 0, Math.PI*2); dctx.fill();
      // Eurasia
      dctx.beginPath(); dctx.ellipse(650, 170, 180, 80, -0.1, 0, Math.PI*2); dctx.fill();
      // Indian Subcontinent
      dctx.fillStyle = '#2a4c33';
      dctx.beginPath();
      dctx.moveTo(710, 210); dctx.lineTo(745, 270); dctx.lineTo(765, 220);
      dctx.closePath(); dctx.fill();
      // Americas
      dctx.beginPath(); dctx.ellipse(260, 170, 85, 95, 0.4, 0, Math.PI*2); dctx.fill();
      dctx.beginPath(); dctx.ellipse(320, 350, 55, 90, -0.2, 0, Math.PI*2); dctx.fill();
      // Australia
      dctx.fillStyle = '#5c4826';
      dctx.beginPath(); dctx.ellipse(840, 370, 50, 40, 0, 0, Math.PI*2); dctx.fill();

      // Polar Ice Caps
      dctx.fillStyle = '#e8f4fa';
      dctx.fillRect(0, 0, 1024, 30);
      dctx.fillRect(0, 482, 1024, 30);

      const dayTex = new THREE.CanvasTexture(dayCanvas);

      // Earth Globe Mesh
      const earthGeo = new THREE.SphereGeometry(this.earthRadius, 64, 64);
      const earthMat = new THREE.MeshStandardMaterial({
        map: dayTex,
        roughness: 0.65,
        metalness: 0.1
      });
      this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
      this.earthGroup.add(this.earthMesh);

      // 2. Cloud Sphere Layer
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 1024; cloudCanvas.height = 512;
      const cctx = cloudCanvas.getContext('2d');
      cctx.fillStyle = 'rgba(0,0,0,0)';
      cctx.fillRect(0, 0, 1024, 512);

      // Swirling cyclonic storm patterns
      cctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      for (let i = 0; i < 65; i++) {
        const cx = Math.random() * 1024;
        const cy = 60 + Math.random() * 392;
        const cr = 20 + Math.random() * 70;
        cctx.beginPath();
        cctx.ellipse(cx, cy, cr, cr * 0.45, Math.random() * Math.PI, 0, Math.PI * 2);
        cctx.fill();
      }

      const cloudTex = new THREE.CanvasTexture(cloudCanvas);
      const cloudGeo = new THREE.SphereGeometry(this.earthRadius * 1.012, 64, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.NormalBlending
      });
      this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.earthGroup.add(this.cloudMesh);

      // 3. Rayleigh Atmospheric Limb Glow (Outer Halo)
      const atmoGeo = new THREE.SphereGeometry(this.earthRadius * 1.055, 48, 48);
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec3 viewDir = normalize(-vPosition);
            float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
            float intensity = pow(rim, 3.2) * 1.4;
            vec3 atmosphereColor = vec3(0.35, 0.72, 1.0);
            gl_FragColor = vec4(atmosphereColor, intensity * 0.85);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
      });
      this.atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      this.earthGroup.add(this.atmoMesh);

      // 4. Target Acquisition Reticle on Earth surface
      const markerGeo = new THREE.RingGeometry(0.04, 0.07, 32);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0x64d2ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      this.targetMarkerMesh = new THREE.Mesh(markerGeo, markerMat);
      this.earthGroup.add(this.targetMarkerMesh);

      this.scene.add(this.earthGroup);
      this.updateTargetPositionOnGlobe();
    }

    /**
     * Compute 3D point on Earth sphere from lat/lon
     */
    latLonToSpherePos(lat, lon, radius = this.earthRadius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    }

    updateTargetPositionOnGlobe() {
      if (!this.targetMarkerMesh || !this.currentTarget) return;
      const pos = this.latLonToSpherePos(this.currentTarget.lat, this.currentTarget.lon, this.earthRadius * 1.015);
      this.targetMarkerMesh.position.copy(pos);
      this.targetMarkerMesh.lookAt(pos.clone().multiplyScalar(2));
    }

    /**
     * Procedural Craggy Asteroid with Natural Craters & Fractures
     */
    createProceduralAsteroid() {
      // Subdivided icosahedron deformed by multi-octave simplex/spherical harmonic noise
      const detail = this.quality === 'high' ? 5 : 3;
      const geometry = new THREE.IcosahedronGeometry(0.85, detail);
      const posAttr = geometry.attributes.position;

      // Procedural pseudo-noise displacement
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);

        const len = Math.sqrt(x*x + y*y + z*z);
        const nx = x / len;
        const ny = y / len;
        const nz = z / len;

        // Multi-frequency noise
        let displacement = 0;
        displacement += Math.sin(nx * 4.2 + ny * 3.1) * 0.12;
        displacement += Math.sin(ny * 7.5 + nz * 6.3) * 0.06;
        displacement += Math.cos(nz * 12.0 + nx * 9.8) * 0.03;

        // Crater gouges
        const craterCenter1 = new THREE.Vector3(0.5, 0.6, 0.4).normalize();
        const distToCrater1 = new THREE.Vector3(nx, ny, nz).distanceTo(craterCenter1);
        if (distToCrater1 < 0.45) {
          displacement -= Math.cos((distToCrater1 / 0.45) * Math.PI * 0.5) * 0.16;
        }

        const craterCenter2 = new THREE.Vector3(-0.7, -0.3, 0.5).normalize();
        const distToCrater2 = new THREE.Vector3(nx, ny, nz).distanceTo(craterCenter2);
        if (distToCrater2 < 0.35) {
          displacement -= Math.cos((distToCrater2 / 0.35) * Math.PI * 0.5) * 0.12;
        }

        // Apply asymmetrical elongated axis
        const scaleAxisX = 1.15;
        const scaleAxisY = 0.88;
        const scaleAxisZ = 1.05;

        const newLen = len * (1.0 + displacement);
        posAttr.setXYZ(i, nx * newLen * scaleAxisX, ny * newLen * scaleAxisY, nz * newLen * scaleAxisZ);
      }

      geometry.computeVertexNormals();

      // Procedural Rock Texture Canvas (Bump & Silicate Grains)
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 512; texCanvas.height = 512;
      const tctx = texCanvas.getContext('2d');

      // Basalt gray base
      tctx.fillStyle = '#3a3d42';
      tctx.fillRect(0, 0, 512, 512);

      // Micro-cratering & dust patina
      for (let i = 0; i < 400; i++) {
        const rx = Math.random() * 512;
        const ry = Math.random() * 512;
        const rr = 1 + Math.random() * 8;
        const shade = Math.floor(35 + Math.random() * 45);
        tctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        tctx.beginPath();
        tctx.arc(rx, ry, rr, 0, Math.PI * 2);
        tctx.fill();
      }

      const rockTex = new THREE.CanvasTexture(texCanvas);
      rockTex.wrapS = THREE.RepeatWrapping;
      rockTex.wrapT = THREE.RepeatWrapping;

      const asteroidMat = new THREE.MeshStandardMaterial({
        map: rockTex,
        roughness: 0.88,
        metalness: 0.12
      });

      this.asteroidMesh = new THREE.Mesh(geometry, asteroidMat);
      this.asteroidMesh.castShadow = true;
      this.asteroidMesh.receiveShadow = true;
      this.scene.add(this.asteroidMesh);

      // Ejecta micro-particles floating near asteroid
      const dustCount = 80;
      const dustGeo = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3]     = (Math.random() - 0.5) * 3.5;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x9ba2ad,
        transparent: true,
        opacity: 0.65
      });
      this.asteroidDust = new THREE.Points(dustGeo, dustMat);
      this.asteroidMesh.add(this.asteroidDust);
    }

    /**
     * Atmospheric Entry Hypersonic Plasma Cone & Ionization Wake
     */
    createAtmosphericEntryEffects() {
      // 1. Plasma Shock Cone
      const coneGeo = new THREE.ConeGeometry(0.9, 2.2, 32, 1, true);
      coneGeo.rotateX(Math.PI);
      const coneMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          uniform float uTime;
          uniform float uIntensity;
          void main() {
            float fade = pow(vUv.y, 1.6);
            float flicker = sin(uTime * 45.0 + vUv.y * 20.0) * 0.15 + 0.85;
            vec3 coreColor = vec3(1.0, 0.95, 0.8);
            vec3 plasmaEdge = vec3(1.0, 0.45, 0.05);
            vec3 col = mix(plasmaEdge, coreColor, fade);
            float alpha = fade * uIntensity * flicker;
            gl_FragColor = vec4(col, alpha);
          }
        `,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      this.entryPlasmaCone = new THREE.Mesh(coneGeo, coneMat);
      this.entryPlasmaCone.visible = false;
      this.scene.add(this.entryPlasmaCone);

      // 2. Trajectory Inbound Line
      const trajPoints = [];
      for (let i = 0; i <= 60; i++) {
        trajPoints.push(new THREE.Vector3(0, 0, 0));
      }
      const trajGeo = new THREE.BufferGeometry().setFromPoints(trajPoints);
      const trajMat = new THREE.LineDashedMaterial({
        color: 0xffaa33,
        dashSize: 0.3,
        gapSize: 0.15,
        transparent: true,
        opacity: 0.85
      });
      this.trajectoryLine = new THREE.Line(trajGeo, trajMat);
      this.trajectoryLine.computeLineDistances();
      this.trajectoryLine.visible = false;
      this.scene.add(this.trajectoryLine);
    }

    /**
     * Hypervelocity Impact Kinetic Flash & Expanding Supersonic Shockwave Ring
     */
    createImpactEffects() {
      // 1. Kinetic Fireball Flash Sphere
      const flashGeo = new THREE.SphereGeometry(0.3, 32, 32);
      const flashMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0
      });
      this.impactFlashMesh = new THREE.Mesh(flashGeo, flashMat);
      this.impactFlashMesh.visible = false;
      this.scene.add(this.impactFlashMesh);

      // 2. Supersonic Ground Shockwave Ring
      const ringGeo = new THREE.RingGeometry(0.1, 0.28, 48);
      const ringMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uOpacity;
          void main() {
            float dist = distance(vUv, vec2(0.5));
            float ring = smoothstep(0.48, 0.45, dist) * smoothstep(0.2, 0.35, dist);
            vec3 color = vec3(1.0, 0.65, 0.25);
            gl_FragColor = vec4(color, ring * uOpacity);
          }
        `,
        uniforms: {
          uOpacity: { value: 0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      this.impactShockwaveRing = new THREE.Mesh(ringGeo, ringMat);
      this.impactShockwaveRing.visible = false;
      this.scene.add(this.impactShockwaveRing);

      // 3. Ejecta Plume Column
      const plumeGeo = new THREE.CylinderGeometry(0.8, 0.05, 1.8, 32, 1, true);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0xff8833,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      this.impactEjectaPlume = new THREE.Mesh(plumeGeo, plumeMat);
      this.impactEjectaPlume.visible = false;
      this.scene.add(this.impactEjectaPlume);
    }

    /**
     * Start animation loop
     */
    start() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      this.clock.start();
      const loop = () => {
        this.update();
        this.render();
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    stop() {
      this.isAnimating = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }

    /**
     * State Machine Transition Controller
     */
    setStage(stage, payload = {}) {
      this.currentStage = stage;

      if (payload.asteroid) this.currentAsteroid = payload.asteroid;
      if (payload.target) {
        this.currentTarget = payload.target;
        this.updateTargetPositionOnGlobe();
      }
      if (payload.physics) this.simPhysics = payload.physics;

      // Adjust camera and elements based on stage
      switch (stage) {
        case 'INTRO':
          // Storyboard Panel 2 & 3: Wide deep space establishing shot
          this.earthGroup.position.set(4.5, -1.8, -8);
          this.earthGroup.scale.set(1.2, 1.2, 1.2);
          this.asteroidMesh.visible = true;
          this.asteroidMesh.position.set(-2.4, 0.4, 6.2);
          this.asteroidMesh.scale.set(1.0, 1.0, 1.0);
          this.cameraTargetPos.set(0, 0.6, 9.5);
          this.cameraLookTarget.set(-0.8, 0.2, 4.0);
          this.entryPlasmaCone.visible = false;
          this.trajectoryLine.visible = false;
          this.impactFlashMesh.visible = false;
          break;

        case 'PREVIEW':
          // Storyboard Panel 4: Focused on 3D asteroid preview panel
          this.earthGroup.position.set(0, -100, 0); // hide earth
          this.asteroidMesh.visible = true;
          this.asteroidMesh.position.set(0, 0, 0);
          this.asteroidMesh.scale.set(1.8, 1.8, 1.8);
          this.cameraTargetPos.set(0, 0, 4.5);
          this.cameraLookTarget.set(0, 0, 0);
          this.entryPlasmaCone.visible = false;
          this.trajectoryLine.visible = false;
          break;

        case 'TRANSITION_3D':
          // Storyboard Panel 7: Camera pulls into orbit overlooking target
          this.earthGroup.position.set(0, 0, 0);
          this.earthGroup.scale.set(1.0, 1.0, 1.0);
          this.updateTargetPositionOnGlobe();
          this.asteroidMesh.visible = true;

          // Align Earth so target faces camera
          this.orientGlobeToTarget();

          const targetSpherePos = this.latLonToSpherePos(this.currentTarget.lat, this.currentTarget.lon, this.earthRadius);
          const camPos = targetSpherePos.clone().normalize().multiplyScalar(7.2);
          camPos.y += 1.8;
          this.cameraTargetPos.copy(camPos);
          this.cameraLookTarget.copy(targetSpherePos);
          break;

        case 'APPROACH':
          // Storyboard Panel 7: Inbound trajectory vector & celestial approach
          this.earthGroup.position.set(0, 0, 0);
          this.earthGroup.scale.set(1.0, 1.0, 1.0);
          this.orientGlobeToTarget();
          this.setupTrajectoryLine();

          this.approachProgress = 0.0;
          this.approachDuration = 8.5; // seconds
          this.entryPlasmaCone.visible = false;
          this.trajectoryLine.visible = true;
          break;

        case 'IMPACT':
          this.impactProgress = 0.0;
          this.impactDuration = 3.5;
          this.cameraShakeIntensity = 1.0;
          this.impactFlashMesh.visible = true;
          this.impactShockwaveRing.visible = true;
          this.impactEjectaPlume.visible = true;
          break;
      }
    }

    orientGlobeToTarget() {
      // Rotate Earth so target sits naturally in front of camera
      const lat = this.currentTarget.lat * Math.PI / 180;
      const lon = this.currentTarget.lon * Math.PI / 180;
      this.earthGroup.rotation.y = -lon - Math.PI / 2;
      this.earthGroup.rotation.x = lat * 0.45;
    }

    setupTrajectoryLine() {
      const targetPos = this.latLonToSpherePos(this.currentTarget.lat, this.currentTarget.lon, this.earthRadius * 1.002);
      // Inbound direction from upper atmosphere
      const inboundVec = targetPos.clone().normalize().add(new THREE.Vector3(-0.8, 1.2, 0.4)).normalize();
      const startPos = targetPos.clone().add(inboundVec.clone().multiplyScalar(12.0));

      const points = [];
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const alpha = i / steps;
        // Hyperbolic slight curve under gravity
        const pt = new THREE.Vector3().lerpVectors(startPos, targetPos, alpha);
        pt.add(new THREE.Vector3(0, Math.sin(alpha * Math.PI) * 0.4, 0));
        points.push(pt);
      }

      this.trajectoryPoints = points;
      this.trajectoryLine.geometry.setFromPoints(points);
      this.trajectoryLine.computeLineDistances();
      this.trajectoryLine.visible = true;
    }

    /**
     * Frame-by-frame simulation update
     */
    update() {
      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // Rotate Clouds slightly faster than Earth surface
      if (this.cloudMesh) {
        this.cloudMesh.rotation.y += 0.02 * delta;
      }

      // Smooth camera interpolation (Lerp for cinematic feel)
      this.cameraCurrentPos.lerp(this.cameraTargetPos, 0.04);
      this.cameraLookCurrent.lerp(this.cameraLookTarget, 0.05);

      // Camera Shake during impact
      if (this.cameraShakeIntensity > 0.001) {
        const shakeX = (Math.random() - 0.5) * 0.18 * this.cameraShakeIntensity;
        const shakeY = (Math.random() - 0.5) * 0.18 * this.cameraShakeIntensity;
        const shakeZ = (Math.random() - 0.5) * 0.18 * this.cameraShakeIntensity;
        this.camera.position.set(
          this.cameraCurrentPos.x + shakeX,
          this.cameraCurrentPos.y + shakeY,
          this.cameraCurrentPos.z + shakeZ
        );
        this.cameraShakeIntensity *= Math.pow(0.88, delta * 60);
      } else {
        this.camera.position.copy(this.cameraCurrentPos);
      }
      this.camera.lookAt(this.cameraLookCurrent);

      // Stage Specific Animation Logic
      if (this.currentStage === 'INTRO') {
        // Slow cinematic tumble and drift
        this.asteroidMesh.rotation.x += 0.12 * delta;
        this.asteroidMesh.rotation.y += 0.18 * delta;
        this.asteroidMesh.position.x += 0.04 * delta;
        this.asteroidMesh.position.z -= 0.08 * delta;

      } else if (this.currentStage === 'PREVIEW') {
        // Controlled turntable rotation
        this.asteroidMesh.rotation.y += 0.35 * delta;
        this.asteroidMesh.rotation.x = Math.sin(time * 0.5) * 0.15;

      } else if (this.currentStage === 'APPROACH') {
        // Progress down the orbital trajectory
        this.approachProgress += delta / this.approachDuration;
        const p = Math.min(1.0, this.approachProgress);

        if (this.trajectoryPoints && this.trajectoryPoints.length > 1) {
          const indexFloat = p * (this.trajectoryPoints.length - 1);
          const i0 = Math.floor(indexFloat);
          const i1 = Math.min(this.trajectoryPoints.length - 1, i0 + 1);
          const frac = indexFloat - i0;

          const currentPos = new THREE.Vector3().lerpVectors(this.trajectoryPoints[i0], this.trajectoryPoints[i1], frac);
          this.asteroidMesh.position.copy(currentPos);

          // Calculate current altitude above Earth surface (km)
          const distToCenter = currentPos.length();
          const altKm = Math.max(0, (distToCenter - this.earthRadius) * (6371.0 / this.earthRadius));
          const targetDistKm = currentPos.distanceTo(this.trajectoryPoints[this.trajectoryPoints.length - 1]) * (6371.0 / this.earthRadius);

          // Hypersonic Plasma Sheath as altitude drops below 100 km (Karman Line)
          if (altKm <= 120.0) {
            this.entryPlasmaCone.visible = true;
            this.entryPlasmaCone.position.copy(currentPos);
            // Orient cone against flight direction
            const flightDir = this.trajectoryPoints[i1].clone().sub(this.trajectoryPoints[i0]).normalize();
            this.entryPlasmaCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), flightDir.clone().negate());

            const plasmaIntensity = Math.min(1.0, (120.0 - altKm) / 80.0);
            this.entryPlasmaCone.material.uniforms.uIntensity.value = plasmaIntensity;
            this.entryPlasmaCone.material.uniforms.uTime.value = time;
          } else {
            this.entryPlasmaCone.visible = false;
          }

          // Camera tracks dynamically
          if (p < 0.6) {
            this.cameraLookTarget.copy(currentPos);
          } else {
            // Camera frames the impending ground strike
            this.cameraLookTarget.copy(this.trajectoryPoints[this.trajectoryPoints.length - 1]);
          }

          // Telemetry callback to UI HUD
          if (this.onTelemetryUpdate) {
            const vBase = this.currentAsteroid ? this.currentAsteroid.velocityKmS : 18.5;
            // Accelerate slightly under Earth's gravity well
            const liveVelocity = Math.sqrt(vBase*vBase + (2 * 9.81 * (6371 - altKm) * 0.001));
            const angleDeg = this.currentAsteroid && this.currentAsteroid.impactAngleDeg ? this.currentAsteroid.impactAngleDeg : 45.0;
            const remainingTimeSec = Math.max(0, (1.0 - p) * this.approachDuration);

            this.onTelemetryUpdate({
              altitudeKm: Math.round(altKm),
              distanceToTargetKm: Math.round(targetDistKm),
              velocityKmS: Number(liveVelocity.toFixed(2)),
              impactAngleDeg: angleDeg,
              timeToImpactSec: Number(remainingTimeSec.toFixed(1)),
              stage: altKm > 100 ? 'ORBITAL APPROACH' : 'HYPERSONIC ATMOSPHERIC ENTRY'
            });
          }

          // Trigger Impact when p reaches 1.0
          if (p >= 1.0) {
            this.asteroidMesh.visible = false;
            this.entryPlasmaCone.visible = false;
            this.trajectoryLine.visible = false;
            this.setStage('IMPACT');
          }
        }

      } else if (this.currentStage === 'IMPACT') {
        this.impactProgress += delta / this.impactDuration;
        const p = this.impactProgress;

        const targetSpherePos = this.latLonToSpherePos(this.currentTarget.lat, this.currentTarget.lon, this.earthRadius * 1.002);
        const normal = targetSpherePos.clone().normalize();

        // 1. Kinetic Flash Expansion and Fade
        this.impactFlashMesh.position.copy(targetSpherePos);
        const flashScale = Math.min(3.5, 0.4 + p * 6.0);
        this.impactFlashMesh.scale.set(flashScale, flashScale, flashScale);
        this.impactFlashMesh.material.opacity = Math.max(0, 1.0 - p * 2.2);

        // 2. Supersonic Shockwave Ring Expansion across the Earth's curvature
        this.impactShockwaveRing.position.copy(targetSpherePos);
        this.impactShockwaveRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        const ringScale = 0.5 + p * 8.5;
        this.impactShockwaveRing.scale.set(ringScale, ringScale, ringScale);
        this.impactShockwaveRing.material.uniforms.uOpacity.value = Math.max(0, 1.0 - p * 1.3);

        // 3. Ejecta Plume Rising
        this.impactEjectaPlume.position.copy(targetSpherePos.clone().add(normal.clone().multiplyScalar(0.9 * p)));
        this.impactEjectaPlume.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        this.impactEjectaPlume.scale.set(1.0 + p * 2.5, 1.0 + p * 2.5, 1.0 + p * 2.5);
        this.impactEjectaPlume.material.opacity = Math.max(0, 0.9 - p * 1.1);

        // Completion callback: Transition to 2D Impact Effect Map & Scientific Results
        if (p >= 1.0 && this.onImpactComplete) {
          this.onImpactComplete();
        }
      }
    }

    render() {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  window.CollisionSim3D = CollisionSim3D;

})(window);
