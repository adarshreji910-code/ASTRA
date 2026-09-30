import React, { useState } from 'react';
import { HelpCircle, X, MousePointer, Move, ZoomIn, Clock, Sparkles } from 'lucide-react';

export const QuickControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-5 right-5 z-20 pointer-events-auto">
      {isOpen ? (
        <div className="glass-panel p-4 rounded-2xl border border-white/15 shadow-2xl max-w-xs text-xs space-y-3 mb-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-sky-400" />
              <span>Navigation Controls</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ZoomIn size={13} className="text-sky-400" />
                <span>Zoom Scale:</span>
              </span>
              <span className="font-mono text-white">Mouse Wheel / Pinch</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Move size={13} className="text-amber-400" />
                <span>Rotate Orbit:</span>
              </span>
              <span className="font-mono text-white">Left Drag / 1 Finger</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Move size={13} className="text-purple-400" />
                <span>Pan View:</span>
              </span>
              <span className="font-mono text-white">Right Drag / 2 Fingers</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MousePointer size={13} className="text-red-400" />
                <span>Inspect Object:</span>
              </span>
              <span className="font-mono text-white">Click Planet / Marker</span>
            </div>

            <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-200 leading-tight">
              💡 <b>Double-Click Earth:</b> Transitions into the Space Activity Center!
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-full glass-panel hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 shadow-lg transition"
          title="Controls & Shortcuts"
        >
          <HelpCircle size={18} />
        </button>
      )}
    </div>
  );
};
