import { useApp } from '../context/AppContext';
import { Icons } from './Icons';

export default function TripCards({ onGenerate, onLoadTrip, onDeleteTrip, onClearAll }) {
  const { savedTrips, settings } = useApp();

  return (
    <div className="pt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          Popular Trips & Saved Logs
        </h3>
        {savedTrips.length > 0 && (
          <button onClick={onClearAll} className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition">
            <Icons.Trash className="w-3.5 h-3.5 text-rose-500" /><span>Clear History</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Featured Goa Card */}
        <div onClick={() => onGenerate({ destination: 'Goa', departureCity: 'Hyderabad', travelers: 2, days: 5, travelStyle: 'Standard', transportPreference: 'Flight', hotelPreference: '3-Star', foodPreference: 'Veg + Non-Veg', activityInterests: ['Beaches', 'Water Sports', 'Cruise'], shoppingBudget: 5000 })} className="promo-card cursor-pointer">
          <div className="promo-gradient p-5 text-white flex flex-col justify-between h-40">
            <span className="bg-orange-500 text-[10px] uppercase font-bold tracking-wider rounded px-2 py-0.5 self-start">AI Spotlight</span>
            <div>
              <h4 className="text-lg font-black leading-tight">Hyderabad to Goa Getaway</h4>
              <p className="text-xs text-white/80 font-light mt-1">5 Days • 2 Pax • Beaches, Water Sports & Cruise</p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between text-sm bg-white">
            <span className="text-slate-400 font-light">Projected Cost:</span>
            <span className="font-extrabold text-blue-600">₹57,000</span>
          </div>
        </div>

        {/* Featured Paris Card */}
        <div onClick={() => onGenerate({ destination: 'Paris', departureCity: 'New Delhi', travelers: 1, days: 7, travelStyle: 'Luxury', transportPreference: 'Flight', hotelPreference: '5-Star', foodPreference: 'Fine Dining', activityInterests: ['Museums', 'Nightlife', 'Local Markets'], shoppingBudget: 35000 })} className="promo-card cursor-pointer">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-800 p-5 text-white flex flex-col justify-between h-40">
            <span className="bg-emerald-500 text-[10px] uppercase font-bold tracking-wider rounded px-2 py-0.5 self-start">Premium AI Selection</span>
            <div>
              <h4 className="text-lg font-black leading-tight">Delhi to Paris Luxury Excursion</h4>
              <p className="text-xs text-white/80 font-light mt-1">7 Days • Solo Traveler • Museum Tour & Dining</p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between text-sm bg-white">
            <span className="text-slate-400 font-light">Projected Cost:</span>
            <span className="font-extrabold text-violet-600">₹3,45,000</span>
          </div>
        </div>

        {/* Saved Trips */}
        {savedTrips.slice(0, 4).map(trip => (
          <div key={trip._id || trip.id} onClick={() => onLoadTrip(trip._id || trip.id)} className="promo-card cursor-pointer relative">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-5 text-white flex flex-col justify-between h-40">
              <div className="flex justify-between items-center">
                <span className="bg-blue-600 text-[9px] font-bold tracking-wider rounded px-2 py-0.5">
                  🕒 {trip.createdAt ? new Date(trip.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
                <button onClick={e => { e.stopPropagation(); onDeleteTrip(trip._id || trip.id); }} className="p-1 rounded bg-white/10 border border-white/20 text-white hover:bg-rose-500 transition">
                  <Icons.Trash className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h4 className="text-lg font-black leading-tight truncate">{trip.details?.destination} Trip</h4>
                <p className="text-xs text-white/80 font-light mt-1 truncate">
                  {trip.details?.days} Days • {trip.details?.travelers} Traveler(s) • From {trip.details?.departureCity}
                </p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-sm bg-white">
              <span className="text-slate-400 font-light">Est. Budget:</span>
              <span className="font-extrabold text-slate-800">{settings.currencySymbol}{(trip.budget?.totalBudget || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
