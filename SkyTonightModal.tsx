import React, { useState, useEffect } from 'react';
import { X, Compass, Moon, Sparkles, MapPin, Eye, Info } from 'lucide-react';
import { SkyTonightData } from '../../types';
import { fetchSkyTonight } from '../../services/api';

interface SkyTonightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkyTonightModal: React.FC<SkyTonightModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<SkyTonightData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lon: number }>({
    name: 'New Delhi, India',
    lat: 28.6139,
    lon: 77.2090,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchSkyTonight(selectedLocation.lat, selectedLocation.lon)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, selectedLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 pointer-events-auto">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Compass size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">WHAT'S IN THE SKY TONIGHT?</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  TOPOCENTRIC SKY RADAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized naked-eye & optical observation guide for your geographic horizon
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

        {/* Location Selector Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin size={15} className="text-red-400" />
            <span className="font-medium">Observation Location:</span>
          </div>

          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const loc = data?.popular_locations.find((l) => l.name === e.target.value);
              if (loc) setSelectedLocation({ name: loc.name, lat: loc.lat, lon: loc.lon });
            }}
            className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            {data?.popular_locations.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {data && (
            <>
              {/* Moon Phase & Meteor Outlook Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Moon Phase Card */}
                <div className="p-4 rounded-xl glass-panel border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-sky-400 uppercase font-semibold tracking-wider block">
                      Lunar Phase
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{data.moon_phase}</h3>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Illumination: {data.moon_illumination}% of lunar disk
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-2">
                      Terminator line offers high-contrast crater viewing.
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center relative overflow-hidden shadow-inner">
                    <Moon size={34} className="text-amber-200" />
                  </div>
                </div>

                {/* Meteor Activity Card */}
                <div className="p-4 rounded-xl glass-panel border border-white/10">
                  <span className="text-xs text-purple-400 uppercase font-semibold tracking-wider block">
                    Meteor Activity Outlook
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{data.meteor_outlook.active_shower}</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Rate: <span className="text-emerald-400 font-bold">{data.meteor_outlook.expected_rate}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    ⏰ Best Window: {data.meteor_outlook.best_viewing_window}
                  </p>
                </div>
              </div>

              {/* Observable Celestial Targets */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Eye size={16} className="text-sky-400" />
                  <span>Observable Celestial Objects Ranked by Elevation</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.targets.map((tgt) => (
                    <div
                      key={tgt.id}
                      className={`p-4 rounded-xl border transition ${
                        tgt.is_visible
                          ? 'glass-panel border-white/15 hover:border-sky-500/40'
                          : 'bg-black/30 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white text-sm">{tgt.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tgt.is_visible
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tgt.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-slate-300 mt-2">
                        <span>
                          Altitude: <b className="text-sky-300">{tgt.altitude_deg}°</b>
                        </span>
                        <span>•</span>
                        <span>
                          Direction: <b className="text-amber-300">{tgt.cardinal_direction}</b> ({tgt.azimuth_deg}°)
                        </span>
                        <span>•</span>
                        <span>Mag: {tgt.apparent_magnitude}</span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {tgt.observation_advice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
