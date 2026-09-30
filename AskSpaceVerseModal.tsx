import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, ArrowRight } from 'lucide-react';
import { askSpaceVerse } from '../../services/api';

interface AskSpaceVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction?: (actionText: string) => void;
}

const SAMPLE_QUESTIONS = [
  'Why is the Moon red during a lunar eclipse?',
  'How far is Mars right now?',
  "What's happening with the Sun today?",
  'When is the next solar eclipse?',
  "What is ISRO's Gaganyaan human spaceflight mission?",
  'What can I see in the sky tonight?',
];

export const AskSpaceVerseModal: React.FC<AskSpaceVerseModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    Array<{
      sender: 'user' | 'assistant';
      text: string;
      suggested_actions?: string[];
    }>
  >([
    {
      sender: 'assistant',
      text: "Hello! I am your SpaceVerse astronomy assistant, connected directly to our real-time ephemeris calculations and space activity feeds. Ask me anything about planets, upcoming eclipses, space weather, or missions from NASA, ISRO, and SpaceX!",
    },
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (qText?: string) => {
    const textToSend = qText || query;
    if (!textToSend.trim() || loading) return;

    // Add user query
    setConversation((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await askSpaceVerse(textToSend);
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          suggested_actions: res.suggested_actions,
        },
      ]);
    } catch (e) {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the astronomy engine. Please ensure the backend is connected.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 pointer-events-auto">
      <div className="w-full max-w-2xl h-[75vh] glass-panel rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>ASK SPACEVERSE</span>
                <Sparkles size={13} className="text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400">Grounded Astronomy & Space Exploration AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'glass-panel text-slate-200 border border-white/10 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {/* Action Suggestion Buttons */}
              {msg.suggested_actions && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggested_actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => {
                        if (onTriggerAction) onTriggerAction(act);
                      }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 transition flex items-center gap-1"
                    >
                      <span>{act}</span>
                      <ArrowRight size={10} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <Sparkles size={14} className="animate-spin text-sky-400" />
              <span>Querying ephemeris telemetry...</span>
            </div>
          )}
        </div>

        {/* Sample Question Chips */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-white/5 flex overflow-x-auto gap-1.5 scrollbar-none text-[11px]">
          {SAMPLE_QUESTIONS.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(sq)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white whitespace-nowrap transition cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-3 border-t border-white/10 bg-slate-950/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about planets, eclipses, space weather, or missions..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black transition cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
