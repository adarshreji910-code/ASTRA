import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, ArrowRight, X } from 'lucide-react';

interface IntroOverlayProps {
  onEnter: () => void;
  onOpenToday: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onEnter, onOpenToday }) => {
  const [step, setStep] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const hasSkipped = localStorage.getItem('spaceverse_intro_completed');
    if (hasSkipped === 'true') {
      setVisible(false);
      return;
    }

    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleEnter = () => {
    localStorage.setItem('spaceverse_intro_completed', 'true');
    setVisible(false);
    onEnter();
  };

  const handleSkip = () => {
    localStorage.setItem('spaceverse_intro_completed', 'true');
    setVisible(false);
    onEnter();
  };

  const handleToday = () => {
    localStorage.setItem('spaceverse_intro_completed', 'true');
    setVisible(false);
    onOpenToday();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm transition-opacity duration-700">
      {/* Skip Button Top Right */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition border border-white/20 shadow-lg cursor-pointer"
      >
        <span>Skip Intro & Explore</span>
        <X size={14} />
      </button>

      {/* Center Cinematic Content */}
      <div className="flex flex-col items-center text-center px-6 max-w-xl">
        {/* Glow badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-sky-500/10 border border-sky-400/20 text-sky-400 mb-6 transition-all duration-500 ${
            step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Sparkles size={13} className="animate-spin text-sky-400" />
          <span>Spaceverse Astronomical Gateway</span>
        </div>

        {/* LOOK UP */}
        <h1
          className={`text-6xl sm:text-7xl font-extrabold tracking-tighter text-white mb-4 transition-all duration-700 ${
            step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          LOOK UP.
        </h1>

        {/* Something is always happening */}
        <p
          className={`text-xl sm:text-2xl font-light text-slate-200 tracking-wide mb-8 transition-all duration-700 ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Something is always happening in the universe.
        </p>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 w-full justify-center transition-all duration-700 ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          <button
            onClick={handleEnter}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider text-black bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>ENTER THE SOLAR SYSTEM</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleToday}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Compass size={16} className="text-sky-400" />
            <span>What's happening today?</span>
          </button>
        </div>

        {/* Subtle Ephemeris Note */}
        <div
          className={`mt-8 text-xs text-slate-400 tracking-wider transition-opacity duration-700 ${
            step >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Real planetary positions computed via NASA JPL ephemeris equations
        </div>
      </div>
    </div>
  );
};
