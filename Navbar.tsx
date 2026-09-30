import React from 'react';
import {
  Compass,
  Search,
  Sparkles,
  Rocket,
  Globe,
  Calendar,
  Layers,
  Bot
} from 'lucide-react';

interface NavbarProps {
  onFocusEarth: () => void;
  onFocusSystem: () => void;
  onOpenActivity: () => void;
  onOpenTonight: () => void;
  onOpenEventsList: () => void;
  onOpenAssistant: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onFocusEarth,
  onFocusSystem,
  onOpenActivity,
  onOpenTonight,
  onOpenEventsList,
  onOpenAssistant,
  onOpenSearch,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 glass-panel px-3.5 py-1.5 rounded-2xl pointer-events-auto border border-white/10 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider text-white">SPACEVERSE</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Look up. Something is always happening.
            </p>
          </div>
        </div>

        {/* Center / Right Action Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 glass-panel p-1.5 rounded-2xl pointer-events-auto border border-white/10 shadow-lg text-xs">
          {/* Earth View */}
          <button
            onClick={onFocusEarth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Focus Camera on Earth (R)"
          >
            <Globe size={14} className="text-sky-400" />
            <span className="hidden md:inline font-medium">Earth</span>
          </button>

          {/* Full Solar System View */}
          <button
            onClick={onFocusSystem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Overview Entire Solar System"
          >
            <Layers size={14} className="text-amber-400" />
            <span className="hidden md:inline font-medium">Solar System</span>
          </button>

          {/* Space Activity Center */}
          <button
            onClick={onOpenActivity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition cursor-pointer"
            title="Open Space Activity Center (Double-click Earth)"
          >
            <Rocket size={14} className="text-sky-400" />
            <span>Space Activity</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          {/* Tonight's Sky */}
          <button
            onClick={onOpenTonight}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="What's happening in the sky tonight?"
          >
            <Compass size={14} className="text-purple-400" />
            <span className="hidden sm:inline font-medium">Tonight</span>
          </button>

          {/* Upcoming Events Catalog */}
          <button
            onClick={onOpenEventsList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Upcoming Astronomical Events"
          >
            <Calendar size={14} className="text-red-400" />
            <span className="hidden sm:inline font-medium">Events</span>
          </button>

          {/* Ask SpaceVerse AI */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Ask SpaceVerse AI Assistant"
          >
            <Bot size={14} className="text-sky-400" />
            <span className="hidden lg:inline font-medium">Ask AI</span>
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Search (Ctrl + K)"
          >
            <Search size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
