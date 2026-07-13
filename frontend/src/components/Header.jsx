import { useApp } from '../context/AppContext';
import { Icons } from './Icons';

export default function Header({ onShowSettings, onShowHistory, onHome }) {
  const { settings } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full py-4 px-6 md:px-12 flex items-center justify-between text-white">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={onHome}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
          <Icons.Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center">
            Budget<span className="text-orange-500 font-extrabold">Pal</span>
          </h1>
          <span className="text-[10px] text-blue-300 font-bold tracking-wider uppercase">GenAI Travel Planner</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={onShowHistory} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white transition">
          <Icons.History className="w-4 h-4 text-orange-400" />
          <span className="hidden sm:inline">My Trips</span>
        </button>
        <button onClick={onShowSettings} className="flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition">
          <Icons.Settings className="w-4 h-4 text-orange-400" />
        </button>
        {!settings.geminiApiKey && (
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/25 border border-amber-500/50 text-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Demo Mode</span>
          </div>
        )}
      </div>
    </header>
  );
}
