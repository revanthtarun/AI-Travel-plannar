import { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './Icons';
import { CHAT_CHIPS } from '../utils/constants';

export default function ChatAssistant({ chatOpen, setChatOpen, chatInput, setChatInput, onSendMessage }) {
  const { chatLog, loading, loadingText } = useApp();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSend = (preset) => {
    const text = preset || chatInput;
    if (!text?.trim()) return;
    onSendMessage(text);
    if (!preset) setChatInput('');
  };

  return (
    <>
      <div
        onClick={() => setChatOpen(!chatOpen)}
        className={`floating-assistant-bubble pulse-glow ${chatOpen ? 'rotate-[135deg] !bg-slate-800' : ''}`}
        title="Ask AI Assistant"
      >
        {chatOpen ? <Icons.Close className="w-6 h-6 text-white" /> : <Icons.Sparkles className="w-6 h-6 text-white" />}
      </div>

      <div className={`floating-assistant-window ${chatOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-2">
            <Icons.Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <div>
              <h4 className="text-sm font-extrabold">BudgetPal Assistant</h4>
              <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AI Active
              </span>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} className="p-1 rounded bg-white/10 hover:bg-white/20">
            <Icons.Close className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {chatLog.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
              <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-light">{msg.timestamp}</span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 p-2 bg-white rounded-lg border border-slate-200 max-w-[80%]">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>{loadingText}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Suggested Prompts:</span>
          <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto">
            {CHAT_CHIPS.map((chip, idx) => (
              <button key={idx} onClick={() => handleSend(chip.text)} className="text-[10px] px-2.5 py-1 rounded-full border action-chip font-bold">
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
          <input
            type="text"
            placeholder="e.g. Change flights to trains..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !chatInput?.trim()}
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center transition disabled:opacity-50 shrink-0"
          >
            <Icons.Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
