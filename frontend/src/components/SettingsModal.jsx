import { useApp } from '../context/AppContext';
import { Icons } from './Icons';

export default function SettingsModal({ onClose }) {
  const { settings, saveSettings } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    saveSettings({ geminiApiKey: fd.get('geminiApiKey').trim(), defaultCurrency: fd.get('defaultCurrency') });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 animate-scale-up text-slate-800">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Icons.Settings className="w-5 h-5 text-blue-600" /> Planner Options
          </h3>
          <button onClick={onClose} className="p-1 rounded bg-slate-100 hover:bg-slate-200">
            <Icons.Close className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Gemini API Key</label>
            <input type="password" name="geminiApiKey" placeholder="Paste Gemini AI Key..." defaultValue={settings.geminiApiKey}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500" />
            <div className="flex justify-between items-center mt-1.5 text-[9px] text-slate-400 font-light">
              <span>No key needed for Demo Mode.</span>
              <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Get Key</a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Currency Setup</label>
            <select name="defaultCurrency" defaultValue={settings.defaultCurrency}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-2 text-xs">
            <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold">Save Preferences</button>
          </div>
        </form>
      </div>
    </div>
  );
}
