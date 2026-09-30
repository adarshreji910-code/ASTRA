/**
 * ASTRA — ASTEROID COLLISION
 * Master Simulation Controller & State Machine Orchestrator
 * Connects 3D WebGL Simulation, 2D Scientific Earth Map, NASA/JPL Data, and Physics Engine
 * Optimized for Storyboard Panels 1-10
 */

(function (window) {
  'use strict';

  class AsteroidCollisionApp {
    constructor() {
      this.isLaunched = false;
      this.currentState = 'INTRO';
      this.stateHistory = [];

      // Selected Scenario Data
      this.selectedAsteroid = null;
      this.selectedTarget = {
        name: 'Mumbai, India',
        lat: 19.0760,
        lon: 72.8777,
        region: 'Western Coast of India, Arabian Sea',
        type: 'coastal'
      };
      this.physicsResults = null;

      // Submodules
      this.sim3d = null;
      this.targetMap = null;

      // DOM Elements
      this.experienceContainer = null;
      this.homeViewport = null;
      this.navHeader = null;
      this.trackerLabel = null;
      this.views = {};

      this.init();
    }

    init() {
      // Find DOM containers
      this.experienceContainer = document.getElementById('asteroid-collision-experience');
      this.homeViewport = document.querySelector('.app-viewport');
      this.navHeader = document.getElementById('sim-nav-header');
      this.trackerLabel = document.getElementById('sim-tracker-label');

      if (!this.experienceContainer) {
        console.warn('[ASTRA Collision] Experience container #asteroid-collision-experience not found');
        return;
      }

      // Cache stage view elements
      const stageIds = ['intro', 'parameters', 'target-map', 'approach-hud', 'results'];
      stageIds.forEach(id => {
        const el = document.getElementById(`view-${id}`);
        if (el) this.views[id] = el;
      });

      // Bind global events
      this.bindNavigationEvents();
      this.bindParametersEvents();
      this.bindTargetMapEvents();
      this.bindResultsEvents();
      this.bindHomeIntegration();
    }

    /**
     * Intercept and integrate with existing ASTRA homepage
     */
    bindHomeIntegration() {
      // 1. Direct click on ASTEROID COLLISION feature card
      const collisionCard = document.querySelector('.feature-card[data-slug="asteroid-collision"]');
      if (collisionCard) {
        collisionCard.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.suppressMissionModal();
          this.launch();
        }, true);
      }

      // 2. Click in existing mission modal if opened
      const modalActionBtn = document.getElementById('modal-action-btn');
      if (modalActionBtn) {
        modalActionBtn.addEventListener('click', () => {
          const currentModalTitle = document.getElementById('modal-title')?.textContent || '';
          if (currentModalTitle.toUpperCase().includes('ASTEROID')) {
            this.suppressMissionModal();
            this.launch();
          }
        });
      }

      // 3. Hash change support
      window.addEventListener('hashchange', () => {
        if (window.location.hash === '#asteroid-collision') {
          this.suppressMissionModal();
          this.launch();
        }
      });
      if (window.location.hash === '#asteroid-collision') {
        this.suppressMissionModal();
        this.launch();
      }
    }

    suppressMissionModal() {
      const modal = document.getElementById('mission-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      }
    }

    /**
     * Launch Asteroid Collision Experience
     */
    launch() {
      this.suppressMissionModal();

      if (this.isLaunched) return;
      this.isLaunched = true;

      // Hide homepage UI smoothly
      if (this.homeViewport) {
        this.homeViewport.style.transition = 'opacity 0.35s ease';
        this.homeViewport.style.opacity = '0';
        this.homeViewport.style.pointerEvents = 'none';
      }

      // Show collision container
      this.experienceContainer.style.display = 'block';
      this.experienceContainer.classList.add('active');
      this.experienceContainer.setAttribute('aria-hidden', 'false');

      // Initialize 3D Engine on dedicated canvas
      if (!this.sim3d) {
        const canvas3d = document.getElementById('collision-webgl-canvas');
        if (canvas3d && window.CollisionSim3D) {
          this.sim3d = new window.CollisionSim3D(canvas3d, {
            quality: 'high',
            onTelemetryUpdate: (telemetry) => this.updateTelemetryHUD(telemetry),
            onImpactComplete: () => this.handleImpactComplete()
          });
        }
      }
      if (this.sim3d) {
        this.sim3d.start();
        setTimeout(() => this.sim3d.onResize(), 60);
      }

      // Initialize 2D Target Map
      if (!this.targetMap) {
        const mapCanvas = document.getElementById('earth-target-canvas');
        if (mapCanvas && window.EarthTargetMap) {
          this.targetMap = new window.EarthTargetMap(mapCanvas, {
            onTargetSelect: (target) => this.handleTargetSelect(target),
            onHoverCoordinate: (geo, probe) => this.handleHoverCoordinate(geo, probe)
          });
        }
      }
      if (this.targetMap) {
        this.targetMap.startAnimation();
        setTimeout(() => {
          this.targetMap.resize();
          this.targetMap.resetView();
        }, 60);
      }

      // Default to Apophis if none selected
      if (!this.selectedAsteroid && window.NasaDataService) {
        this.selectedAsteroid = window.NasaDataService.getAsteroidById('99942') || window.NasaDataService.REFERENCE_BODIES[0];
      }

      // Start at State 1: Cinematic Space Intro (Cockpit HUD)
      this.transitionTo('INTRO');
    }

    /**
     * Return smoothly and immediately to existing ASTRA homepage
     */
    exitToHome() {
      // Suppress any stray modals
      this.suppressMissionModal();

      // Stop 3D and 2D canvas loops for 60fps performance
      if (this.sim3d) this.sim3d.stop();
      if (this.targetMap) this.targetMap.stopAnimation();

      // Smooth fade out of collision container
      this.experienceContainer.classList.remove('active');
      this.experienceContainer.setAttribute('aria-hidden', 'true');

      setTimeout(() => {
        this.experienceContainer.style.display = 'none';
        this.isLaunched = false;
        this.stateHistory = [];

        // Restore original ASTRA homepage exactly as it was
        if (this.homeViewport) {
          this.homeViewport.style.opacity = '1';
          this.homeViewport.style.pointerEvents = 'auto';
        }

        // Clean up hash if set
        if (window.location.hash === '#asteroid-collision') {
          history.replaceState(null, '', window.location.pathname);
        }
      }, 350);
    }

    /**
     * State Machine Transition Engine
     */
    transitionTo(nextState, payload = {}) {
      if (this.currentState && this.currentState !== nextState) {
        this.stateHistory.push(this.currentState);
      }
      this.currentState = nextState;

      // Hide all stage views
      Object.values(this.views).forEach(v => {
        if (v) v.classList.remove('active');
      });
      if (this.navHeader) this.navHeader.classList.remove('cinematic-dim');

      switch (nextState) {
        case 'INTRO':
          this.updateTracker('01 // COCKPIT MONITOR // ORBITAL DEFENSE');
          if (this.views['intro']) this.views['intro'].classList.add('active');
          if (this.sim3d) this.sim3d.setStage('INTRO');
          break;

        case 'PARAMETERS':
          this.updateTracker('02 // ASTEROID PARAMETERS DASHBOARD');
          if (this.views['parameters']) this.views['parameters'].classList.add('active');
          this.renderParametersDashboard();
          if (this.sim3d) this.sim3d.setStage('PREVIEW', { asteroid: this.selectedAsteroid });
          break;

        case 'TARGET_MAP':
          this.updateTracker('03 // 2D FLAT EARTH TARGET ACQUISITION');
          if (this.views['target-map']) this.views['target-map'].classList.add('active');
          
          // Show target confirmation controls, hide report return button
          const confirmBtn = document.getElementById('btn-confirm-target-sim');
          const reportBtn = document.getElementById('btn-map-to-report');
          if (confirmBtn) confirmBtn.style.display = 'inline-flex';
          if (reportBtn) reportBtn.style.display = 'none';

          if (this.targetMap) {
            this.targetMap.disableImpactMode();
            this.targetMap.resize();
            this.targetMap.setTarget(this.selectedTarget, false);
          }
          this.updateTargetHUD(this.selectedTarget);
          break;

        case 'APPROACH':
          this.updateTracker('04 // ORBITAL APPROACH & HYPERSONIC ENTRY');
          if (this.navHeader) this.navHeader.classList.add('cinematic-dim');
          if (this.views['approach-hud']) this.views['approach-hud'].classList.add('active');

          // Precompute peer-reviewed impact physics results
          if (window.ImpactPhysics && this.selectedAsteroid) {
            this.physicsResults = window.ImpactPhysics.calculate({
              diameter: this.selectedAsteroid.diameterM,
              velocity: this.selectedAsteroid.velocityKmS,
              density: this.selectedAsteroid.densityKgM3,
              angle: this.selectedAsteroid.impactAngleDeg || 45,
              targetType: this.selectedTarget.type
            });
          }

          if (this.sim3d) {
            this.sim3d.setStage('APPROACH', {
              asteroid: this.selectedAsteroid,
              target: this.selectedTarget,
              physics: this.physicsResults
            });
          }
          break;

        case 'EFFECT_MAP':
          this.updateTracker('05 // 2D CONCENTRIC DAMAGE RINGS MAP');
          if (this.views['target-map']) this.views['target-map'].classList.add('active');
          
          // In damage map mode, hide simulate button and show view report button
          const cBtn = document.getElementById('btn-confirm-target-sim');
          const rBtn = document.getElementById('btn-map-to-report');
          if (cBtn) cBtn.style.display = 'none';
          if (rBtn) rBtn.style.display = 'inline-flex';

          if (this.targetMap) {
            this.targetMap.enableImpactMode(this.physicsResults);
            this.targetMap.resize();
          }
          break;

        case 'RESULTS':
          this.updateTracker('06 // SCIENTIFIC RESULTS TELEMETRY REPORT');
          if (this.views['results']) this.views['results'].classList.add('active');
          this.renderResultsReport();
          break;
      }
    }

    goBack() {
      if (this.stateHistory.length === 0 || this.currentState === 'INTRO') {
        this.exitToHome();
        return;
      }
      const prevState = this.stateHistory.pop();
      this.transitionTo(prevState);
    }

    updateTracker(label) {
      if (this.trackerLabel) {
        this.trackerLabel.textContent = label;
      }
    }

    /* ==========================================================================
       EVENT BINDINGS
       ========================================================================== */
    bindNavigationEvents() {
      // 1. Dedicated Prominent "BACK TO HOME" Button
      const homeBtn = document.getElementById('btn-global-home');
      if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.exitToHome();
        });
      }

      // 2. Top-Left Brand Button -> Home
      const brandBtn = document.getElementById('sim-nav-brand');
      if (brandBtn) {
        brandBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.exitToHome();
        });
      }

      // 3. Top-Left Back Button
      const backBtn = document.getElementById('sim-nav-back');
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.goBack();
        });
      }

      // 4. Fullscreen Toggle
      const fsBtn = document.getElementById('sim-fullscreen-btn');
      if (fsBtn) {
        fsBtn.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        });
      }

      // 5. Stage 1 Intro CTA -> Parameters Dashboard
      const introProceedBtn = document.getElementById('btn-intro-proceed');
      if (introProceedBtn) {
        introProceedBtn.addEventListener('click', () => {
          this.transitionTo('PARAMETERS');
        });
      }
    }

    bindParametersEvents() {
      // Asteroid Selection Dropdown
      const selectEl = document.getElementById('param-asteroid-select');
      if (selectEl && window.NasaDataService) {
        selectEl.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'custom') {
            this.showCustomControls(true);
            this.selectedAsteroid = this.getCustomAsteroidFromInputs();
          } else {
            this.showCustomControls(false);
            const found = window.NasaDataService.getAsteroidById(val);
            if (found) this.selectedAsteroid = found;
          }
          this.renderParametersDashboard();
          if (this.sim3d) {
            this.sim3d.setStage('PREVIEW', { asteroid: this.selectedAsteroid });
          }
        });
      }

      // Custom Inputs
      const customInputs = ['custom-diam', 'custom-vel', 'custom-angle', 'custom-comp'];
      customInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
            this.selectedAsteroid = this.getCustomAsteroidFromInputs();
            this.renderParametersDashboard(false);
          });
        }
      });

      // Proceed to Earth Targeting
      const proceedTargetBtn = document.getElementById('btn-param-proceed-target');
      if (proceedTargetBtn) {
        proceedTargetBtn.addEventListener('click', () => {
          this.transitionTo('TARGET_MAP');
        });
      }
    }

    showCustomControls(show) {
      const wrap = document.getElementById('custom-params-sliders-wrap');
      if (wrap) wrap.style.display = show ? 'grid' : 'none';
    }

    getCustomAsteroidFromInputs() {
      const diam = parseFloat(document.getElementById('custom-diam')?.value || '340');
      const vel = parseFloat(document.getElementById('custom-vel')?.value || '17.5');
      const angle = parseFloat(document.getElementById('custom-angle')?.value || '45');
      const comp = document.getElementById('custom-comp')?.value || 'stony';

      let density = 3000;
      if (comp === 'iron') density = 7800;
      else if (comp === 'carbonaceous') density = 1800;
      else if (comp === 'cometary') density = 1000;

      // Update readout labels
      const dLabel = document.getElementById('custom-diam-val');
      if (dLabel) dLabel.textContent = diam >= 1000 ? (diam/1000).toFixed(2) + ' km' : Math.round(diam) + ' m';
      const vLabel = document.getElementById('custom-vel-val');
      if (vLabel) vLabel.textContent = vel.toFixed(1) + ' km/s';
      const aLabel = document.getElementById('custom-angle-val');
      if (aLabel) aLabel.textContent = angle + '°';

      return {
        id: 'custom',
        spkId: 'CUSTOM-01',
        name: 'Custom Threat Scenario',
        fullname: 'Custom User Scenario',
        orbitClass: 'Hypothetical Threat',
        orbitClassCode: 'HYP',
        diameterM: diam,
        diameterUncertaintyM: 0,
        diameterStatus: 'USER SPECIFIED',
        velocityKmS: vel,
        densityKgM3: density,
        densityStatus: 'USER SPECIFIED',
        compositionType: comp,
        impactAngleDeg: angle,
        pha: true,
        moidAu: 0.00005,
        semiMajorAxisAu: 1.0,
        eccentricity: 0.2,
        inclinationDeg: 5.0,
        orbitalPeriodDays: 365,
        observationCount: 1,
        observationArcDays: 1,
        description: 'User-configured asteroid impact parameters for planetary defense analysis.'
      };
    }

    bindTargetMapEvents() {
      // Confirm Target and Begin Simulation
      const confirmBtn = document.getElementById('btn-confirm-target-sim');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          this.transitionTo('APPROACH');
        });
      }

      // Preset Target Dropdown in HUD
      const presetSelect = document.getElementById('map-preset-select');
      if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          const PRESET_MAP = {
            'mumbai': { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, region: 'Western Coast of India, Arabian Sea', type: 'coastal' },
            'delhi': { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, region: 'Northern Plains, India', type: 'land' },
            'tokyo': { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, region: 'Kanto Region, Japan', type: 'coastal' },
            'london': { name: 'London, UK', lat: 51.5074, lon: -0.1278, region: 'Thames Basin, United Kingdom', type: 'land' },
            'nyc': { name: 'New York City, USA', lat: 40.7128, lon: -74.0060, region: 'East Coast, North America', type: 'coastal' },
            'chicxulub': { name: 'Chicxulub, Yucatan', lat: 21.4000, lon: -89.5167, region: 'Yucatan Peninsula, Mexico (K-Pg Site)', type: 'coastal' },
            'pacific': { name: 'Mid-Pacific Ocean', lat: 0.0000, lon: -160.0000, region: 'Equatorial Pacific Ocean Basin', type: 'water' }
          };
          if (PRESET_MAP[val]) {
            this.selectedTarget = PRESET_MAP[val];
            if (this.targetMap) this.targetMap.setTarget(this.selectedTarget, true);
            this.updateTargetHUD(this.selectedTarget);
          }
        });
      }
    }

    bindResultsEvents() {
      // Replay Simulation
      document.getElementById('btn-results-replay')?.addEventListener('click', () => {
        this.transitionTo('APPROACH');
      });

      // Change Parameters / New Simulation
      document.getElementById('btn-results-new')?.addEventListener('click', () => {
        this.transitionTo('PARAMETERS');
      });

      // View 2D Concentric Effect Map
      document.getElementById('btn-view-effect-map')?.addEventListener('click', () => {
        this.transitionTo('EFFECT_MAP');
      });

      // From 2D Effect Map back to Results Report
      document.getElementById('btn-map-to-report')?.addEventListener('click', () => {
        this.transitionTo('RESULTS');
      });

      // Return to ASTRA Home
      document.getElementById('btn-results-exit-home')?.addEventListener('click', () => {
        this.exitToHome();
      });
    }

    /* ==========================================================================
       UI RENDERING METHODS
       ========================================================================== */
    renderParametersDashboard(updateSelect = true) {
      const a = this.selectedAsteroid;
      if (!a) return;

      // Update Selector if needed
      if (updateSelect) {
        const sel = document.getElementById('param-asteroid-select');
        if (sel) {
          sel.value = a.id === 'custom' ? 'custom' : (a.spkId || a.id);
        }
      }

      // Update Header & Descriptions
      const titleEl = document.getElementById('param-asteroid-title');
      if (titleEl) titleEl.textContent = a.fullname.toUpperCase();
      const classEl = document.getElementById('param-asteroid-class');
      if (classEl) classEl.textContent = `${a.orbitClass} Class Asteroid`;
      const descEl = document.getElementById('param-desc-text');
      if (descEl) descEl.textContent = a.description;

      // Hero Metrics (Panel 4 Match)
      const massKg = (4/3) * Math.PI * Math.pow(a.diameterM / 2.0, 3) * a.densityKgM3;
      const massValEl = document.getElementById('param-mass-val');
      if (massValEl) {
        massValEl.textContent = window.ImpactPhysics ? window.ImpactPhysics.formatSci(massKg) + ' kg' : massKg.toExponential(2) + ' kg';
      }
      const massBadgeEl = document.getElementById('param-mass-badge');
      if (massBadgeEl) {
        massBadgeEl.textContent = a.densityStatus;
        massBadgeEl.className = `scientific-badge ${a.densityStatus === 'OBSERVED' ? 'badge-observed' : 'badge-estimated'}`;
      }

      const velValEl = document.getElementById('param-vel-val');
      if (velValEl) velValEl.textContent = `${a.velocityKmS.toFixed(2)} km/s`;
      const velSubEl = document.getElementById('param-vel-sub');
      if (velSubEl) velSubEl.textContent = `${(a.velocityKmS * 2236.94).toLocaleString(undefined, {maximumFractionDigits: 0})} mph`;

      const diamFormatted = a.diameterM >= 1000 ? (a.diameterM / 1000.0).toFixed(2) + ' km' : Math.round(a.diameterM) + ' m';
      const diamValEl = document.getElementById('param-diam-val');
      if (diamValEl) diamValEl.textContent = diamFormatted;
      const diamUncertEl = document.getElementById('param-diam-uncert');
      if (diamUncertEl) diamUncertEl.textContent = `± ${Math.round(a.diameterUncertaintyM || 0)} m uncertainty`;
      const diamBadgeEl = document.getElementById('param-diam-badge');
      if (diamBadgeEl) diamBadgeEl.textContent = a.diameterStatus;

      // Orbital Table
      const spkEl = document.getElementById('param-table-spk');
      if (spkEl) spkEl.textContent = a.spkId || 'N/A';
      const oClassEl = document.getElementById('param-table-class');
      if (oClassEl) oClassEl.textContent = a.orbitClass || 'N/A';
      const phaEl = document.getElementById('param-table-pha');
      if (phaEl) phaEl.textContent = a.pha ? 'YES (Potentially Hazardous)' : 'NO';
      const moidEl = document.getElementById('param-table-moid');
      if (moidEl) moidEl.textContent = a.moidAu !== null && a.moidAu !== undefined ? a.moidAu + ' AU' : 'NOT AVAILABLE';
      const smaEl = document.getElementById('param-table-sma');
      if (smaEl) smaEl.textContent = a.semiMajorAxisAu ? a.semiMajorAxisAu + ' AU' : 'NOT AVAILABLE';
      const eccEl = document.getElementById('param-table-ecc');
      if (eccEl) eccEl.textContent = a.eccentricity !== null && a.eccentricity !== undefined ? a.eccentricity : 'NOT AVAILABLE';
      const incEl = document.getElementById('param-table-inc');
      if (incEl) incEl.textContent = a.inclinationDeg ? a.inclinationDeg + '°' : 'NOT AVAILABLE';
      const perEl = document.getElementById('param-table-period');
      if (perEl) perEl.textContent = a.orbitalPeriodDays ? a.orbitalPeriodDays + ' days' : 'NOT AVAILABLE';
      const obsEl = document.getElementById('param-table-obs');
      if (obsEl) obsEl.textContent = a.observationCount ? `${a.observationCount} observations over ${a.observationArcDays} days` : 'NOT AVAILABLE';

      // Render Charts
      this.drawCompositionDonutChart(a);
      this.drawSpectralAnalysisChart(a);
    }

    drawCompositionDonutChart(ast) {
      const c = document.getElementById('canvas-composition-donut');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);

      let slices = [
        { label: 'Silicates', pct: 0.68, color: '#64d2ff' },
        { label: 'Nickel-Iron', pct: 0.22, color: '#ffaa33' },
        { label: 'Carbonaceous', pct: 0.08, color: '#00e699' },
        { label: 'Volatiles', pct: 0.02, color: '#a070ff' }
      ];

      if (ast.compositionType === 'iron') {
        slices = [
          { label: 'Nickel-Iron', pct: 0.88, color: '#ffaa33' },
          { label: 'Silicates', pct: 0.10, color: '#64d2ff' },
          { label: 'Trace Metals', pct: 0.02, color: '#00e699' }
        ];
      } else if (ast.compositionType === 'carbonaceous') {
        slices = [
          { label: 'Carbon / Organics', pct: 0.52, color: '#00e699' },
          { label: 'Hydrated Clays', pct: 0.34, color: '#64d2ff' },
          { label: 'Magnetite / Iron', pct: 0.14, color: '#ffaa33' }
        ];
      } else if (ast.compositionType === 'cometary') {
        slices = [
          { label: 'Water Ice / Volatiles', pct: 0.70, color: '#33ccff' },
          { label: 'Silicate Dust', pct: 0.20, color: '#8ca2b9' },
          { label: 'Organics', pct: 0.10, color: '#00e699' }
        ];
      }

      const cx = 75;
      const cy = h / 2;
      const rOuter = 50;
      const rInner = 32;
      let curAngle = -Math.PI / 2;

      slices.forEach(s => {
        const sliceAngle = s.pct * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, curAngle, curAngle + sliceAngle);
        ctx.arc(cx, cy, rInner, curAngle + sliceAngle, curAngle, true);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.fill();
        curAngle += sliceAngle;
      });

      // Center cutout label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ast.compositionType ? ast.compositionType.toUpperCase() : 'STONY', cx, cy);

      // Legend
      let legY = 24;
      ctx.textAlign = 'left';
      ctx.font = '9px "Inter", sans-serif';
      slices.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.fillRect(150, legY - 7, 8, 8);
        ctx.fillStyle = '#8ca2b9';
        ctx.fillText(`${s.label}: ${(s.pct * 100).toFixed(0)}%`, 164, legY);
        legY += 24;
      });
    }

    drawSpectralAnalysisChart(ast) {
      const c = document.getElementById('canvas-spectral-chart');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(100, 210, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 30; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, h - 20);
        ctx.stroke();
      }
      for (let y = 15; y < h - 15; y += 25) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }

      // Axes labels
      ctx.fillStyle = '#8ca2b9';
      ctx.font = '8px "Space Grotesk", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('1.5', 26, 20);
      ctx.fillText('1.0', 26, 60);
      ctx.fillText('0.5', 26, 100);

      ctx.textAlign = 'center';
      ctx.fillText('0.4µm', 50, h - 6);
      ctx.fillText('0.8µm', 130, h - 6);
      ctx.fillText('1.2µm', 210, h - 6);
      ctx.fillText('1.6µm', 290, h - 6);

      // Spectral Curve
      const seed = (ast.name || 'Apophis').charCodeAt(0);
      ctx.beginPath();
      ctx.moveTo(35, 70);

      const points = 30;
      for (let i = 0; i <= points; i++) {
        const px = 35 + (i / points) * (w - 50);
        const normX = i / points;
        let val = 0.9 + 0.3 * Math.sin(normX * Math.PI * 2.5 + seed * 0.1) - 0.2 * Math.cos(normX * Math.PI * 4);
        const py = (h - 25) - ((val - 0.4) / 1.2) * (h - 40);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.strokeStyle = '#64d2ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Subtle Glow Fill under curve
      ctx.lineTo(w - 15, h - 22);
      ctx.lineTo(35, h - 22);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 20, 0, h - 20);
      grad.addColorStop(0, 'rgba(100, 210, 255, 0.25)');
      grad.addColorStop(1, 'rgba(100, 210, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    handleTargetSelect(target) {
      this.selectedTarget = target;
      this.updateTargetHUD(target);
    }

    handleHoverCoordinate(geo, probe) {
      const coordEl = document.getElementById('live-target-coords');
      if (coordEl && geo) {
        coordEl.textContent = `LAT ${Math.abs(geo.lat).toFixed(4)}° ${geo.lat >= 0 ? 'N' : 'S'}  |  LON ${Math.abs(geo.lon).toFixed(4)}° ${geo.lon >= 0 ? 'E' : 'W'}`;
      }
    }

    updateTargetHUD(target) {
      const nameEl = document.getElementById('hud-target-name');
      if (nameEl) nameEl.textContent = target.name.toUpperCase();
      const latLonEl = document.getElementById('hud-target-latlon');
      if (latLonEl) latLonEl.textContent = `${Math.abs(target.lat).toFixed(4)}° ${target.lat >= 0 ? 'N' : 'S'}, ${Math.abs(target.lon).toFixed(4)}° ${target.lon >= 0 ? 'E' : 'W'}`;
      const regEl = document.getElementById('hud-target-region');
      if (regEl) regEl.textContent = target.region.toUpperCase();
      
      const topTitleEl = document.getElementById('top-hud-target-title');
      if (topTitleEl) topTitleEl.textContent = `TARGET: ${target.name.toUpperCase()}`;
    }

    updateTelemetryHUD(t) {
      const altEl = document.getElementById('approach-alt-num');
      if (altEl) altEl.textContent = t.altitudeKm.toLocaleString();
      const velEl = document.getElementById('approach-vel-num');
      if (velEl) velEl.textContent = `${t.velocityKmS.toFixed(1)} km/s`;
      const distEl = document.getElementById('approach-dist-num');
      if (distEl) distEl.textContent = `${t.distanceToTargetKm.toLocaleString()} km`;
      const countEl = document.getElementById('approach-countdown-sec');
      if (countEl) countEl.textContent = `T - 00:${t.timeToImpactSec < 10 ? '0' : ''}${t.timeToImpactSec.toFixed(1)}`;
      const subEl = document.getElementById('approach-stage-sub');
      if (subEl) subEl.textContent = t.stage;
    }

    handleImpactComplete() {
      // Transition smoothly into 2D Impact Effect Map (Storyboard Panel 9)
      setTimeout(() => {
        this.transitionTo('EFFECT_MAP');
      }, 1200);
    }

    renderResultsReport() {
      const res = this.physicsResults;
      const a = this.selectedAsteroid;
      const t = this.selectedTarget;
      if (!res || !a || !t) return;

      const resTargetTitle = document.getElementById('res-target-title');
      if (resTargetTitle) resTargetTitle.textContent = t.name.toUpperCase();
      const resTargetCoords = document.getElementById('res-target-coords');
      if (resTargetCoords) resTargetCoords.textContent = `${Math.abs(t.lat).toFixed(4)}° ${t.lat >= 0 ? 'N' : 'S'}, ${Math.abs(t.lon).toFixed(4)}° ${t.lon >= 0 ? 'E' : 'W'} (${t.region})`;
      const resAstName = document.getElementById('res-asteroid-name');
      if (resAstName) resAstName.textContent = a.fullname.toUpperCase();

      // Energy
      const energyMtEl = document.getElementById('res-energy-mt');
      if (energyMtEl) energyMtEl.textContent = `${res.energy.megatons.toLocaleString(undefined, {maximumFractionDigits: 1})} Mt`;
      const energyJEl = document.getElementById('res-energy-joules');
      if (energyJEl) energyJEl.textContent = `${window.ImpactPhysics.formatSci(res.energy.joules)} Joules`;
      const hiroEl = document.getElementById('res-hiroshima-equiv');
      if (hiroEl) hiroEl.textContent = `${Math.round(res.energy.hiroshimaEquiv).toLocaleString()} × (15 kt)`;
      const tsarEl = document.getElementById('res-tsarbomba-equiv');
      if (tsarEl) tsarEl.textContent = `${res.energy.tsarBombaEquiv.toFixed(1)} × (50 Mt)`;

      // Crater
      const craterDiamEl = document.getElementById('res-crater-diam');
      if (craterDiamEl) craterDiamEl.textContent = `${res.crater.finalDiameterKm.toFixed(2)} km`;
      const craterDepthEl = document.getElementById('res-crater-depth');
      if (craterDepthEl) craterDepthEl.textContent = `${Math.round(res.crater.depthM)} m`;
      const craterTypeEl = document.getElementById('res-crater-type');
      if (craterTypeEl) craterTypeEl.textContent = `${res.crater.craterType.toUpperCase()} CRATER`;
      const craterMassEl = document.getElementById('res-crater-mass');
      if (craterMassEl) craterMassEl.textContent = `${window.ImpactPhysics.formatSci(res.crater.meltVolumeM3 * 2700)} kg`;

      // Blast & Environmental Radii
      const b20El = document.getElementById('res-blast-20psi');
      if (b20El) b20El.textContent = `${res.blast.overpressureRadiiKm['20psi'].toFixed(1)} km (Reinforced concrete collapse)`;
      const b5El = document.getElementById('res-blast-5psi');
      if (b5El) b5El.textContent = `${res.blast.overpressureRadiiKm['5psi'].toFixed(1)} km (Residential collapse, widespread fatalities)`;
      const b1El = document.getElementById('res-blast-1psi');
      if (b1El) b1El.textContent = `${res.blast.overpressureRadiiKm['1psi'].toFixed(1)} km (Window shatter, light structure damage)`;
      const thermEl = document.getElementById('res-thermal-3rd');
      if (thermEl) thermEl.textContent = `${res.thermal.burnRadiiKm.thirdDegree.toFixed(1)} km (Third-degree burns)`;
      const seisEl = document.getElementById('res-seismic-mag');
      if (seisEl) seisEl.textContent = `M${res.seismic.richtersMagnitude.toFixed(1)} Richter (Felt up to ${Math.round(res.seismic.feltDistanceKm)} km)`;

      // Climate
      const climEl = document.getElementById('res-climate-summary');
      if (climEl) climEl.textContent = res.climate.summary;

      // Draw Result Charts
      this.drawOverpressureChart(res);
      this.drawThermalChart(res);
      this.drawSeismicWaveform(res);
    }

    drawOverpressureChart(res) {
      const c = document.getElementById('canvas-chart-overpressure');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(100, 210, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 15; y < h - 15; y += 22) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#8ca2b9';
      ctx.font = '8px "Space Grotesk", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('20 psi', 28, 20);
      ctx.fillText('5 psi', 28, 55);
      ctx.fillText('1 psi', 28, 85);

      // Curve
      ctx.beginPath();
      const points = 40;
      const maxDist = res.blast.overpressureRadiiKm['1psi'] * 1.5;

      for (let i = 0; i <= points; i++) {
        const distKm = 1 + (i / points) * maxDist;
        const psi = window.ImpactPhysics.calculateOverpressureAtDistance(res.energy.megatons, distKm);
        const px = 35 + (i / points) * (w - 50);
        const py = Math.min(h - 15, Math.max(10, 10 + (1 - Math.min(1, psi / 25)) * (h - 25)));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.strokeStyle = '#64d2ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    drawThermalChart(res) {
      const c = document.getElementById('canvas-chart-thermal');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);

      // Thermal Radiation Pulse
      ctx.beginPath();
      ctx.moveTo(20, h - 15);
      for (let i = 0; i < w - 40; i++) {
        const x = 20 + i;
        const norm = i / (w - 40);
        const py = (h - 15) - Math.exp(-norm * 5) * Math.sin(norm * Math.PI) * (h - 30) * 2.8;
        ctx.lineTo(x, Math.max(10, py));
      }

      ctx.strokeStyle = '#ff44aa';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#8ca2b9';
      ctx.font = '8px "Space Grotesk", monospace';
      ctx.fillText('PULSE FLUX vs TIME', 25, 20);
    }

    drawSeismicWaveform(res) {
      const c = document.getElementById('canvas-chart-seismic');
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      const midY = h / 2;
      ctx.moveTo(10, midY);

      for (let x = 10; x < w - 10; x++) {
        const norm = (x - 10) / (w - 20);
        const env = Math.exp(-norm * 4);
        const osc = Math.sin(norm * 80) * 0.7 + Math.sin(norm * 140) * 0.3;
        const y = midY + osc * env * (midY - 8);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = '#33ccff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#8ca2b9';
      ctx.font = '8px "Space Grotesk", monospace';
      ctx.fillText('SYNTHETIC SEISMOGRAM (BROADBAND)', 15, 14);
    }
  }

  // Initialize and mount on window
  window.addEventListener('DOMContentLoaded', () => {
    window.astraCollisionApp = new AsteroidCollisionApp();
  });

  // Fallback in case DOMContentLoaded has already fired
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    if (!window.astraCollisionApp) {
      window.astraCollisionApp = new AsteroidCollisionApp();
    }
  }

})(window);
