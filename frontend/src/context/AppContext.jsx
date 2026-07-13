import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [settings, setSettings] = useState({ geminiApiKey: '', defaultCurrency: 'INR', currencySymbol: '₹' });
  const [savedTrips, setSavedTrips] = useState([]);
  const [activeBudget, setActiveBudget] = useState(null);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('budget_planner_settings');
    if (stored) setSettings(JSON.parse(stored));
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await api.get('/trips');
      setSavedTrips(data);
    } catch {
      const local = localStorage.getItem('budget_planner_trips');
      if (local) setSavedTrips(JSON.parse(local));
    }
  };

  const saveSettings = (newSettings) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$' };
    const updated = { ...newSettings, currencySymbol: symbols[newSettings.defaultCurrency] || '₹' };
    setSettings(updated);
    localStorage.setItem('budget_planner_settings', JSON.stringify(updated));
  };

  const saveTrip = async (tripData) => {
    try {
      let saved;
      if (tripData._id) {
        const { data } = await api.put(`/trips/${tripData._id}`, tripData);
        saved = data;
      } else {
        const { data } = await api.post('/trips', tripData);
        saved = data;
      }
      await fetchTrips();
      return saved;
    } catch {
      return tripData;
    }
  };

  const deleteTrip = async (id) => {
    try {
      await api.delete(`/trips/${id}`);
    } catch { /* ignore */ }
    setSavedTrips(prev => prev.filter(t => (t._id || t.id) !== id));
    if ((currentTripId) === id) { setActiveBudget(null); setCurrentTripId(null); }
  };

  const clearAllTrips = async () => {
    try { await api.delete('/trips'); } catch { /* ignore */ }
    setSavedTrips([]);
    setActiveBudget(null);
    setCurrentTripId(null);
  };

  return (
    <AppContext.Provider value={{
      settings, saveSettings,
      savedTrips, fetchTrips, saveTrip, deleteTrip, clearAllTrips,
      activeBudget, setActiveBudget,
      currentTripId, setCurrentTripId,
      chatLog, setChatLog,
      loading, setLoading,
      loadingText, setLoadingText
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
