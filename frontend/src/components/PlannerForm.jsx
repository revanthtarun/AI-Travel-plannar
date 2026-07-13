import { useState } from 'react';
import { Icons } from './Icons';
import CityInput from './CityInput';

export default function PlannerForm({ formData, onChange, onSwap, onNext, onBack, onGenerate, formStep, setFormStep }) {
  const steps = [
    { icon: Icons.Plane, label: 'Flights / Transport' },
    { icon: Icons.Hotel, label: 'Hotels' },
    { icon: Icons.Food, label: 'Meals & Dining' },
    { icon: Icons.Activities, label: 'Sightseeing' },
    { icon: Icons.Shopping, label: 'Shopping Limits' }
  ];

  return (
    <div className="search-card rounded-2xl shadow-xl p-6 border border-slate-200 animate-scale-up">
      {/* Step Tabs */}
      <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-100 overflow-x-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} onClick={() => setFormStep(i + 1)} className={`category-tab shrink-0 ${formStep === i + 1 ? 'active' : ''}`}>
              <Icon className="w-5 h-5 mb-1" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[160px]">
        {formStep === 1 && <Step1 formData={formData} onChange={onChange} onSwap={onSwap} onNext={() => {
          if (!formData.departureCity.trim() || !formData.destination.trim()) {
            alert('Departure and Destination cities are required!'); return;
          }
          setFormStep(2);
        }} />}
        {formStep === 2 && <Step2 formData={formData} onChange={onChange} onBack={() => setFormStep(1)} onNext={() => setFormStep(3)} />}
        {formStep === 3 && <Step3 formData={formData} onChange={onChange} onBack={() => setFormStep(2)} onNext={() => setFormStep(4)} />}
        {formStep === 4 && <Step4 formData={formData} onChange={onChange} onBack={() => setFormStep(3)} onNext={() => setFormStep(5)} />}
        {formStep === 5 && <Step5 formData={formData} onChange={onChange} onBack={() => setFormStep(4)} onGenerate={() => onGenerate(formData)} />}
      </div>
    </div>
  );
}

function Step1({ formData, onChange, onSwap, onNext }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-slate-200 rounded-xl relative">
        <CityInput label="From" placeholder="e.g. Hyderabad" value={formData.departureCity} onChange={v => onChange('departureCity', v)} />
        <button onClick={onSwap} className="swap-btn z-40" type="button" title="Swap Cities">
          <Icons.Swap className="w-5 h-5" />
        </button>
        <CityInput label="📍 To (Destination)" placeholder="e.g. Goa" value={formData.destination} onChange={v => onChange('destination', v)} highlight />
        <div className="search-col">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">📅 Travel Date</span>
          <input
            type="date"
            value={formData.travelDate || ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => onChange('travelDate', e.target.value)}
            className="form-input-box bg-transparent border-none w-full font-bold cursor-pointer"
          />
          <span className="block text-xs text-slate-400 mt-1 font-light">Departure date</span>
        </div>
        <div className="search-col">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Days</span>
          <select value={formData.days} onChange={e => onChange('days', Number(e.target.value))} className="form-input-box bg-transparent border-none w-full font-bold">
            {[1,2,3,4,5,6,7,8,9,10,12,14,21,30].map(d => <option key={d} value={d}>{d} Days</option>)}
          </select>
          <span className="block text-xs text-slate-400 mt-1 font-light">Trip length</span>
        </div>
        <div className="search-col bg-indigo-500/5">
          <span className="block text-xs font-black text-indigo-600 uppercase tracking-wider">👥 Travelers & Style</span>
          <div className="flex items-center justify-between mt-1">
            <select value={formData.travelers} onChange={e => onChange('travelers', Number(e.target.value))} className="bg-transparent text-indigo-950 font-black focus:outline-none text-sm mr-2 w-1/2 cursor-pointer">
              {[1,2,3,4,5,6,7,8,9,10].map(t => <option key={t} value={t}>{t} Traveler{t > 1 ? 's' : ''}</option>)}
            </select>
            <select value={formData.travelStyle} onChange={e => onChange('travelStyle', e.target.value)} className="bg-transparent text-indigo-950 font-black focus:outline-none text-sm w-1/2 cursor-pointer">
              {['Budget', 'Standard', 'Luxury'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="block text-xs text-slate-400 mt-1 font-light">Pax count and spending style</span>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 max-w-xl mx-auto">
        <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Choose Preferred Transport Mode</label>
        <div className="grid grid-cols-4 gap-2.5">
          {[{ key: 'Flight', label: '✈️ Flight' }, { key: 'Train', label: '🚆 Train' }, { key: 'Bus', label: '🚌 Bus' }, { key: 'Cab', label: '🚗 Cab' }].map(item => (
            <button key={item.key} type="button" onClick={() => onChange('transportPreference', item.key)}
              className={`py-3 rounded-xl text-xs font-bold border transition ${formData.transportPreference === item.key ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button onClick={onNext} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition">
          <span>Next: Hotel Rating</span><Icons.ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step2({ formData, onChange, onBack, onNext }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 max-w-xl mx-auto">
        <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Select Lodging Class</label>
        <div className="grid grid-cols-4 gap-3">
          {['Hostel', '2-Star', '3-Star', '5-Star'].map(h => (
            <button key={h} type="button" onClick={() => onChange('hotelPreference', h)}
              className={`py-4 rounded-xl text-sm font-bold border transition ${formData.hotelPreference === h ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {h}
            </button>
          ))}
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Next: Dining Style" />
    </div>
  );
}

function Step3({ formData, onChange, onBack, onNext }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 max-w-xl mx-auto">
        <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Select Food Preferences</label>
        <div className="grid grid-cols-3 gap-3">
          {[['Veg', 'Veg'], ['Veg+NonVeg', 'Veg + Non-Veg'], ['Fine Dining', 'Fine Dining']].map(([label, val]) => (
            <button key={val} type="button" onClick={() => onChange('foodPreference', val)}
              className={`py-4 rounded-xl text-sm font-bold border transition ${formData.foodPreference === val ? 'bg-pink-600 border-pink-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Next: Sightseeing" />
    </div>
  );
}

function Step4({ formData, onChange, onBack, onNext }) {
  const activities = ['Beaches', 'Water Sports', 'Cruise', 'Museums', 'Nature / Trekking', 'Nightlife', 'Local Markets'];
  const toggle = (act) => {
    const current = formData.activityInterests;
    onChange('activityInterests', current.includes(act) ? current.filter(x => x !== act) : [...current, act]);
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 max-w-2xl mx-auto">
        <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Select Sightseeing Tags</label>
        <div className="flex flex-wrap justify-center gap-2.5">
          {activities.map(act => {
            const active = formData.activityInterests.includes(act);
            return (
              <button key={act} type="button" onClick={() => toggle(act)}
                className={`px-5 py-3 rounded-full text-xs font-bold border transition flex items-center space-x-1.5 ${active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <span>{active ? '✓' : '+'}</span><span>{act}</span>
              </button>
            );
          })}
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Next: Shopping Limits" />
    </div>
  );
}

function Step5({ formData, onChange, onBack, onGenerate }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {(!formData.destination || !formData.departureCity) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-semibold text-center">
          ⚠️ Go back to Step 1 and enter From &amp; To cities before generating.
        </div>
      )}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs text-blue-700 font-semibold text-center">
        {formData.departureCity || '—'} → {formData.destination || '—'} &nbsp;|&nbsp; {formData.days} Days &nbsp;|&nbsp; {formData.travelers} Traveler(s)
      </div>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 max-w-xl mx-auto text-center">
        <label className="block text-sm font-bold text-slate-700 mb-2">Set Shopping Limit Buffer</label>
        <div className="text-2xl font-black text-blue-600 mb-4">₹{Number(formData.shoppingBudget).toLocaleString()}</div>
        <input type="range" min="0" max="80000" step="1000" value={formData.shoppingBudget}
          onChange={e => onChange('shoppingBudget', e.target.value)}
          className="w-4/5 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer mx-auto block" />
        <div className="flex justify-between w-4/5 mx-auto text-[10px] text-slate-400 mt-2 font-medium">
          <span>No Shopping</span><span>Medium</span><span>High Limit</span>
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t border-slate-100">
        <button onClick={onBack} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center space-x-2 transition">
          <Icons.ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        <button onClick={onGenerate} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg flex items-center space-x-2 hover:scale-[1.03] transition">
          <Icons.Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span>Generate AI Budget</span>
        </button>
      </div>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel }) {
  return (
    <div className="flex justify-between pt-4 border-t border-slate-100">
      <button onClick={onBack} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center space-x-2 transition">
        <Icons.ArrowLeft className="w-5 h-5" /><span>Back</span>
      </button>
      <button onClick={onNext} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition">
        <span>{nextLabel}</span><Icons.ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
