import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentSolarSystem,
  fetchSolarSystemAtTime,
  fetchUpcomingEvents,
  fetchMissions,
  fetchNews
} from './services/api';
import {
  SolarSystemState,
  Planet,
  AstronomicalEvent,
  SpaceMission,
  NewsArticle
} from './types';
import { SolarSystemCanvas } from './components/3d/SolarSystemCanvas';
import { Navbar } from './components/ui/Navbar';
import { IntroOverlay } from './components/intro/IntroOverlay';
import { EventDrawer } from './components/events/EventDrawer';
import { EventSimulationModal } from './components/events/EventSimulationModal';
import { UpcomingEventsListModal } from './components/events/UpcomingEventsListModal';
import { PlanetDetailSheet } from './components/ui/PlanetDetailSheet';
import { SpaceActivityCenter } from './components/activity/SpaceActivityCenter';
import { SkyTonightModal } from './components/tonight/SkyTonightModal';
import { AskSpaceVerseModal } from './components/assistant/AskSpaceVerseModal';
import { GlobalSearch } from './components/ui/GlobalSearch';
import { TimeMachine } from './components/ui/TimeMachine';
import { QuickControls } from './components/ui/QuickControls';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  // Application Data States
  const [solarState, setSolarState] = useState<SolarSystemState | null>(null);
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [missions, setMissions] = useState<SpaceMission[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStage, setLoadingStage] = useState<number>(0);

  // Interaction States
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(null);
  const [simulatingEvent, setSimulatingEvent] = useState<AstronomicalEvent | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'earth' | 'system' | 'activity' | null>('earth');

  // Modals & Panels
  const [isActivityOpen, setIsActivityOpen] = useState<boolean>(false);
  const [isTonightOpen, setIsTonightOpen] = useState<boolean>(false);
  const [isEventsListOpen, setIsEventsListOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Time Machine Date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isTimeMachineActive, setIsTimeMachineActive] = useState<boolean>(true);

  // INITIAL DATA LOADING SEQUENCE
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingStage(1);
        const sState = await fetchCurrentSolarSystem();
        setSolarState(sState);

        setLoadingStage(2);
        const evList = await fetchUpcomingEvents();
        setEvents(evList);

        setLoadingStage(3);
        const mList = await fetchMissions().catch(() => []);
        setMissions(mList);

        setLoadingStage(4);
        const nList = await fetchNews().catch(() => []);
        setNews(nList);

        setTimeout(() => setLoading(false), 500);
      } catch (err) {
        console.error('Error initializing Spaceverse data:', err);
        // Fallback: don't block user indefinitely
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // UPDATE EPHEMERIS WHEN TIME MACHINE DATE CHANGES
  const handleDateChange = useCallback(async (newDate: Date) => {
    setCurrentDate(newDate);
    try {
      const updatedState = await fetchSolarSystemAtTime(newDate.toISOString());
      setSolarState(updatedState);
    } catch (e) {
      console.warn('Failed to fetch epoch ephemeris:', e);
    }
  }, []);

  const handleResetNow = useCallback(async () => {
    const now = new Date();
    setCurrentDate(now);
    try {
      const updatedState = await fetchCurrentSolarSystem();
      setSolarState(updatedState);
      setCameraPreset('earth');
    } catch (e) {
      console.warn('Failed to reset to now:', e);
    }
  }, []);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlanet(null);
        setSelectedEvent(null);
        setSimulatingEvent(null);
        setIsActivityOpen(false);
        setIsTonightOpen(false);
        setIsEventsListOpen(false);
        setIsAssistantOpen(false);
        setIsSearchOpen(false);
      } else if (e.key === 'r' || e.key === 'R') {
        // Reset camera to Earth
        setCameraPreset('earth');
        setSelectedPlanet(null);
        setSelectedEvent(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Double-Click Earth / Enter Activity Center
  const handleEnterActivityCenter = useCallback(() => {
    setCameraPreset('activity');
    setIsActivityOpen(true);
    setSelectedPlanet(null);
    setSelectedEvent(null);
  }, []);

  // Handle assistant prompt action triggers
  const handleAssistantAction = useCallback((actionText: string) => {
    setIsAssistantOpen(false);
    if (actionText.includes('Solar Flare')) {
      const fl = events.find((e) => e.simulation_type === 'solar_flare');
      if (fl) setSimulatingEvent(fl);
    } else if (actionText.includes('Lunar Eclipse') || actionText.includes('Blood Moon')) {
      const le = events.find((e) => e.simulation_type === 'lunar_eclipse');
      if (le) setSimulatingEvent(le);
    } else if (actionText.includes('Solar Eclipse')) {
      const se = events.find((e) => e.simulation_type === 'solar_eclipse');
      if (se) setSimulatingEvent(se);
    } else if (actionText.includes('Mars')) {
      if (solarState?.planets.mars) setSelectedPlanet(solarState.planets.mars);
    } else if (actionText.includes('Jupiter')) {
      if (solarState?.planets.jupiter) setSelectedPlanet(solarState.planets.jupiter);
    } else if (actionText.includes('Tonight')) {
      setIsTonightOpen(true);
    } else if (actionText.includes('ISRO') || actionText.includes('SpaceX') || actionText.includes('Activity')) {
      setIsActivityOpen(true);
    }
  }, [events, solarState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 1. CINEMATIC LOADING SEQUENCE */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Sparkles size={20} className="animate-spin text-white" />
            </div>
            <span className="text-xl font-bold tracking-widest uppercase">SPACEVERSE</span>
          </div>

          <h2 className="text-sm font-semibold tracking-wider text-slate-300 mb-6">
            CONNECTING TO THE UNIVERSE...
          </h2>

          <div className="w-full max-w-xs space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                className={loadingStage >= 1 ? 'text-emerald-400' : 'text-slate-700'}
              />
              <span>Astronomical ephemerides computed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                className={loadingStage >= 2 ? 'text-emerald-400' : 'text-slate-700'}
              />
              <span>Planetary coordinates mapped (J2000)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                className={loadingStage >= 3 ? 'text-emerald-400' : 'text-slate-700'}
              />
              <span>Upcoming celestial alignments loaded</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                className={loadingStage >= 4 ? 'text-emerald-400' : 'text-slate-700'}
              />
              <span>NASA & ISRO space activity feeds synced</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP NAVBAR */}
      <Navbar
        onFocusEarth={() => {
          setCameraPreset('earth');
          setSelectedPlanet(null);
          setSelectedEvent(null);
        }}
        onFocusSystem={() => {
          setCameraPreset('system');
          setSelectedPlanet(null);
          setSelectedEvent(null);
        }}
        onOpenActivity={() => setIsActivityOpen(true)}
        onOpenTonight={() => setIsTonightOpen(true)}
        onOpenEventsList={() => setIsEventsListOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 4. MAIN 3D SOLAR SYSTEM VIEWPORT */}
      <SolarSystemCanvas
        solarState={solarState}
        events={events}
        selectedPlanet={selectedPlanet}
        selectedEvent={selectedEvent}
        onSelectPlanet={(p) => setSelectedPlanet(p)}
        onSelectEvent={(e) => setSelectedEvent(e)}
        onEnterActivityCenter={handleEnterActivityCenter}
        cameraPreset={cameraPreset}
      />

      {/* 5. CONTEXTUAL PLANET DETAIL SHEET */}
      <PlanetDetailSheet
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />

      {/* 6. CONTEXTUAL EVENT DETAILS DRAWER */}
      <EventDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onWatchSimulation={(ev) => setSimulatingEvent(ev)}
      />

      {/* 7. DEDICATED EVENT SIMULATION ENGINE MODAL */}
      <EventSimulationModal
        event={simulatingEvent}
        onClose={() => setSimulatingEvent(null)}
      />

      {/* 8. SPACE ACTIVITY CENTER (Double-Click Earth) */}
      <SpaceActivityCenter
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* 9. WHAT'S IN THE SKY TONIGHT MODAL */}
      <SkyTonightModal
        isOpen={isTonightOpen}
        onClose={() => setIsTonightOpen(false)}
      />

      {/* 10. UPCOMING EVENTS CATALOG MODAL */}
      <UpcomingEventsListModal
        isOpen={isEventsListOpen}
        onClose={() => setIsEventsListOpen(false)}
        events={events}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
        onWatchSimulation={(ev) => setSimulatingEvent(ev)}
      />

      {/* 11. ASK SPACEVERSE AI ASSISTANT MODAL */}
      <AskSpaceVerseModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onTriggerAction={handleAssistantAction}
      />

      {/* 12. GLOBAL SEARCH MODAL */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        planets={solarState ? Object.values(solarState.planets) : []}
        events={events}
        missions={missions}
        news={news}
        onSelectPlanet={(p) => setSelectedPlanet(p)}
        onSelectEvent={(e) => setSelectedEvent(e)}
        onOpenActivity={() => setIsActivityOpen(true)}
      />

      {/* 13. TIME MACHINE TIMELINE */}
      <TimeMachine
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onResetNow={handleResetNow}
        isOpen={isTimeMachineActive}
        onToggle={() => setIsTimeMachineActive(!isTimeMachineActive)}
      />

      {/* 14. QUICK NAVIGATION & SHORTCUT HELPER */}
      <QuickControls />
    </div>
  );
}

export default App;
