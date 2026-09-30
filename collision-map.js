/**
 * ASTRA — ASTEROID COLLISION
 * 2D Scientific Earth Target Map & Impact Effect Map Renderer
 * 
 * Features:
 * - High-DPI Canvas vector projection (Equirectangular / Plate Carrée)
 * - Deep navy & restrained cyan aerospace aesthetic matching storyboard panels 5, 6, 9
 * - Full pan & zoom support (mouse drag, wheel zoom, touch drag/pinch)
 * - Live latitude/longitude calculation and tracking
 * - Precision aerospace targeting reticle & target lock
 * - Real-world geographic reverse-geocoding database
 * - Peer-reviewed concentric physics damage rings overlay (crater, blast, thermal, seismic)
 * - Live distance & environmental impact inspection probe
 */

(function (window) {
  'use strict';

  // Major global target presets & geographical reverse-lookup database
  const PRESET_LOCATIONS = [
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, region: 'Indian Subcontinent', type: 'coastal' },
    { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, region: 'South Asia', type: 'land' },
    { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946, region: 'South Asia', type: 'land' },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, region: 'East Asia', type: 'coastal' },
    { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278, region: 'Western Europe', type: 'land' },
    { name: 'New York City, USA', lat: 40.7128, lon: -74.0060, region: 'North America', type: 'coastal' },
    { name: 'Los Angeles, USA', lat: 34.0522, lon: -118.2437, region: 'North America', type: 'coastal' },
    { name: 'Paris, France', lat: 48.8566, lon: 2.3522, region: 'Western Europe', type: 'land' },
    { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357, region: 'North Africa', type: 'land' },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, region: 'Oceania', type: 'coastal' },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, region: 'Southeast Asia', type: 'coastal' },
    { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, region: 'Middle East', type: 'coastal' },
    { name: 'Sao Paulo, Brazil', lat: -23.5505, lon: -46.6333, region: 'South America', type: 'land' },
    { name: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241, region: 'Southern Africa', type: 'coastal' },
    { name: 'Moscow, Russia', lat: 55.7558, lon: 37.6173, region: 'Eastern Europe', type: 'land' },
    { name: 'Tunguska, Siberia', lat: 60.9167, lon: 101.9500, region: 'Central Siberia (Historical 1908 Site)', type: 'land' },
    { name: 'Chicxulub, Yucatan', lat: 21.4000, lon: -89.5167, region: 'Gulf of Mexico (K-Pg Crater Site)', type: 'coastal' },
    { name: 'Mid-Pacific Ocean', lat: 0.0000, lon: -160.0000, region: 'Deep Equatorial Pacific Ocean', type: 'water' },
    { name: 'North Atlantic Ocean', lat: 35.0000, lon: -40.0000, region: 'Mid-Atlantic Ocean Basin', type: 'water' },
    { name: 'Indian Ocean Basin', lat: -10.0000, lon: 80.0000, region: 'Central Indian Ocean', type: 'water' }
  ];

  /**
   * Simplified high-fidelity continental polygon coordinates (Equirectangular)
   * Polygons in [lon, lat] pairs
   */
  const CONTINENT_POLYGONS = [
    // Eurasia / Africa Main Supercontinent
    [
      [-10, 36], [-6, 36], [-8, 44], [-4, 43], [0, 49], [2, 51], [8, 54], [10, 58], [24, 71],
      [31, 70], [40, 68], [60, 70], [75, 73], [100, 76], [120, 74], [140, 72], [165, 68],
      [178, 65], [170, 60], [160, 55], [143, 50], [130, 42], [122, 38], [120, 32], [118, 22],
      [108, 14], [103, 10], [100, 2], [104, 1], [98, 8], [92, 16], [90, 22], [88, 22],
      [82, 17], [80, 13], [80, 9], [77, 8], [74, 15], [72, 19], [69, 23], [67, 25],
      [60, 25], [58, 24], [55, 25], [50, 28], [48, 30], [45, 28], [40, 20], [43, 12],
      [51, 12], [45, 12], [42, 15], [38, 24], [35, 28], [33, 31], [30, 31], [25, 32],
      [15, 32], [11, 37], [5, 36], [-2, 35], [-6, 36], [-10, 36]
    ],
    // Africa Mainland
    [
      [-17, 15], [-17, 21], [-12, 28], [-5, 36], [10, 37], [25, 32], [32, 31], [34, 27],
      [42, 13], [51, 10], [44, -2], [40, -10], [35, -20], [32, -28], [26, -34], [18, -34],
      [14, -23], [12, -15], [9, -5], [9, 4], [2, 6], [-5, 5], [-15, 11], [-17, 15]
    ],
    // Indian Subcontinent (High detail for master target match)
    [
      [68, 24], [70, 21], [72.8, 19.1], [73.5, 16.5], [75, 12], [77, 8.1], [78.2, 8.5],
      [79.8, 10], [80.3, 13], [82, 16], [84, 18.5], [87, 21.5], [89, 22], [90, 23],
      [88, 26], [85, 27], [80, 29], [74, 32], [72, 30], [68, 24]
    ],
    // North America
    [
      [-168, 65], [-160, 71], [-140, 70], [-120, 69], [-95, 73], [-80, 70], [-60, 60],
      [-55, 50], [-65, 44], [-75, 35], [-80, 25], [-81, 25], [-85, 30], [-90, 29],
      [-97, 26], [-97, 20], [-87, 15], [-80, 8], [-77, 8], [-83, 10], [-90, 14],
      [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-125, 50], [-135, 58], [-150, 60],
      [-160, 56], [-165, 60], [-168, 65]
    ],
    // South America
    [
      [-77, 8], [-72, 11], [-60, 8], [-50, 0], [-35, -5], [-35, -8], [-40, -22], [-45, -24],
      [-50, -30], [-55, -35], [-65, -45], [-68, -54], [-74, -52], [-74, -45], [-72, -35],
      [-70, -20], [-76, -14], [-80, -4], [-80, 2], [-77, 8]
    ],
    // Australia
    [
      [114, -22], [115, -34], [120, -35], [130, -32], [138, -35], [148, -38], [152, -28],
      [145, -15], [142, -11], [136, -12], [130, -13], [125, -15], [114, -22]
    ],
    // British Isles
    [
      [-5, 50], [-1, 51], [1, 53], [-1, 58], [-4, 58], [-5, 55], [-4, 52], [-5, 50]
    ],
    // Japan
    [
      [130, 32], [132, 34], [137, 35], [141, 38], [141, 43], [145, 44], [140, 40], [135, 35], [130, 32]
    ],
    // Madagascar
    [
      [44, -12], [50, -15], [47, -25], [44, -25], [44, -12]
    ],
    // Antarctica
    [
      [-180, -75], [-120, -74], [-60, -65], [0, -68], [60, -66], [120, -65], [180, -75],
      [180, -88], [-180, -88]
    ]
  ];

  class EarthTargetMap {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Object} options
     */
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.onTargetSelect = options.onTargetSelect || null;
      this.onHoverCoordinate = options.onHoverCoordinate || null;

      // Map Viewport Transformations
      this.zoom = 1.0;
      this.minZoom = 1.0;
      this.maxZoom = 35.0;
      this.panX = 0; // Lon offset (-180 to 180)
      this.panY = 0; // Lat offset (-90 to 90)

      // Target selection state
      this.selectedTarget = {
        name: 'Mumbai, India',
        lat: 19.0760,
        lon: 72.8777,
        region: 'Western Coast of India, Arabian Sea',
        type: 'coastal'
      };
      this.hoverTarget = null;
      this.isTargetConfirmed = false;

      // Impact effects state (Panel 9)
      this.impactMode = false;
      this.simulationResults = null;
      this.probeData = null;

      // Mouse drag state
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.dragStartPanX = 0;
      this.dragStartPanY = 0;

      // Animation frame
      this.animTime = 0;
      this.animId = null;

      this.initEvents();
      this.resize();
    }

    resize() {
      const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : null;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = (rect && rect.width > 50) ? rect.width : window.innerWidth;
      this.height = (rect && rect.height > 50) ? rect.height : window.innerHeight;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.render();
    }

    startAnimation() {
      this.resize();
      if (this.animId) return;
      const loop = () => {
        this.animTime += 0.03;
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stopAnimation() {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    initEvents() {
      const c = this.canvas;

      // Direct Canvas Click for instant target selection
      c.addEventListener('click', (e) => {
        const rect = c.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this.handleClickAt(mouseX, mouseY);
      });

      // Mouse Move (Live lat/lon tracking)
      c.addEventListener('mousemove', (e) => {
        const rect = c.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.isDragging) {
          const dx = mouseX - this.dragStartX;
          const dy = mouseY - this.dragStartY;
          // Pan in degrees
          const dLon = (dx / (this.width * this.zoom)) * 360;
          const dLat = (dy / (this.height * this.zoom)) * 180;
          this.panX = this.dragStartPanX - dLon;
          this.panY = Math.max(-80, Math.min(80, this.dragStartPanY + dLat));
          this.clampPan();
          this.render();
          return;
        }

        // Live coordinate calculation
        const geo = this.screenToGeo(mouseX, mouseY);
        if (isNaN(geo.lat) || isNaN(geo.lon)) return;
        this.hoverTarget = geo;

        // In impact mode, compute probe damage telemetry
        if (this.impactMode && this.simulationResults) {
          const distKm = this.getHaversineDistance(
            this.selectedTarget.lat, this.selectedTarget.lon,
            geo.lat, geo.lon
          );
          if (window.ImpactPhysics) {
            this.probeData = window.ImpactPhysics.getEffectsAtDistance(this.simulationResults, distKm);
            this.probeData.lat = geo.lat;
            this.probeData.lon = geo.lon;
            this.probeData.nearestCity = this.findNearestLocation(geo.lat, geo.lon);
          }
        }

        if (this.onHoverCoordinate) {
          this.onHoverCoordinate(geo, this.probeData);
        }
      });

      // Mouse Down
      c.addEventListener('mousedown', (e) => {
        const rect = c.getBoundingClientRect();
        this.isDragging = true;
        this.dragStartX = e.clientX - rect.left;
        this.dragStartY = e.clientY - rect.top;
        this.dragStartPanX = this.panX;
        this.dragStartPanY = this.panY;
      });

      // Mouse Up
      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      // Mouse Wheel Zoom
      c.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = c.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom relative to cursor point
        const preGeo = this.screenToGeo(mouseX, mouseY);
        if (isNaN(preGeo.lat) || isNaN(preGeo.lon)) return;
        const zoomFactor = e.deltaY < 0 ? 1.25 : 0.8;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));

        if (newZoom !== this.zoom) {
          this.zoom = newZoom;
          // Adjust pan so preGeo stays under cursor
          this.panX = preGeo.lon - ((mouseX / this.width - 0.5) * 360 / this.zoom);
          this.panY = preGeo.lat + ((mouseY / this.height - 0.5) * 180 / this.zoom);
          this.clampPan();
          this.render();
        }
      }, { passive: false });

      // Touch events for mobile/tablet
      let touchStartDist = 0;
      c.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          const rect = c.getBoundingClientRect();
          this.isDragging = true;
          this.dragStartX = t.clientX - rect.left;
          this.dragStartY = t.clientY - rect.top;
          this.dragStartPanX = this.panX;
          this.dragStartPanY = this.panY;
        } else if (e.touches.length === 2) {
          touchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      c.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this.isDragging) {
          const t = e.touches[0];
          const rect = c.getBoundingClientRect();
          const mouseX = t.clientX - rect.left;
          const mouseY = t.clientY - rect.top;
          const dx = mouseX - this.dragStartX;
          const dy = mouseY - this.dragStartY;
          const dLon = (dx / (this.width * this.zoom)) * 360;
          const dLat = (dy / (this.height * this.zoom)) * 180;
          this.panX = this.dragStartPanX - dLon;
          this.panY = Math.max(-80, Math.min(80, this.dragStartPanY + dLat));
          this.clampPan();
          this.render();
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (touchStartDist > 0) {
            const factor = dist / touchStartDist;
            this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
            touchStartDist = dist;
            this.clampPan();
            this.render();
          }
        }
      }, { passive: true });

      c.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
          this.isDragging = false;
        }
      }, { passive: true });
    }

    clampPan() {
      // Keep pan bounded
      if (this.zoom <= 1.0) {
        this.panX = 0;
        this.panY = 0;
      } else {
        const maxPanX = 180 * (1 - 1 / this.zoom);
        const maxPanY = 80 * (1 - 1 / this.zoom);
        this.panX = Math.max(-maxPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
      }
    }

    handleClickAt(x, y) {
      if (this.impactMode) return; // Read-only probe mode during results
      const geo = this.screenToGeo(x, y);
      if (isNaN(geo.lat) || isNaN(geo.lon)) return;
      const nearest = this.findNearestLocation(geo.lat, geo.lon);

      this.selectedTarget = {
        name: nearest.distKm < 300 ? nearest.name : `Target Site (${this.formatCoord(geo.lat, 'lat')}, ${this.formatCoord(geo.lon, 'lon')})`,
        lat: geo.lat,
        lon: geo.lon,
        region: nearest.region,
        type: nearest.distKm < 150 ? nearest.type : (Math.abs(geo.lat) < 60 ? 'water' : 'land')
      };

      // Zoom towards selected target (Panel 6)
      this.zoom = 5.0;
      this.panX = geo.lon;
      this.panY = geo.lat;
      this.clampPan();

      if (this.onTargetSelect) {
        this.onTargetSelect(this.selectedTarget);
      }
      this.render();
    }

    setTarget(targetObj, zoomInto = false) {
      this.selectedTarget = targetObj;
      if (zoomInto) {
        this.zoom = 5.5;
        this.panX = targetObj.lon;
        this.panY = targetObj.lat;
        this.clampPan();
      }
      this.render();
    }

    zoomToTarget(animated = true) {
      this.zoom = 6.0;
      this.panX = this.selectedTarget.lon;
      this.panY = this.selectedTarget.lat;
      this.clampPan();
      this.render();
    }

    resetView() {
      this.zoom = 1.0;
      this.panX = 0;
      this.panY = 0;
      this.render();
    }

    enableImpactMode(results) {
      this.impactMode = true;
      this.simulationResults = results;
      // Focus in on impact site at tactical scale (Panel 9 match)
      this.zoom = 8.5;
      this.panX = this.selectedTarget.lon;
      this.panY = this.selectedTarget.lat;
      this.clampPan();
      this.render();
    }

    disableImpactMode() {
      this.impactMode = false;
      this.simulationResults = null;
      this.probeData = null;
      this.render();
    }

    /**
     * Map Projection: Equirectangular [lon, lat] -> [pixelX, pixelY]
     */
    geoToScreen(lon, lat) {
      // Normalize with pan and zoom
      const mapWidth = this.width * this.zoom;
      const mapHeight = this.height * this.zoom;
      const centerX = this.width / 2.0 - (this.panX / 360.0) * mapWidth;
      const centerY = this.height / 2.0 + (this.panY / 180.0) * mapHeight;

      const px = centerX + (lon / 360.0) * mapWidth;
      const py = centerY - (lat / 180.0) * mapHeight;
      return { x: px, y: py };
    }

    /**
     * Inverse Projection: [pixelX, pixelY] -> [lon, lat]
     */
    screenToGeo(x, y) {
      const mapWidth = this.width * this.zoom;
      const mapHeight = this.height * this.zoom;
      const centerX = this.width / 2.0 - (this.panX / 360.0) * mapWidth;
      const centerY = this.height / 2.0 + (this.panY / 180.0) * mapHeight;

      const lon = ((x - centerX) / mapWidth) * 360.0;
      const lat = ((centerY - y) / mapHeight) * 180.0;

      return {
        lat: Math.max(-90, Math.min(90, Number(lat.toFixed(4)))),
        lon: Number((((lon + 180) % 360 + 360) % 360 - 180).toFixed(4))
      };
    }

    findNearestLocation(lat, lon) {
      let closest = PRESET_LOCATIONS[0];
      let minDist = Infinity;

      for (const loc of PRESET_LOCATIONS) {
        const d = this.getHaversineDistance(lat, lon, loc.lat, loc.lon);
        if (d < minDist) {
          minDist = d;
          closest = loc;
        }
      }

      return {
        ...closest,
        distKm: minDist
      };
    }

    getHaversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371.0; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    formatCoord(val, type) {
      const absVal = Math.abs(val).toFixed(4);
      if (type === 'lat') return `${absVal}° ${val >= 0 ? 'N' : 'S'}`;
      return `${absVal}° ${val >= 0 ? 'E' : 'W'}`;
    }

    /**
     * Main Render Loop
     */
    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // 1. Deep Space/Ocean Background
      ctx.fillStyle = '#020712';
      ctx.fillRect(0, 0, w, h);

      // Subtle radial vignette
      const bgGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, Math.max(w, h)*0.75);
      bgGrad.addColorStop(0, 'rgba(8, 22, 42, 0.4)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 14, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Latitude & Longitude Coordinate Grid
      this.drawCoordinateGrid();

      // 3. Continents & Coastlines
      this.drawContinents();

      // 4. Urban / Regional Road Networks at high zoom
      if (this.zoom > 4.0) {
        this.drawTacticalUrbanDetails();
      }

      // 5. Preset City Markers
      this.drawPresetCities();

      // 6. Impact Damage Rings (Panel 9) OR Targeting Reticle (Panel 5/6)
      if (this.impactMode && this.simulationResults) {
        this.drawImpactEffectZones();
      } else {
        this.drawTargetingReticle();
      }

      // 7. Tactical Frame & Degree Scale Borders
      this.drawTacticalMapBorders();
    }

    drawCoordinateGrid() {
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = 'rgba(70, 160, 220, 0.12)';
      ctx.lineWidth = 1;
      ctx.font = '9px "Space Grotesk", monospace';
      ctx.fillStyle = 'rgba(100, 180, 230, 0.45)';

      // Longitude lines every 30 deg (or 10 deg at high zoom)
      const lonStep = this.zoom > 5.0 ? 5 : (this.zoom > 2.5 ? 15 : 30);
      for (let lon = -180; lon <= 180; lon += lonStep) {
        const top = this.geoToScreen(lon, 85);
        const btm = this.geoToScreen(lon, -85);
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(btm.x, btm.y);
        ctx.stroke();

        // Degree label along equator
        const eq = this.geoToScreen(lon, 0);
        if (eq.x >= 20 && eq.x <= this.width - 20) {
          ctx.fillText(lon === 0 ? '0°' : (lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`), eq.x + 3, eq.y - 4);
        }
      }

      // Latitude lines every 15 deg (or 5 deg at high zoom)
      const latStep = this.zoom > 5.0 ? 5 : (this.zoom > 2.5 ? 10 : 15);
      for (let lat = -75; lat <= 75; lat += latStep) {
        const left = this.geoToScreen(-180, lat);
        const right = this.geoToScreen(180, lat);
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();

        // Degree label along prime meridian
        const pm = this.geoToScreen(0, lat);
        if (pm.y >= 20 && pm.y <= this.height - 20) {
          ctx.fillText(lat === 0 ? 'EQUATOR' : (lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`), pm.x + 4, pm.y - 3);
        }
      }

      ctx.restore();
    }

    drawContinents() {
      const ctx = this.ctx;
      ctx.save();

      // Land Fill: Deep aerospace navy/slate
      ctx.fillStyle = 'rgba(11, 28, 48, 0.65)';
      // Coastline Stroke: Crisp cyan wireframe
      ctx.strokeStyle = '#3ca5d8';
      ctx.lineWidth = Math.min(2.0, 1.0 + (this.zoom - 1) * 0.15);
      ctx.shadowColor = 'rgba(60, 165, 216, 0.4)';
      ctx.shadowBlur = 4;

      for (const poly of CONTINENT_POLYGONS) {
        if (poly.length < 3) continue;
        ctx.beginPath();
        const p0 = this.geoToScreen(poly[0][0], poly[0][1]);
        ctx.moveTo(p0.x, p0.y);

        for (let i = 1; i < poly.length; i++) {
          const pt = this.geoToScreen(poly[i][0], poly[i][1]);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // If user selected India or coastal city, highlight regional territory
      if (this.selectedTarget && this.selectedTarget.region.includes('India')) {
        const indiaPoly = CONTINENT_POLYGONS[2];
        ctx.beginPath();
        const p0 = this.geoToScreen(indiaPoly[0][0], indiaPoly[0][1]);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < indiaPoly.length; i++) {
          const pt = this.geoToScreen(indiaPoly[i][0], indiaPoly[i][1]);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(60, 180, 240, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#64d2ff';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      ctx.restore();
    }

    drawTacticalUrbanDetails() {
      const ctx = this.ctx;
      const t = this.selectedTarget;
      if (!t) return;

      const center = this.geoToScreen(t.lon, t.lat);
      ctx.save();
      ctx.strokeStyle = 'rgba(80, 190, 240, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);

      // Simulated local road grid / coastal topology lines matching Storyboard Panel 6
      const rad = 140 * (this.zoom / 5.0);
      for (let r = 25; r < rad; r += 30) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radial transit lines
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + Math.cos(a) * rad, center.y + Math.sin(a) * rad);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawPresetCities() {
      const ctx = this.ctx;
      ctx.save();
      ctx.font = '9.5px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(160, 215, 255, 0.85)';

      for (const loc of PRESET_LOCATIONS) {
        const pt = this.geoToScreen(loc.lon, loc.lat);
        // Only draw if within viewport
        if (pt.x < -20 || pt.x > this.width + 20 || pt.y < -20 || pt.y > this.height + 20) continue;

        const isSelected = this.selectedTarget && Math.abs(this.selectedTarget.lat - loc.lat) < 0.01;

        ctx.fillStyle = isSelected ? '#64d2ff' : 'rgba(100, 190, 240, 0.6)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        // City Name label at moderate/high zoom or if selected
        if (this.zoom > 2.0 || isSelected) {
          ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(160, 215, 255, 0.75)';
          ctx.fillText(loc.name.split(',')[0].toUpperCase(), pt.x + 6, pt.y + 3);
        }
      }

      ctx.restore();
    }

    drawTargetingReticle() {
      const ctx = this.ctx;
      const t = this.selectedTarget;
      if (!t) return;

      const pt = this.geoToScreen(t.lon, t.lat);
      ctx.save();

      // Precision Reticle Outer Ring
      const pulse = Math.sin(this.animTime * 3) * 3;
      const reticleRadius = 36 + pulse;

      ctx.strokeStyle = '#64d2ff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(100, 210, 255, 0.7)';
      ctx.shadowBlur = 10;

      // Outer dashed circle
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner target circle
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Center crosshair tick lines
      const arm = 50;
      ctx.beginPath();
      // Top
      ctx.moveTo(pt.x, pt.y - 12);
      ctx.lineTo(pt.x, pt.y - arm);
      // Bottom
      ctx.moveTo(pt.x, pt.y + 12);
      ctx.lineTo(pt.x, pt.y + arm);
      // Left
      ctx.moveTo(pt.x - 12, pt.y);
      ctx.lineTo(pt.x - arm, pt.y);
      // Right
      ctx.moveTo(pt.x + 12, pt.y);
      ctx.lineTo(pt.x + arm, pt.y);
      ctx.stroke();

      // Aerospace Corner Brackets (Panel 6)
      const bSize = 65;
      const bLen = 14;
      ctx.strokeStyle = 'rgba(100, 210, 255, 0.85)';
      ctx.lineWidth = 2.0;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(pt.x - bSize, pt.y - bSize + bLen);
      ctx.lineTo(pt.x - bSize, pt.y - bSize);
      ctx.lineTo(pt.x - bSize + bLen, pt.y - bSize);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(pt.x + bSize, pt.y - bSize + bLen);
      ctx.lineTo(pt.x + bSize, pt.y - bSize);
      ctx.lineTo(pt.x + bSize - bLen, pt.y - bSize);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(pt.x - bSize, pt.y + bSize - bLen);
      ctx.lineTo(pt.x - bSize, pt.y + bSize);
      ctx.lineTo(pt.x - bSize + bLen, pt.y + bSize);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(pt.x + bSize, pt.y + bSize - bLen);
      ctx.lineTo(pt.x + bSize, pt.y + bSize);
      ctx.lineTo(pt.x + bSize - bLen, pt.y + bSize);
      ctx.stroke();

      // Target Label HUD Badge
      ctx.font = '11px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`TARGET: ${t.name.toUpperCase()}`, pt.x + bSize + 8, pt.y - 12);

      ctx.font = '10px "Inter", monospace';
      ctx.fillStyle = '#64d2ff';
      ctx.fillText(`${this.formatCoord(t.lat, 'lat')}  ${this.formatCoord(t.lon, 'lon')}`, pt.x + bSize + 8, pt.y + 4);

      ctx.fillStyle = 'rgba(140, 180, 210, 0.8)';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText(`ZONE: ${t.region.toUpperCase()}`, pt.x + bSize + 8, pt.y + 18);

      ctx.restore();
    }

    /**
     * Draw Scientifically Generated Impact Effect Zones (Panel 9)
     * Exact scaled damage rings for Crater, Blast, Thermal, Seismic
     */
    drawImpactEffectZones() {
      const ctx = this.ctx;
      const res = this.simulationResults;
      const t = this.selectedTarget;
      if (!res || !t) return;

      const center = this.geoToScreen(t.lon, t.lat);
      const kmToPixels = (this.width * this.zoom) / (40075.0 * Math.cos(t.lat * Math.PI / 180));

      ctx.save();

      // Concentric Rings Data
      const rings = [
        {
          name: 'CRATER ZONE',
          radiusKm: Math.max(0.5, res.crater.finalDiameterKm / 2.0),
          color: '#ff3344',
          fill: 'rgba(255, 51, 68, 0.35)',
          dash: []
        },
        {
          name: 'SHOCKWAVE OVERPRESSURE (20 PSI)',
          radiusKm: res.blast.radius20psiKm,
          color: '#ff6633',
          fill: 'rgba(255, 102, 51, 0.15)',
          dash: [6, 4]
        },
        {
          name: 'SHOCKWAVE OVERPRESSURE (5 PSI)',
          radiusKm: res.blast.radius5psiKm,
          color: '#ffaa33',
          fill: 'rgba(255, 170, 51, 0.10)',
          dash: [8, 5]
        },
        {
          name: 'SHOCKWAVE OVERPRESSURE (1 PSI)',
          radiusKm: res.blast.radius1psiKm,
          color: '#ffd033',
          fill: 'rgba(255, 208, 51, 0.05)',
          dash: [10, 6]
        },
        {
          name: 'THERMAL RADIATION (3RD DEGREE BURNS)',
          radiusKm: res.thermal.radius3rdBurnM / 1000.0,
          color: '#ff44aa',
          fill: 'rgba(255, 68, 170, 0.06)',
          dash: [4, 6]
        },
        {
          name: 'SEISMIC GROUND MOTION (FELT)',
          radiusKm: Math.min(1500, res.seismic.feltRadiusKm),
          color: '#33ccff',
          fill: 'rgba(51, 204, 255, 0.03)',
          dash: [12, 8]
        }
      ];

      // Draw each ring in reverse order (largest outermost first)
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        if (ring.radiusKm <= 0.05) continue;
        const pxRadius = ring.radiusKm * kmToPixels;

        // Fill
        ctx.fillStyle = ring.fill;
        ctx.beginPath();
        ctx.arc(center.x, center.y, pxRadius, 0, Math.PI * 2);
        ctx.fill();

        // Stroke
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash(ring.dash);
        ctx.beginPath();
        ctx.arc(center.x, center.y, pxRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Scientific Zone Legend Label (matching Storyboard Panel 9)
        if (pxRadius > 35 && pxRadius < Math.max(this.width, this.height)) {
          ctx.setLineDash([]);
          ctx.font = '9px "Space Grotesk", sans-serif';
          ctx.fillStyle = ring.color;
          const labelAngle = -Math.PI / 4 - (i * 0.18);
          const lx = center.x + Math.cos(labelAngle) * pxRadius;
          const ly = center.y + Math.sin(labelAngle) * pxRadius;

          // Callout line
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + 20, ly - 10);
          ctx.lineTo(lx + 110, ly - 10);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillText(`${ring.name} (${ring.radiusKm.toFixed(1)} km)`, lx + 24, ly - 14);
        }
      }

      // Ground Zero Epicenter Marker
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff2244';
      ctx.beginPath();
      ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '11px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`GROUND ZERO: ${t.name.toUpperCase()}`, center.x + 12, center.y - 4);

      // Probe Inspection Crosshair if user is hovering
      if (this.probeData && this.hoverTarget) {
        const hoverPt = this.geoToScreen(this.hoverTarget.lon, this.hoverTarget.lat);
        this.drawProbeTooltip(hoverPt, this.probeData);
      }

      ctx.restore();
    }

    drawProbeTooltip(pt, probe) {
      const ctx = this.ctx;
      ctx.save();

      // Probe Crosshair
      ctx.strokeStyle = '#00e699';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.moveTo(pt.x - 16, pt.y);
      ctx.lineTo(pt.x + 16, pt.y);
      ctx.moveTo(pt.x, pt.y - 16);
      ctx.lineTo(pt.x, pt.y + 16);
      ctx.stroke();

      // Tooltip Card
      const cardW = 220;
      const cardH = 110;
      const cardX = Math.min(this.width - cardW - 15, Math.max(15, pt.x + 16));
      const cardY = Math.min(this.height - cardH - 15, Math.max(15, pt.y - cardH / 2));

      ctx.fillStyle = 'rgba(6, 14, 26, 0.92)';
      ctx.strokeStyle = 'rgba(0, 230, 153, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00e699';
      ctx.font = '10px "Space Grotesk", sans-serif';
      ctx.fillText(`IMPACT PROBE: ${probe.distanceKm.toFixed(1)} km FROM EPICENTER`, cardX + 10, cardY + 18);

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText(`Overpressure: ${probe.overpressurePsi} psi (${probe.overpressureKPa} kPa)`, cardX + 10, cardY + 36);
      ctx.fillText(`Airblast Arrival: T+${probe.blastArrivalSec}s (Wind: ${probe.windSpeedKmh} km/h)`, cardX + 10, cardY + 52);
      ctx.fillText(`Thermal: ${probe.thermalFluenceKJm2} kJ/m² (${probe.thermalEffectDesc.slice(0, 26)}...)`, cardX + 10, cardY + 68);
      ctx.fillText(`Seismic: MMI ${probe.mmi} (M${probe.effectiveMagnitude}) - Arr: T+${probe.seismicArrivalSec}s`, cardX + 10, cardY + 84);

      ctx.fillStyle = '#8ca2b9';
      ctx.font = '8px "Inter", sans-serif';
      ctx.fillText(`STATUS: ${probe.status}`, cardX + 10, cardY + 100);

      ctx.restore();
    }

    drawTacticalMapBorders() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 210, 255, 0.25)';
      ctx.lineWidth = 1;

      // Coordinate Edge Ticks along top and bottom
      const tickStep = 40;
      for (let x = 0; x < w; x += tickStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 6);
        ctx.moveTo(x, h);
        ctx.lineTo(x, h - 6);
        ctx.stroke();
      }

      for (let y = 0; y < h; y += tickStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(6, y);
        ctx.moveTo(w, y);
        ctx.lineTo(w - 6, y);
        ctx.stroke();
      }

      // Compass Rose in top-right
      const cx = w - 40;
      const cy = 40;
      ctx.strokeStyle = 'rgba(100, 210, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#64d2ff';
      ctx.font = '10px "Space Grotesk", sans-serif';
      ctx.fillText('N', cx - 3.5, cy - 6);

      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx - 3, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.closePath();
      ctx.fill();

      // Zoom Scale Indicator
      ctx.fillStyle = 'rgba(140, 180, 210, 0.7)';
      ctx.font = '9px "Space Grotesk", monospace';
      ctx.fillText(`MAP SCALE: ${this.zoom.toFixed(1)}X  |  PLATE CARRÉE SCIENTIFIC PROJECTION`, 20, h - 14);

      ctx.restore();
    }
  }

  window.EarthTargetMap = EarthTargetMap;
  window.ASTRA_PRESET_LOCATIONS = PRESET_LOCATIONS;

})(window);
