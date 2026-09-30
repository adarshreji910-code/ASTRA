import React, { useState } from 'react';
import { X, Calendar, Play, Filter, Sparkles, Clock, Globe } from 'lucide-react';
import { AstronomicalEvent } from '../../types';

interface UpcomingEventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: AstronomicalEvent[];
  onSelectEvent: (event: AstronomicalEvent) => void;
  onWatchSimulation: (event: AstronomicalEvent) => void;
}

export const UpcomingEventsListModal: React.FC<UpcomingEventsListModalProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
  onWatchSimulation,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEvents = events.filter((e) => {
    if (selectedFilter === 'all') return true;
    return e.category === selectedFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 pointer-events-auto">
      <div className="w-full max-w-4xl max-h-[85vh] glass-panel rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">UPCOMING ASTRONOMICAL EVENTS</h2>
              <p className="text-xs text-slate-400">
                Scientifically calculated celestial alignments, eclipses, meteor showers, and close approaches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-white/10 flex flex-wrap gap-2 text-xs">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'eclipse', label: 'Eclipses' },
            { id: 'meteors', label: 'Meteor Showers' },
            { id: 'planets', label: 'Planets & Oppositions' },
            { id: 'asteroids', label: 'Near-Earth Asteroids' },
            { id: 'solar', label: 'Solar Activity' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                selectedFilter === cat.id
                  ? 'bg-red-500 text-white font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="glass-panel p-4 rounded-xl border border-white/10 hover:border-red-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    {ev.type}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">{ev.importance}</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-red-300 transition">
                  {ev.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>📅 {ev.date}</span>
                  <span>•</span>
                  <span>Peak: {new Date(ev.peak_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                  <span>•</span>
                  <span>Best: {ev.best_visibility.primary_regions[0]}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1 max-w-2xl">{ev.summary}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onSelectEvent(ev);
                    onClose();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  Inspect in 3D
                </button>
                <button
                  onClick={() => {
                    onWatchSimulation(ev);
                    onClose();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-400 text-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play size={13} className="fill-black" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
