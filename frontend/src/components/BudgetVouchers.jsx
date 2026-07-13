import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../utils/constants';
import { getCategoryIcon } from './Icons';

export default function BudgetVouchers({ formData, expandedCategory, setExpandedCategory, setActiveSlice, onCostEdit, onApplyOption }) {
  const { activeBudget, settings } = useApp();
  if (!activeBudget) return null;

  return (
    <div className="summary-widget p-6 flex flex-col h-full lg:col-span-2">
      <div>
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span> Budget Vouchers & Schedules
        </h4>
        <p className="text-xs text-slate-400 mt-1 font-light">Click any ticket to see options and booking steps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {Object.keys(activeBudget.categories).map(catKey => {
          const cat = activeBudget.categories[catKey];
          const meta = { ...CATEGORY_META[catKey] };
          const pref = activeBudget.transportPreference || formData.transportPreference || 'Flight';
          if (catKey === 'transportation') {
            if (pref === 'Train') meta.name = 'Trains';
            else if (pref === 'Bus') meta.name = 'Bus Transit';
            else if (pref === 'Cab') meta.name = 'Cab / Car';
          }
          const IconComponent = getCategoryIcon(catKey, pref);
          const isExpanded = expandedCategory === catKey;

          return (
            <div key={catKey}
              onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
              className={`p-3 ticket-row ${meta.ticketClass} flex flex-col space-y-2.5 transition duration-200 cursor-pointer ${isExpanded ? 'scale-[1.01] shadow-md ring-2 ring-blue-500/20' : 'hover:-translate-y-0.5'}`}
              onMouseEnter={() => setActiveSlice(catKey)}
              onMouseLeave={() => setActiveSlice(null)}
            >
              <div className="flex flex-wrap items-center justify-between gap-y-2">
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <div className="p-1 rounded-md bg-white/40 border border-slate-200/20 flex items-center justify-center shrink-0">
                    <IconComponent className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 truncate">{meta.name}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0 ml-auto" onClick={e => e.stopPropagation()}>
                  <span className="text-xs font-extrabold opacity-75 text-slate-500">{settings.currencySymbol}</span>
                  <input type="number" value={cat.cost}
                    onChange={e => onCostEdit(catKey, e.target.value)}
                    className="w-20 bg-white/80 border border-slate-300/40 rounded-lg py-1 px-1.5 text-right font-black text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition"
                  />
                </div>
              </div>

              <span className="text-xs leading-relaxed opacity-95 font-medium text-slate-750 pl-0.5">{cat.explanation}</span>

              <div className="flex justify-between items-center text-[9px] font-bold opacity-60 hover:opacity-100 pt-1 border-t border-dashed border-slate-300/30">
                <span>{isExpanded ? '▲ Hide Details' : '▼ Click for schedules & times'}</span>
              </div>

              {isExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-300/50 flex flex-col space-y-3 cursor-default" onClick={e => e.stopPropagation()}>
                  {cat.options?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recommendations:</span>
                      {cat.options.map((opt, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white/60 border border-slate-200/30 flex items-center justify-between gap-3 text-slate-800 hover:bg-white/80 transition text-[11px]">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-extrabold truncate text-slate-900 flex flex-wrap items-center gap-1.5">
                              <span>{opt.name}</span>
                              {opt.rating && (
                                <span className="text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-200/50 px-1 py-0.5 rounded">⭐ {opt.rating} {opt.reviews ? `(${opt.reviews})` : ''}</span>
                              )}
                            </div>
                            {opt.cuisine && <div className="text-[9px] text-slate-500 font-semibold">🍳 {opt.cuisine} {opt.tier ? `• ${opt.tier}` : ''}</div>}
                            {opt.time && <div className="text-[10px] text-slate-500 font-medium">{opt.time}</div>}
                            <div className="text-[10px] text-slate-600 font-light leading-snug">{opt.details}</div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end space-y-1.5 ml-2">
                            <span className="font-black text-slate-800">{settings.currencySymbol}{opt.price?.toLocaleString()}</span>
                            <button onClick={() => onApplyOption(catKey, opt.price)}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] tracking-wide uppercase shadow-xs transition">
                              Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {cat.bookingProcess && (
                    <div className="p-2 rounded-lg bg-slate-900/5 border border-slate-300/30 text-[10px]">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">Booking Steps:</span>
                      <div className="text-slate-700 font-light whitespace-pre-line leading-relaxed">{cat.bookingProcess}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
