import { useState } from 'react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PlannerForm from '../components/PlannerForm';
import TripCards from '../components/TripCards';
import Dashboard from '../components/Dashboard';
import ChatAssistant from '../components/ChatAssistant';
import SettingsModal from '../components/SettingsModal';

const today = new Date();
const DEFAULT_DATE = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];

const DEFAULT_FORM = {
  destination: '', departureCity: '', travelers: 1, days: 5,
  travelDate: DEFAULT_DATE,
  travelStyle: 'Standard', transportPreference: 'Flight',
  hotelPreference: '3-Star', foodPreference: 'Veg + Non-Veg',
  activityInterests: ['Beaches', 'Local Markets'], shoppingBudget: 5000
};

export default function Home() {
  const {
    settings, activeBudget, setActiveBudget, currentTripId, setCurrentTripId,
    chatLog, setChatLog, loading, setLoading, loadingText, setLoadingText,
    saveTrip, deleteTrip, clearAllTrips
  } = useApp();

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formStep, setFormStep] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));
  const handleSwap = () => setFormData(prev => ({ ...prev, departureCity: prev.destination, destination: prev.departureCity }));

  const handleGenerateBudget = async (customInput = null) => {
    const input = { ...formData, ...(customInput || {}) };
    if (!input.destination?.trim() || !input.departureCity?.trim()) {
      alert('Please specify Destination and Departure Cities!');
      return;
    }

    setLoading(true);
    setLoadingText('Running AI cost planning engines...');
    await new Promise(r => setTimeout(r, 800));

    try {
      setLoadingText('Querying backend planning engines...');
      const { data: budgetResult } = await api.post('/budget/generate', input, {
        headers: { 'x-api-key': settings.geminiApiKey || '' }
      });

      const greeting = {
        id: 'msg_init',
        sender: 'ai',
        text: budgetResult.aiExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveBudget(budgetResult);
      setChatLog([greeting]);
      if (customInput) setFormData(customInput);

      const saved = await saveTrip({
        title: `${input.departureCity} to ${input.destination} (${input.days} Days)`,
        details: input,
        budget: budgetResult,
        chatHistory: [greeting]
      });
      setCurrentTripId(saved._id || saved.id);
      setChatOpen(true);
    } catch (e) {
      alert('Error generating budget: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (text) => {
    if (!text?.trim()) return;
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const history = [...chatLog, userMsg];
    setChatLog(history);
    setChatInput('');
    setLoading(true);
    setLoadingText('Assistant is adjusting travel sheets...');
    await new Promise(r => setTimeout(r, 800));

    try {
      const { data: updated } = await api.post('/budget/generate', formData, {
        headers: { 'x-api-key': settings.geminiApiKey || '' }
      });

      const aiMsg = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'ai',
        text: updated.aiExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalHistory = [...history, aiMsg];
      setActiveBudget(updated);
      setChatLog(finalHistory);

      if (currentTripId) {
        await saveTrip({
          _id: currentTripId,
          title: `${formData.departureCity} to ${formData.destination}`,
          details: formData,
          budget: updated,
          chatHistory: finalHistory
        });
      }
    } catch (err) {
      alert('Error updating budget: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCostEdit = (catKey, val) => {
    const cost = Math.max(0, parseInt(val) || 0);
    setActiveBudget(prev => {
      const updated = {
        ...prev,
        categories: { ...prev.categories, [catKey]: { ...prev.categories[catKey], cost } }
      };
      updated.totalBudget = Object.values(updated.categories).reduce((s, c) => s + c.cost, 0);
      return updated;
    });
  };

  const handleApplyOption = (catKey, price) => {
    handleCostEdit(catKey, price);
    const notifyMsg = {
      id: 'msg_' + Date.now(),
      sender: 'ai',
      text: `Applied ₹${price?.toLocaleString()} for ${catKey}. Total recalculated!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatLog(prev => [...prev, notifyMsg]);
  };

  const handleLoadTrip = async (id) => {
    try {
      const { data: trip } = await api.get(`/trips/${id}`);
      setCurrentTripId(trip._id || trip.id);
      setFormData(trip.details || DEFAULT_FORM);
      setActiveBudget(trip.budget);
      setChatLog(trip.chatHistory || []);
    } catch { /* ignore */ }
  };

  const handleHome = () => {
    setActiveBudget(null);
    setCurrentTripId(null);
    setFormStep(1);
  };

  return (
    <div className="relative min-h-screen pb-20">
      <Header
        onShowSettings={() => setShowSettings(true)}
        onShowHistory={() => {}}
        onHome={handleHome}
      />
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24">
        {!activeBudget ? (
          <div className="space-y-12">
            <PlannerForm
              formData={formData}
              onChange={handleChange}
              onSwap={handleSwap}
              formStep={formStep}
              setFormStep={setFormStep}
              onGenerate={handleGenerateBudget}
            />
            <TripCards
              onGenerate={handleGenerateBudget}
              onLoadTrip={handleLoadTrip}
              onDeleteTrip={deleteTrip}
              onClearAll={clearAllTrips}
            />
          </div>
        ) : (
          <Dashboard
            formData={formData}
            onHome={handleHome}
            onCategoryCostEdit={handleCostEdit}
            onApplyOption={handleApplyOption}
            onLoadTrip={handleLoadTrip}
          />
        )}
      </div>

      {activeBudget && (
        <ChatAssistant
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSendMessage={handleSendChat}
        />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {loading && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-slate-700">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
