import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../utils/constants';

export default function DonutChart({ activeSlice, setActiveSlice, formData }) {
  const { activeBudget, settings } = useApp();

  const chartData = useMemo(() => {
    if (!activeBudget) return [];
    const total = activeBudget.totalBudget || 1;
    let acc = 0;
    return Object.keys(activeBudget.categories).map(key => {
      const cost = activeBudget.categories[key].cost;
      const angle = (cost / total) * 360;
      const startAngle = acc;
      acc += angle;
      const meta = CATEGORY_META[key];
      let name = meta?.name || key;
      if (key === 'transportation') {
        const pref = activeBudget.transportPreference || formData.transportPreference || 'Flight';
        if (pref === 'Train') name = 'Trains';
        else if (pref === 'Bus') name = 'Bus Transit';
        else if (pref === 'Cab') name = 'Cab / Car';
      }
      return { key, name, cost, percentage: (cost / total) * 100, angle, startAngle, color: meta?.color || '#94a3b8' };
    }).filter(s => s.cost > 0);
  }, [activeBudget]);

  const getCoords = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div className="summary-widget p-6 flex flex-col justify-between h-full">
      <div>
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span> Budget Distribution
        </h4>
        <p className="text-xs text-slate-400 mt-1 font-light">Hover slices to see allocation.</p>
      </div>

      <div className="relative w-full aspect-square max-w-[210px] mx-auto my-8 flex items-center justify-center">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
          {chartData.map(slice => {
            const [sx, sy] = getCoords(slice.startAngle / 360);
            const [ex, ey] = getCoords((slice.startAngle + slice.angle) / 360);
            const large = slice.angle > 180 ? 1 : 0;
            const d = `M ${sx} ${sy} A 1 1 0 ${large} 1 ${ex} ${ey} L 0 0`;
            const isHovered = activeSlice === slice.key;
            return (
              <path key={slice.key} d={d} fill={slice.color}
                opacity={isHovered ? 0.95 : activeSlice !== null ? 0.4 : 0.8}
                style={{ transition: 'all 0.2s', cursor: 'pointer', transform: isHovered ? 'scale(1.05)' : 'scale(1)', transformOrigin: '0 0' }}
                onMouseEnter={() => setActiveSlice(slice.key)}
                onMouseLeave={() => setActiveSlice(null)}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.65" fill="#ffffff" />
        </svg>
        <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
          {activeSlice ? (
            <>
              <span className="text-[9px] uppercase font-bold text-slate-400 max-w-[90px] truncate">{CATEGORY_META[activeSlice]?.name}</span>
              <span className="text-sm font-extrabold text-slate-800 mt-0.5">{settings.currencySymbol}{activeBudget.categories[activeSlice].cost.toLocaleString()}</span>
              <span className="text-[9px] text-blue-600 font-semibold mt-0.5">{((activeBudget.categories[activeSlice].cost / (activeBudget.totalBudget || 1)) * 100).toFixed(0)}%</span>
            </>
          ) : (
            <>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              <span className="text-lg font-black text-slate-800">{settings.currencySymbol}{activeBudget.totalBudget.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {chartData.slice(0, 8).map(slice => (
          <div key={slice.key} className={`flex items-center space-x-2 p-1.5 rounded transition ${activeSlice === slice.key ? 'bg-slate-50' : ''}`}
            onMouseEnter={() => setActiveSlice(slice.key)} onMouseLeave={() => setActiveSlice(null)}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
            <span className="text-slate-500 truncate flex-1 font-light">{slice.name}</span>
            <span className="text-slate-800 font-bold">{slice.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
