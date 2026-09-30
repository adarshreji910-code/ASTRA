import React, { useState, useEffect } from 'react';
import {
  X,
  Rocket,
  Sun,
  Radio,
  Newspaper,
  Compass,
  ExternalLink,
  Flame,
  Activity,
  Globe,
  Sparkles,
  Users,
  ShieldCheck
} from 'lucide-react';
import { SpaceWeather, NewsArticle, SpaceMission, ISSTelemetry } from '../../types';
import { fetchSpaceWeather, fetchNews, fetchMissions, fetchISSTelemetry } from '../../services/api';

interface SpaceActivityCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'news' | 'missions' | 'weather' | 'iss' | 'nasa' | 'isro' | 'spacex';
}

export const SpaceActivityCenter: React.FC<SpaceActivityCenterProps> = ({
  isOpen,
  onClose,
  initialTab = 'news',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [newsCategory, setNewsCategory] = useState<string>('all');
  const [weather, setWeather] = useState<SpaceWeather | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [missions, setMissions] = useState<SpaceMission[]>([]);
  const [iss, setIss] = useState<ISSTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    Promise.all([
      fetchSpaceWeather().catch(() => null),
      fetchNews(newsCategory).catch(() => []),
      fetchMissions().catch(() => []),
      fetchISSTelemetry().catch(() => null),
    ]).then(([w, n, m, i]) => {
      if (w) setWeather(w);
      if (n) setNews(n);
      if (m) setMissions(m);
      if (i) setIss(i);
      setLoading(false);
    });
  }, [isOpen, newsCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 pointer-events-auto">
      <div className="w-full max-w-6xl h-[90vh] glass-panel rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">SPACE ACTIVITY CENTER</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">What's happening in space right now across NASA, ISRO, and SpaceX</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Return to Solar System (ESC)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-white/10 bg-slate-950/40 text-xs px-6 py-2 gap-2 scrollbar-none">
          {[
            { id: 'news', label: 'Verified Space News', icon: Newspaper },
            { id: 'weather', label: 'Solar & Space Weather', icon: Sun },
            { id: 'iss', label: 'ISS Live Orbit', icon: Radio },
            { id: 'missions', label: 'Active Missions', icon: Rocket },
            { id: 'nasa', label: 'NASA Hub', icon: ShieldCheck },
            { id: 'isro', label: 'ISRO Hub', icon: Sparkles },
            { id: 'spacex', label: 'SpaceX Hub', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. VERIFIED NEWS TAB */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 text-xs">
                {['all', 'Missions', 'Launches', 'Discoveries', 'Space Weather', 'Mars'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewsCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition ${
                      newsCategory === cat
                        ? 'bg-white/20 text-white font-semibold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between glass-panel p-4 rounded-xl border border-white/10 hover:border-sky-500/40 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span className="font-semibold text-sky-400 uppercase tracking-wider">
                          {item.organization}
                        </span>
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex gap-1 overflow-hidden">
                        {item.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 truncate"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                      >
                        <span>READ ORIGINAL</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SOLAR & SPACE WEATHER TAB */}
          {activeTab === 'weather' && weather && (
            <div className="space-y-6">
              {/* Top Banner KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl glass-panel border border-white/10">
                  <span className="text-xs text-slate-400 block">Geomagnetic Kp Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-amber-400 font-mono">
                      {weather.geomagnetic_k_index}
                    </span>
                    <span className="text-xs text-amber-300/80">/ 9</span>
                  </div>
                  <span className="text-[11px] text-amber-300 block mt-1">{weather.geomagnetic_storm_level}</span>
                </div>

                <div className="p-4 rounded-xl glass-panel border border-white/10">
                  <span className="text-xs text-slate-400 block">Solar Wind Speed</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-sky-400 font-mono">
                      {weather.solar_wind.speed_km_s}
                    </span>
                    <span className="text-xs text-slate-400">km/s</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Density: {weather.solar_wind.density_p_cm3} p/cm³
                  </span>
                </div>

                <div className="p-4 rounded-xl glass-panel border border-white/10">
                  <span className="text-xs text-slate-400 block">Sunspot Number</span>
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono block mt-1">
                    {weather.sunspot_number}
                  </span>
                  <span className="text-[11px] text-emerald-400/80 block mt-1">Solar Cycle 25 Maximum</span>
                </div>

                <div className="p-4 rounded-xl glass-panel border border-white/10">
                  <span className="text-xs text-slate-400 block">Aurora Probability</span>
                  <span className="text-2xl font-extrabold text-purple-400 font-mono block mt-1">
                    {weather.aurora_forecast.probability_high_latitudes}
                  </span>
                  <span className="text-[11px] text-purple-300 block mt-1">High Latitudes (&gt;52°N)</span>
                </div>
              </div>

              {/* Recent Solar Flares Table */}
              <div className="glass-panel p-5 rounded-xl border border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Flame size={16} className="text-red-400" />
                  <span>Recent Solar Flares & CMEs (NASA DONKI / NOAA Telemetry)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-medium">
                        <th className="pb-2">Class</th>
                        <th className="pb-2">Active Region</th>
                        <th className="pb-2">Peak Time</th>
                        <th className="pb-2">Earth-Directed</th>
                        <th className="pb-2">Radio Blackout Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {weather.solar_flares_recent.map((flare) => (
                        <tr key={flare.id}>
                          <td className="py-2.5 font-bold text-red-400">{flare.class}</td>
                          <td className="py-2.5 text-slate-300">{flare.active_region}</td>
                          <td className="py-2.5 text-slate-300">
                            {new Date(flare.peak_time_utc).toLocaleString()}
                          </td>
                          <td className="py-2.5">
                            {flare.earth_directed === true ? (
                              <span className="text-amber-400 font-bold">Direct CME</span>
                            ) : (
                              <span className="text-slate-400">{String(flare.earth_directed)}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-slate-400 font-sans">{flare.radio_blackout}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aurora Observation Recommendation */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                <span className="font-bold text-purple-300 block mb-1">
                  🌌 Where to Spot Auroras Tonight:
                </span>
                <p className="leading-relaxed">
                  Prime viewing corridors include:{' '}
                  {weather.aurora_forecast.prime_observation_zones.join(', ')}. {weather.aurora_forecast.advice}
                </p>
              </div>
            </div>
          )}

          {/* 3. ISS LIVE ORBIT TAB */}
          {activeTab === 'iss' && iss && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-white/10">
                  <span className="text-xs text-slate-400">Current Position</span>
                  <div className="font-mono text-xl text-white font-bold mt-1">
                    {iss.latitude}° N, {iss.longitude}° E
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">Live Orbital Position</span>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-white/10">
                  <span className="text-xs text-slate-400">Orbital Velocity</span>
                  <div className="font-mono text-xl text-sky-400 font-bold mt-1">
                    {iss.velocity_km_h.toLocaleString()} km/h
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">~7.66 km/second</span>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-white/10">
                  <span className="text-xs text-slate-400">Altitude</span>
                  <div className="font-mono text-xl text-amber-400 font-bold mt-1">
                    {iss.altitude_km} km
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Orbital Period: {iss.orbital_period_minutes} min
                  </span>
                </div>
              </div>

              {/* Crew Onboard */}
              <div className="glass-panel p-5 rounded-xl border border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Users size={16} className="text-sky-400" />
                  <span>Astronauts Currently Onboard the Station ({iss.expedition})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {iss.current_crew.map((crew, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-sm font-bold text-white">{crew.name}</div>
                      <div className="text-xs text-sky-300 mt-0.5">{crew.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. MISSIONS TAB */}
          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((m) => (
                <div key={m.id} className="glass-panel p-5 rounded-xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-sky-400 uppercase tracking-wider">{m.agency}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {m.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{m.name}</h3>
                    <div className="text-xs text-slate-300 font-mono mt-1">
                      🎯 Target: <span className="text-sky-300">{m.target}</span> • 🚀 Vehicle: {m.launch_vehicle}
                    </div>
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">{m.description}</p>
                    {m.crew && (
                      <div className="mt-3 text-xs text-slate-400">
                        <span className="text-slate-300 font-semibold block mb-0.5">Crew:</span>
                        {m.crew.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{m.launch_window}</span>
                    <a
                      href={m.official_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                    >
                      <span>OFFICIAL MISSION PAGE</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. DEDICATED AGENCY HUBS (NASA, ISRO, SPACEX) */}
          {(activeTab === 'nasa' || activeTab === 'isro' || activeTab === 'spacex') && (
            <div className="space-y-6">
              {/* Agency Header Banner */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
                    Official Agency Gateway
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    {activeTab === 'nasa' && 'NASA — National Aeronautics and Space Administration'}
                    {activeTab === 'isro' && 'ISRO — Indian Space Research Organisation'}
                    {activeTab === 'spacex' && 'SPACEX — Space Exploration Technologies Corp.'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                    {activeTab === 'nasa' &&
                      'Exploring the Moon with Artemis, traversing Mars with Perseverance, peering into the cosmic dawn with JWST, and monitoring Earth climate.'}
                    {activeTab === 'isro' &&
                      'Pioneering Gaganyaan human spaceflight, Aditya-L1 solar halo observatory, Chandrayaan-4 lunar sample return, and world-class launch vehicle operations.'}
                    {activeTab === 'spacex' &&
                      'Revolutionizing orbital access with full rapid reusability via Starship, Falcon 9 cadence, and NASA Artemis Human Landing System development.'}
                  </p>
                </div>
                <a
                  href={
                    activeTab === 'nasa'
                      ? 'https://www.nasa.gov'
                      : activeTab === 'isro'
                      ? 'https://www.isro.gov.in'
                      : 'https://www.spacex.com'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider text-black bg-white hover:bg-slate-200 transition flex items-center gap-1.5 shrink-0"
                >
                  <span>OFFICIAL PORTAL</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Filtered Agency Missions */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Agency Exploration Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missions
                    .filter((m) => m.agency.toLowerCase().includes(activeTab.toLowerCase()))
                    .map((m) => (
                      <div key={m.id} className="glass-panel p-4 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-sky-400">{m.type}</span>
                          <span className="text-emerald-400 font-mono text-[11px]">{m.status}</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{m.name}</h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">{m.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
