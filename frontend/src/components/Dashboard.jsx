import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../utils/constants';
import { Icons, getCategoryIcon } from './Icons';
import BudgetVouchers from './BudgetVouchers';
import DonutChart from './DonutChart';

export default function Dashboard({ formData, onHome, onCategoryCostEdit, onApplyOption }) {
  const { activeBudget, settings, savedTrips, currentTripId } = useApp();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [activeSlice, setActiveSlice] = useState(null);

  if (!activeBudget) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-8">
        {/* Summary Header */}
        <div className="summary-widget p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="px-2.5 py-1.5 rounded bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider">AI Estimate</span>
              <button onClick={onHome} className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition">
                <span>🏠</span><span>Home</span>
              </button>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight flex items-center">
              {formData.departureCity} <span className="mx-2 text-slate-400 font-light text-xl">➔</span> {formData.destination}
            </h3>
            <div className="flex flex-wrap gap-2 mt-3.5">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
                <Icons.Calendar className="w-3.5 h-3.5 text-blue-500" /> {formData.days} Days
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
                <Icons.Users className="w-3.5 h-3.5 text-blue-500" /> {formData.travelers} Traveler{formData.travelers > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-600">🛫 {formData.travelStyle}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-[11px] font-bold text-violet-600">🏨 {formData.hotelPreference}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-100 text-[11px] font-bold text-pink-600">🍔 {formData.foodPreference}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-600">🛍️ ₹{Number(formData.shoppingBudget).toLocaleString()}</span>
            </div>
          </div>
          <div className="p-4 md:p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col items-start md:items-end min-w-[200px]">
            <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">Estimated Total</span>
            <div className="text-3xl md:text-4xl font-extrabold text-blue-600 mt-1 tracking-tight">
              {settings.currencySymbol}{activeBudget.totalBudget.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-light">Calculated via AI travel rules</span>
          </div>
        </div>

        {/* Chart + Vouchers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DonutChart activeSlice={activeSlice} setActiveSlice={setActiveSlice} formData={formData} />
          <BudgetVouchers
            formData={formData}
            expandedCategory={expandedCategory}
            setExpandedCategory={setExpandedCategory}
            setActiveSlice={setActiveSlice}
            onCostEdit={onCategoryCostEdit}
            onApplyOption={onApplyOption}
          />
        </div>

        {/* AI Explanation + Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="summary-widget p-6 md:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Icons.Sparkles className="w-4 h-4 text-blue-500 shrink-0" /> AI Valuation Explanation
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{activeBudget.aiExplanation || 'Evaluating details...'}</p>
          </div>
          <div className="summary-widget p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Icons.Lightbulb className="w-5 h-5 text-amber-500 shrink-0" /> Saving Tips
            </h4>
            <div className="space-y-3">
              {activeBudget.savingTips?.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-sm">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">💡</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Trip History */}
      <TripHistorySidebar onLoadTrip={() => {}} />
    </div>
  );
}

function TripHistorySidebar({ onLoadTrip }) {
  const { savedTrips, currentTripId, deleteTrip, clearAllTrips, settings } = useApp();

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="summary-widget p-6 flex flex-col">
        <h4 className="text-base font-bold text-slate-800 flex items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Icons.History className="w-5 h-5 text-blue-500 shrink-0" />
            <span>Trip History</span>
          </div>
          {savedTrips.length > 0 && (
            <button onClick={clearAllTrips} className="text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition flex items-center gap-1">
              <Icons.Trash className="w-3 h-3" /><span>Clear All</span>
            </button>
          )}
        </h4>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {savedTrips.filter(t => (t._id || t.id) !== currentTripId).length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-light">No other trip sheets saved.</div>
          ) : savedTrips.filter(t => (t._id || t.id) !== currentTripId).map(trip => (
            <div key={trip._id || trip.id} onClick={() => onLoadTrip(trip._id || trip.id)}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500/50 bg-slate-50 hover:bg-blue-50/20 cursor-pointer flex items-center justify-between transition">
              <div className="space-y-1 min-w-0 flex-1 pr-2">
                <h5 className="text-xs font-bold text-slate-800 truncate">{trip.details?.destination}</h5>
                <div className="text-[10px] text-slate-400 font-light flex items-center gap-1.5 flex-wrap">
                  <span>{trip.details?.days} Days • {trip.details?.travelers} Pax</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-xs font-extrabold text-blue-600">{settings.currencySymbol}{(trip.budget?.totalBudget || 0).toLocaleString()}</span>
                <button onClick={e => { e.stopPropagation(); deleteTrip(trip._id || trip.id); }} className="p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-rose-500 transition">
                  <Icons.Trash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
