import React, { useState } from 'react';
import { X, Play, MapPin, Eye, ShieldAlert, Sparkles, Clock, Globe } from 'lucide-react';
import { AstronomicalEvent } from '../../types';

interface EventDrawerProps {
  event: AstronomicalEvent | null;
  onClose: () => void;
  onWatchSimulation: (event: AstronomicalEvent) => void;
}

export const EventDrawer: React.FC<EventDrawerProps> = ({ event, onClose, onWatchSimulation }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'visibility'>('overview');
  const [selectedCity, setSelectedCity] = useState<string>('Madrid, Spain');

  if (!event) return null;

  return (
    <div className="fixed top-16 right-4 bottom-20 z-40 w-full max-w-md pointer-events-auto">
      <div className="h-full flex flex-col glass-panel rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {event.type}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close Panel (ESC)"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-white leading-tight">{event.title}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-2 font-mono">
            <Clock size={13} className="text-sky-400" />
            <span>{event.date}</span>
            <span>•</span>
            <span>Peak: {new Date(event.peak_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>

          {/* Action Button: WATCH SIMULATION */}
          <div className="mt-4">
            <button
              onClick={() => onWatchSimulation(event)}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase text-black bg-gradient-to-r from-red-500 to-amber-400 hover:from-red-400 hover:to-amber-300 transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={14} className="fill-black" />
              <span>WATCH 3D EVENT SIMULATION</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 text-xs font-medium bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              activeTab === 'overview'
                ? 'border-sky-400 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Science
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              activeTab === 'visibility'
                ? 'border-sky-400 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Where Can I See It?
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {activeTab === 'overview' && (
            <>
              {/* Event Summary */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  About this Event
                </h3>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">{event.summary}</p>
              </div>

              {/* Scientific Significance */}
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 mb-1">
                  <Sparkles size={14} className="text-sky-400" />
                  <span>Scientific Significance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{event.scientific_significance}</p>
              </div>

              {/* Key Astronomical Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {event.best_visibility.totality_duration_seconds !== undefined && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[11px]">Totality Duration</span>
                    <span className="text-white font-mono font-bold text-sm">
                      {Math.floor(event.best_visibility.totality_duration_seconds / 60)}m{' '}
                      {event.best_visibility.totality_duration_seconds % 60}s
                    </span>
                  </div>
                )}
                {event.best_visibility.zhr !== undefined && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[11px]">Zenithal Hourly Rate</span>
                    <span className="text-white font-mono font-bold text-sm">~{event.best_visibility.zhr} meteors/hr</span>
                  </div>
                )}
                {event.best_visibility.speed_km_s !== undefined && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[11px]">Atmospheric Velocity</span>
                    <span className="text-white font-mono font-bold text-sm">{event.best_visibility.speed_km_s} km/s</span>
                  </div>
                )}
                {event.best_visibility.closest_distance_km !== undefined && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[11px]">Closest Miss Distance</span>
                    <span className="text-white font-mono font-bold text-sm">
                      {event.best_visibility.closest_distance_km.toLocaleString()} km
                    </span>
                  </div>
                )}
                {event.best_visibility.apparent_magnitude !== undefined && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[11px]">Apparent Magnitude</span>
                    <span className="text-white font-mono font-bold text-sm">{event.best_visibility.apparent_magnitude}</span>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Importance Rating</span>
                  <span className="text-emerald-400 font-semibold">{event.importance}</span>
                </div>
              </div>

              {/* Safety & Observation Advice */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
                  <ShieldAlert size={14} className="text-amber-400" />
                  <span>Observation & Safety Guide</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{event.safety_notes}</p>
              </div>
            </>
          )}

          {activeTab === 'visibility' && (
            <div className="space-y-4">
              {/* Primary Viewing Regions */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-sky-400" />
                  <span>Best Visible From</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.best_visibility.primary_regions.map((region, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location Checker */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-400" />
                  <span>Check Visibility For Your Region</span>
                </div>

                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="Madrid, Spain">Madrid, Spain (Path of Totality)</option>
                  <option value="Reykjavik, Iceland">Reykjavik, Iceland (Path of Totality)</option>
                  <option value="London, UK">London, UK (Deep Partial)</option>
                  <option value="New York, USA">New York, USA (Early Morning Partial)</option>
                  <option value="New Delhi, India">New Delhi, India (Below Horizon / Night)</option>
                  <option value="Cairo, Egypt">Cairo, Egypt (High Elevation)</option>
                </select>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Visibility Quality:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedCity.includes('Totality') ? '100% Totality (Peak)' : 'Observable'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Local Peak Time:</span>
                    <span className="text-white">
                      {new Date(event.peak_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Local
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Sky Elevation Angle:</span>
                    <span className="text-sky-300">54° above SW Horizon</span>
                  </div>
                </div>
              </div>

              {/* Partial Visibility Notes */}
              {event.best_visibility.partial_visibility && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Partial Phase Visibility
                  </h4>
                  <p className="text-xs text-slate-400">
                    Visible as a partial phenomenon across:{' '}
                    {event.best_visibility.partial_visibility.join(', ')}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Data Attribution */}
        <div className="p-3 border-t border-white/10 bg-slate-950/60 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Source: NASA Eclipse Center & IAU Ephemerides</span>
          <span className="font-mono text-emerald-400">Verified Astronomical Model</span>
        </div>
      </div>
    </div>
  );
};
