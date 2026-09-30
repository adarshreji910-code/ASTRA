import React, { useState, useMemo } from 'react';
import { Search, X, Globe, Calendar, Rocket, Newspaper, ArrowRight } from 'lucide-react';
import { Planet, AstronomicalEvent, SpaceMission, NewsArticle } from '../../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  planets: Planet[];
  events: AstronomicalEvent[];
  missions: SpaceMission[];
  news: NewsArticle[];
  onSelectPlanet: (planet: Planet) => void;
  onSelectEvent: (event: AstronomicalEvent) => void;
  onOpenActivity: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  planets,
  events,
  missions,
  news,
  onSelectPlanet,
  onSelectEvent,
  onOpenActivity,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return { planets: [], events: [], missions: [], news: [] };
    const term = searchTerm.toLowerCase();

    return {
      planets: planets.filter((p) => p.name.toLowerCase().includes(term)),
      events: events.filter((e) => e.title.toLowerCase().includes(term) || e.type.toLowerCase().includes(term)),
      missions: missions.filter((m) => m.name.toLowerCase().includes(term) || m.agency.toLowerCase().includes(term)),
      news: news.filter((n) => n.title.toLowerCase().includes(term) || n.organization.toLowerCase().includes(term)),
    };
  }, [searchTerm, planets, events, missions, news]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search planets, eclipses, missions, news, NASA, ISRO, SpaceX..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {!searchTerm.trim() ? (
            <div className="text-center py-8 text-slate-500">
              Type to search across celestial objects, astronomical events, space missions, and news.
            </div>
          ) : (
            <>
              {/* Planets */}
              {results.planets.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-2">
                    Celestial Objects
                  </span>
                  <div className="space-y-1">
                    {results.planets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPlanet(p);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe size={15} className="text-sky-400" />
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className="text-slate-400 font-mono">
                            {p.distance_from_earth_million_km}M km from Earth
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-2">
                    Astronomical Events
                  </span>
                  <div className="space-y-1">
                    {results.events.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          onSelectEvent(e);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar size={15} className="text-red-400" />
                          <div>
                            <span className="font-bold text-white text-sm block">{e.title}</span>
                            <span className="text-slate-400 text-[11px]">
                              {e.date} • {e.type}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Missions */}
              {results.missions.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                    Space Missions
                  </span>
                  <div className="space-y-1">
                    {results.missions.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onOpenActivity();
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Rocket size={15} className="text-emerald-400" />
                          <div>
                            <span className="font-bold text-white text-sm block">{m.name}</span>
                            <span className="text-slate-400 text-[11px]">
                              {m.agency} • {m.type}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {results.news.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                    Space News
                  </span>
                  <div className="space-y-1">
                    {results.news.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          onOpenActivity();
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Newspaper size={15} className="text-amber-400" />
                          <span className="text-slate-200 line-clamp-1">{n.title}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
