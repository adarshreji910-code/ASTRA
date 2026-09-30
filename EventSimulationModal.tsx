import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, FastForward, Info, Eye } from 'lucide-react';
import { AstronomicalEvent } from '../../types';

interface EventSimulationModalProps {
  event: AstronomicalEvent | null;
  onClose: () => void;
}

export const EventSimulationModal: React.FC<EventSimulationModalProps> = ({ event, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0.0); // 0.0 to 1.0
  const [speed, setSpeed] = useState<number>(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation ticker
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000.0;
      lastTime = now;

      if (isPlaying) {
        setProgress((prev) => {
          const next = prev + dt * 0.12 * speed;
          return next > 1.0 ? 0.0 : next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  // Render Canvas Simulation based on event type
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !event) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Deep space backdrop with stars
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Draw background starfield
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 243.1) % height);
      ctx.fillRect(sx, sy, (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
    }

    const simType = event.simulation_type;

    // 1. SOLAR ECLIPSE SIMULATION (Sun -> Moon -> Earth shadow projection)
    if (simType === 'solar_eclipse') {
      const sunX = 140;
      const sunY = height / 2;
      const sunR = 60;

      // Sun
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunR + 30);
      sunGrad.addColorStop(0, '#fff4cc');
      sunGrad.addColorStop(0.3, '#ffcc00');
      sunGrad.addColorStop(0.7, '#ff8800');
      sunGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR + 30, 0, Math.PI * 2);
      ctx.fill();

      // Earth
      const earthX = width - 180;
      const earthY = height / 2;
      const earthR = 40;
      const earthGrad = ctx.createRadialGradient(earthX - 10, earthY - 10, 5, earthX, earthY, earthR);
      earthGrad.addColorStop(0, '#60a5fa');
      earthGrad.addColorStop(0.7, '#1e3a8a');
      earthGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Moon moving in orbit across line of sight
      // Progress from 0 to 1 moves moon vertically / across Earth-Sun axis
      const moonOrbitX = (sunX + earthX) / 2 + 70;
      const moonY = height / 2 - 80 + progress * 160;
      const moonR = 14;

      // Draw Umbra & Penumbra Shadow Cones from Sun through Moon to Earth
      const moonOffset = Math.abs(moonY - height / 2);
      if (moonOffset < 50) {
        // Penumbra shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.moveTo(moonOrbitX, moonY - moonR);
        ctx.lineTo(earthX, earthY - earthR * 0.9);
        ctx.lineTo(earthX, earthY + earthR * 0.9);
        ctx.lineTo(moonOrbitX, moonY + moonR);
        ctx.closePath();
        ctx.fill();

        // Dark Umbra core
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.moveTo(moonOrbitX, moonY - moonR * 0.5);
        ctx.lineTo(earthX, earthY - 6);
        ctx.lineTo(earthX, earthY + 6);
        ctx.lineTo(moonOrbitX, moonY + moonR * 0.5);
        ctx.closePath();
        ctx.fill();
      }

      // Moon body
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(moonOrbitX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Observer Viewport Inset (Top Right)
      const insetX = width - 170;
      const insetY = 30;
      const insetW = 140;
      const insetH = 140;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(insetX, insetY, insetW, insetH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(insetX, insetY, insetW, insetH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText("OBSERVER'S SKY VIEW", insetX + 10, insetY + 16);

      // Inset Sun
      const inCenterX = insetX + insetW / 2;
      const inCenterY = insetY + insetH / 2 + 8;
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(inCenterX, inCenterY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Inset transiting Moon
      const inMoonX = inCenterX - 45 + progress * 90;
      ctx.fillStyle = '#05070d';
      ctx.beginPath();
      ctx.arc(inMoonX, inCenterY, 32.5, 0, Math.PI * 2);
      ctx.fill();

      // Corona effect during 100% totality (near progress 0.5)
      const distFromTotality = Math.abs(progress - 0.5);
      if (distFromTotality < 0.08) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(inCenterX, inCenterY, 33, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('TOTALITY!', insetX + 42, insetY + insetH - 10);
      }
    }

    // 2. LUNAR ECLIPSE SIMULATION (Sun -> Earth -> Moon in shadow)
    else if (simType === 'lunar_eclipse') {
      const sunX = 120;
      const sunY = height / 2;
      const earthX = width / 2 - 20;
      const earthY = height / 2;
      const earthR = 36;

      // Sun
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Earth
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Earth Umbra Shadow cone extending to the right
      const shadowLength = 320;
      ctx.fillStyle = 'rgba(127, 29, 29, 0.35)'; // Reddish umbra from Rayleigh scattering
      ctx.beginPath();
      ctx.moveTo(earthX, earthY - earthR);
      ctx.lineTo(earthX + shadowLength, earthY - 14);
      ctx.lineTo(earthX + shadowLength, earthY + 14);
      ctx.lineTo(earthX, earthY + earthR);
      ctx.closePath();
      ctx.fill();

      // Moon moving through Earth's shadow
      const moonX = earthX + 160;
      const moonY = height / 2 - 70 + progress * 140;
      const moonR = 12;

      // Inside umbra = Blood Red!
      const inUmbra = Math.abs(moonY - height / 2) < 20;
      ctx.fillStyle = inUmbra ? '#b91c1c' : '#cbd5e1';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      if (inUmbra) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('BLOOD MOON (TOTALITY)', moonX + 20, moonY + 4);
      }
    }

    // 3. METEOR SHOWER SIMULATION
    else if (simType === 'meteor_shower') {
      const earthX = width / 2;
      const earthY = height - 100;
      const earthR = 90;

      // Earth curved atmosphere horizon
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Shooting meteors radiating downwards
      const radiantX = width / 2;
      const radiantY = 60;

      for (let i = 0; i < 9; i++) {
        const streakProg = ((progress * 3.0 + i * 0.35) % 1.0);
        const angle = -Math.PI / 2 + (i - 4) * 0.28;
        const distStart = 60 + streakProg * 240;
        const distEnd = distStart + 45;

        const x1 = radiantX + Math.cos(angle) * distStart;
        const y1 = radiantY + Math.sin(angle) * distStart;
        const x2 = radiantX + Math.cos(angle) * distEnd;
        const y2 = radiantY + Math.sin(angle) * distEnd;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.7, '#38bdf8');
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px sans-serif';
      ctx.fillText('RADIANT POINT', radiantX - 45, radiantY - 10);
    }

    // 4. ASTEROID CLOSE APPROACH SIMULATION
    else if (simType === 'asteroid_approach') {
      const earthX = width / 2;
      const earthY = height / 2;
      const earthR = 35;

      // Geostationary satellite ring (36,000 km)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(earthX, earthY, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.font = '10px monospace';
      ctx.fillText('GEOSTATIONARY ORBIT (36,000 km)', earthX + 95, earthY - 10);

      // Earth
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Hyperbolic asteroid trajectory passing inside GEO ring
      const t = (progress - 0.5) * 4.0;
      const astX = earthX + t * 90;
      const astY = earthY + 70 + t * t * 18;

      // Trail
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = -2.0; s <= 2.0; s += 0.1) {
        const tx = earthX + s * 90;
        const ty = earthY + 70 + s * s * 18;
        if (s === -2.0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();

      // Asteroid
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(astX, astY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText('ASTEROID 99942 APOPHIS', astX + 10, astY - 6);
    }

    // 5. SOLAR FLARE / CME
    else {
      const sunX = 140;
      const sunY = height / 2;
      const sunR = 80;

      // Sun body
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Erupting magnetic loop and CME plasma bubble expanding toward Earth
      const cmeProg = progress;
      const cmeX = sunX + sunR + cmeProg * (width - sunX - 160);
      const cmeR = 25 + cmeProg * 65;

      const cmeGrad = ctx.createRadialGradient(cmeX, sunY, 5, cmeX, sunY, cmeR);
      cmeGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      cmeGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
      cmeGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = cmeGrad;
      ctx.beginPath();
      ctx.arc(cmeX, sunY, cmeR, 0, Math.PI * 2);
      ctx.fill();

      // Earth at far right
      const earthX = width - 100;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(earthX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fcd34d';
      ctx.font = '11px sans-serif';
      ctx.fillText('CORONAL MASS EJECTION (CME)', cmeX - 50, sunY - cmeR - 10);
    }
  }, [event, progress]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/20 overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                Interactive Simulation
              </span>
              <span className="text-xs text-slate-400 font-mono">Precision Geometry Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{event.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2D/3D Canvas Viewport */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Interactive Playback Controls */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-black" />}
            </button>

            <button
              onClick={() => setProgress(0)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title="Reset Timeline"
            >
              <RotateCcw size={16} />
            </button>

            {/* Scrub Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={(e) => {
                setProgress(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 accent-sky-400 cursor-pointer h-1.5 rounded-lg bg-slate-800"
            />

            <span className="text-xs font-mono text-slate-300 min-w-[45px]">
              {Math.round(progress * 100)}%
            </span>

            {/* Speed Toggle */}
            <button
              onClick={() => setSpeed(speed === 1.0 ? 2.0 : (speed === 2.0 ? 0.5 : 1.0))}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-sky-400 border border-white/10"
            >
              {speed}x
            </button>
          </div>

          {/* Educational Stage Annotation */}
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2 text-xs text-slate-300">
            <Info size={14} className="text-sky-400 shrink-0" />
            <span>
              {progress < 0.3
                ? 'Phase 1: Ingress alignment — astronomical body begins transit across line of sight.'
                : progress < 0.7
                ? 'Phase 2: Totality / Maximum contact — direct shadow immersion & maximum scientific visibility.'
                : 'Phase 3: Egress — body completes traversal and orbital separation restores full illumination.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
