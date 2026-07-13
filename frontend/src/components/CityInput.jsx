import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function CityInput({ label, placeholder, value, onChange, highlight }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 1) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/cities?q=${encodeURIComponent(value.trim())}`);
        setResults(data);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
  }, [value]);

  return (
    <div className={`search-col relative z-40 ${highlight ? 'bg-orange-500/5 hover:bg-orange-500/10' : ''}`}>
      <span className={`block text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-orange-600 font-black' : 'text-slate-400'}`}>
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`form-input-box ${highlight ? 'font-extrabold text-orange-950' : ''}`}
        autoComplete="off"
      />
      <span className="block text-xs text-slate-400 mt-1 font-light truncate">
        {highlight ? 'Destination City/Country' : 'Departure Station/Airport'}
      </span>

      {open && value.trim().length >= 1 && (
        <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-slate-800">
          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block"></span>
              Searching cities...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic">No matching cities found</div>
          ) : results.map(city => (
            <div
              key={city.code + city.name}
              onMouseDown={() => { onChange(city.name); setOpen(false); }}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs border-b border-slate-100 last:border-none"
            >
              <div className="min-w-0 pr-2">
                <div className="font-extrabold text-slate-800 truncate">
                  {city.name}, <span className="text-[10px] text-slate-500 font-medium">{city.country}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{city.desc}</div>
              </div>
              <span className="shrink-0 text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200/50 px-1.5 py-0.5 rounded">{city.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
