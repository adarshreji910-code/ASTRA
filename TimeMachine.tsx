import React, { useState } from 'react';
import { Clock, RotateCcw, ChevronLeft, ChevronRight, Calendar, Bookmark } from 'lucide-react';

interface TimeMachineProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onResetNow: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const PRESET_EVENTS = [
  { name: 'Total Solar Eclipse (Spain 2026)', date: '2026-08-12T17:47:00Z' },
  { name: 'Saturn at Opposition (2026)', date: '2026-09-21T23:00:00Z' },
  { name: 'Blood Moon Lunar Eclipse (2027)', date: '2027-02-20T23:13:00Z' },
  { name: 'Century Solar Eclipse (Luxor 2027)', date: '2027-08-02T10:07:00Z' },
  { name: 'Asteroid 99942 Apophis Flyby (2029)', date: '2029-04-13T21:46:00Z' },
];

export const TimeMachine: React.FC<TimeMachineProps> = ({
  currentDate,
  onDateChange,
  onResetNow,
  isOpen,
  onToggle,
}) => {
  const [stepUnit, setStepUnit] = useState<'days' | 'months' | 'years'>('days');

  const handleStep = (direction: number) => {
    const newDate = new Date(currentDate);
    if (stepUnit === 'days') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (stepUnit === 'months') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (stepUnit === 'years') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    onDateChange(newDate);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
      <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center gap-2">
        {/* Main Controls Row */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {/* Step Back */}
          <button
            onClick={() => handleStep(-1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title={`Step -1 ${stepUnit}`}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Current Date Display */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-white text-xs">
            <Calendar size={13} className="text-sky-400" />
            <span className="font-bold">
              {currentDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="text-slate-400">
              {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
            </span>
          </div>

          {/* Step Forward */}
          <button
            onClick={() => handleStep(1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title={`Step +1 ${stepUnit}`}
          >
            <ChevronRight size={16} />
          </button>

          {/* Unit Toggle */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-white/10 text-[11px]">
            {(['days', 'months', 'years'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setStepUnit(unit)}
                className={`px-2 py-0.5 rounded capitalize transition ${
                  stepUnit === unit ? 'bg-sky-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>

          {/* Reset to Now */}
          <button
            onClick={onResetNow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>RESET TO NOW</span>
          </button>
        </div>

        {/* Quick Landmark Jump Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-lg scrollbar-none text-[10px]">
          <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Bookmark size={10} />
            <span>Epochs:</span>
          </span>
          {PRESET_EVENTS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onDateChange(new Date(preset.date))}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white whitespace-nowrap transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
