// AI Trip Budget Planner - React Core Redesign (MakeMyTrip Wizard Style)

const { useState, useEffect, useRef, useMemo } = React;

// --- DYNAMIC CUSTOM SVG ICONS ---
const Icons = {
  Plane: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.7.3-1.9 1.1-.2.8.3 1.6 1.1 1.9l9.4 3.1-4 4-3.1-.7c-.5-.1-1 .1-1.3.5l-.8.8c-.3.3-.3.8 0 1.1l3.7 3.7c.3.3.8.3 1.1 0l.8-.8c.4-.3.6-.8.5-1.3l-.7-3.1 4-4 3.1 9.4c.3.8 1.1 1.3 1.9 1.1.8-.2 1.3-1 1.1-1.9z"/>
    </svg>
  ),
  Hotel: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
    </svg>
  ),
  Food: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      <path d="M18 8c.5-.6.8-1.3.8-2a3 3 0 0 0-6 0c0 .7.3 1.4.8 2"/>
    </svg>
  ),
  LocalTransport: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  ),
  Activities: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5 3 6M16 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
      <path d="M13 4.5 21.5 13M19 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
    </svg>
  ),
  Shopping: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Misc: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
    </svg>
  ),
  Emergency: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19V5"/>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
    </svg>
  ),
  Settings: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  History: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5M12 7v5l4 2"/>
    </svg>
  ),
  Sparkles: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
    </svg>
  ),
  Close: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Plus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ArrowRight: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ArrowLeft: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Trash: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  Lightbulb: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6M10 22h4"/>
    </svg>
  ),
  Calendar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Swap: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 3 4 4-4 4M21 7H3M7 21l-4-4 4-4M3 17h18"/>
    </svg>
  ),
  Send: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
};

const CategoryMeta = {
  transportation: { name: 'Flight / Transport', icon: Icons.Plane, color: '#d97706', ticketClass: 'ticket-transport' },
  hotel: { name: 'Accommodation', icon: Icons.Hotel, color: '#7c3aed', ticketClass: 'ticket-hotel' },
  food: { name: 'Food & Dining', icon: Icons.Food, color: '#db2777', ticketClass: 'ticket-food' },
  localTransport: { name: 'Local Travel', icon: Icons.LocalTransport, color: '#0891b2', ticketClass: 'ticket-transit' },
  activities: { name: 'Activities & Visits', icon: Icons.Activities, color: '#059669', ticketClass: 'ticket-activity' },
  shopping: { name: 'Shopping', icon: Icons.Shopping, color: '#e11d48', ticketClass: 'ticket-shopping' },
  miscellaneous: { name: 'Miscellaneous', icon: Icons.Misc, color: '#475569', ticketClass: 'ticket-misc' },
  emergencyFund: { name: 'Emergency Buffer', icon: Icons.Emergency, color: '#dc2626', ticketClass: 'ticket-emergency' }
};

// --- MOCK SMART ENGINE ---
const generateMockBudget = (input) => {
  const travelers = Number(input.travelers) || 1;
  const days = Number(input.days) || 1;
  const shoppingBudget = Number(input.shoppingBudget) || 0;
  const style = input.travelStyle || 'Standard';
  const dest = (input.destination || 'Goa').toLowerCase();
  
  let destFactor = 1.0;
  if (dest.includes('paris') || dest.includes('london') || dest.includes('new york') || dest.includes('europe') || dest.includes('tokyo')) {
    destFactor = 3.5;
  } else if (dest.includes('singapore') || dest.includes('dubai') || dest.includes('bali') || dest.includes('thailand')) {
    destFactor = 2.0;
  } else if (dest.includes('goa') || dest.includes('kerala') || dest.includes('manali')) {
    destFactor = 1.0;
  } else {
    destFactor = 0.8;
  }

  let dailyHotelBase = 1500;
  if (input.hotelPreference === 'Hostel') dailyHotelBase = 600;
  else if (input.hotelPreference === '2-Star') dailyHotelBase = 1200;
  else if (input.hotelPreference === '3-Star') dailyHotelBase = 2500;
  else if (input.hotelPreference === '5-Star') dailyHotelBase = 7000;

  let dailyFoodBase = 800;
  if (input.foodPreference.includes('Fine')) dailyFoodBase = 2000;
  else if (input.foodPreference.includes('Veg')) dailyFoodBase = 600;

  const styleModifier = style === 'Luxury' ? 2.0 : style === 'Budget' ? 0.6 : 1.0;

  const transCost = Math.round((style === 'Luxury' ? 12000 : style === 'Standard' ? 6000 : 2500) * travelers * destFactor);
  const hotelCost = Math.round(dailyHotelBase * days * styleModifier);
  const foodCost = Math.round(dailyFoodBase * days * travelers * styleModifier);
  const localCost = Math.round((style === 'Luxury' ? 1500 : style === 'Standard' ? 600 : 200) * days * travelers * destFactor);
  
  const activitiesCount = (input.activityInterests || []).length || 2;
  const activitiesCost = Math.round(activitiesCount * (style === 'Luxury' ? 3500 : style === 'Standard' ? 1500 : 600) * travelers);
  
  const shoppingCost = shoppingBudget;
  const miscCost = Math.round((hotelCost + foodCost) * 0.08);
  const emergencyCost = Math.round((transCost + hotelCost) * 0.05);

  const total = transCost + hotelCost + foodCost + localCost + activitiesCost + shoppingCost + miscCost + emergencyCost;

  const savingTips = [
    `Choosing accommodation outside the central commercial area in ${input.destination} can reduce your Lodging cost by up to 30%.`,
    `Consider renting local scooters or getting transit combo passes to slash Local Travel expenses in half.`,
    `Explore highly-rated local street food zones and food markets for authentic dishes at 40% less cost.`,
    `Book activities and cruises directly on-site rather than tourist agents to save on commissions.`
  ];

  const aiExplanation = `I have generated a customized ${style} travel budget for your ${days}-day trip to ${input.destination} starting from ${input.departureCity}. The overall projection is ₹${total.toLocaleString('en-IN')} for ${travelers} traveler(s). This is modeled on a ${input.hotelPreference} hotel setup and ${input.foodPreference} dining layout, including sightseeing aligned with your specified interests.`;

  return {
    totalBudget: total,
    currency: 'INR',
    categories: {
      transportation: { cost: transCost, explanation: `Roundtrip flights or premium train tickets from ${input.departureCity} to ${input.destination} for ${travelers} pax.` },
      hotel: { cost: hotelCost, explanation: `${days} nights stay in a comfortable ${input.hotelPreference} accommodation.` },
      food: { cost: foodCost, explanation: `Daily meal plans for ${travelers} travelers matching ${input.foodPreference} dining.` },
      localTransport: { cost: localCost, explanation: `Local taxi rides, car hire, or rental scooters in ${input.destination} for ${days} days.` },
      activities: { cost: activitiesCost, explanation: `Admissions, cruise charges, and sightseeing tours for your chosen activities.` },
      shopping: { cost: shoppingCost, explanation: `Pre-set shopping cap and souvenir allowance.` },
      miscellaneous: { cost: miscCost, explanation: `Cushion for SIM card, minor tips, laundry, and unplanned daily expenses.` },
      emergencyFund: { cost: emergencyCost, explanation: `Emergency buffer (5% of main transit & hotel costs) for peace of mind.` }
    },
    savingTips: savingTips,
    aiExplanation: aiExplanation
  };
};

const handleMockUpdate = (prevBudget, prompt) => {
  const q = prompt.toLowerCase();
  let updated = JSON.parse(JSON.stringify(prevBudget));
  let responseText = "";

  if (q.includes('train') || q.includes('bus') || q.includes('flight') || q.includes('fly')) {
    const oldCost = updated.categories.transportation.cost;
    const newCost = Math.round(oldCost * 0.35);
    updated.categories.transportation.cost = newCost;
    updated.categories.transportation.explanation = "Substituted flights/premium transit with comfortable express train tickets.";
    responseText = `Switched transportation mode to train. This reduced the Flight/Transport cost from ₹${oldCost.toLocaleString()} to ₹${newCost.toLocaleString()}, saving you ₹${(oldCost - newCost).toLocaleString()}!`;
  } else if (q.includes('cheap') || q.includes('hostel') || q.includes('hotel') || q.includes('stay') || q.includes('room')) {
    const oldCost = updated.categories.hotel.cost;
    const newCost = Math.round(oldCost * 0.65);
    updated.categories.hotel.cost = newCost;
    updated.categories.hotel.explanation = "Optimized accommodation to budget-friendly stays or hostels.";
    responseText = `I've downgraded the lodging type to cheaper alternatives. Hotel budget was optimized from ₹${oldCost.toLocaleString()} to ₹${newCost.toLocaleString()} (35% savings).`;
  } else if (q.includes('food') || q.includes('meal') || q.includes('eat') || q.includes('veg')) {
    const oldCost = updated.categories.food.cost;
    const newCost = Math.round(oldCost * 0.7);
    updated.categories.food.cost = newCost;
    updated.categories.food.explanation = "Adjusted to street food spots and local budget diners.";
    responseText = `I adjusted your dining plan to focus on local markets and street vendor hubs, bringing food costs down by 30%.`;
  } else if (q.includes('reduce') || q.includes('cut') || q.includes('decrease') || q.includes('lower') || q.includes('limit') || q.match(/\d+/)) {
    const match = q.match(/(?:to|₹|\$)\s*(\d+k|\d+,\d+|\d+)/);
    let target = 0;
    if (match) {
      let numStr = match[1].replace(/,/g, '');
      if (numStr.endsWith('k')) {
        target = parseFloat(numStr) * 1000;
      } else {
        target = parseInt(numStr);
      }
    }
    
    const currentTotal = updated.totalBudget;
    let scale = 0.8;
    if (target > 0 && target < currentTotal) {
      scale = target / currentTotal;
    }
    
    const categoriesToScale = ['transportation', 'hotel', 'food', 'localTransport', 'activities', 'miscellaneous'];
    categoriesToScale.forEach(cat => {
      updated.categories[cat].cost = Math.round(updated.categories[cat].cost * scale);
      updated.categories[cat].explanation += " (Budget scaled down to meet target limit)";
    });
    
    const oldTotal = currentTotal;
    let newTotal = 0;
    Object.keys(updated.categories).forEach(cat => {
      newTotal += updated.categories[cat].cost;
    });
    updated.totalBudget = newTotal;
    
    responseText = `I have optimized and scaled down individual categories (such as transport, lodging, food, and sightseeing activities) to fit near your target. Total budget is reduced from ₹${oldTotal.toLocaleString()} to ₹${newTotal.toLocaleString()}.`;
  } else if (q.includes('water') || q.includes('sport') || q.includes('activity') || q.includes('adventure') || q.includes('fun')) {
    const oldCost = updated.categories.activities.cost;
    const newCost = oldCost + 3500;
    updated.categories.activities.cost = newCost;
    updated.categories.activities.explanation = "Added premium water sports package and cruise admissions.";
    responseText = `Added high-adrenaline water sports package and local experiences. Activity cost increased from ₹${oldCost.toLocaleString()} to ₹${newCost.toLocaleString()}.`;
  } else {
    responseText = "I've reviewed your request. I updated minor details and added a safety cushion to make sure your travel goals are safe and optimized.";
    updated.categories.emergencyFund.cost += 500;
    updated.categories.emergencyFund.explanation = "Increased slightly to ensure a safety cushion for custom itinerary changes.";
  }

  let total = 0;
  Object.keys(updated.categories).forEach(cat => {
    total += updated.categories[cat].cost;
  });
  updated.totalBudget = total;
  updated.aiExplanation = responseText;

  return updated;
};

// --- CORE APP ---
function App() {
  const [settings, setSettings] = useState({ geminiApiKey: '', defaultCurrency: 'INR', currencySymbol: '₹' });
  const [savedTrips, setSavedTrips] = useState([]);
  
  // Progress Wizard (1 to 5)
  const [formStep, setFormStep] = useState(1);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const [formData, setFormData] = useState({
    destination: '',
    departureCity: '',
    travelers: 1,
    days: 5,
    travelStyle: 'Standard',
    hotelPreference: '3-Star',
    foodPreference: 'Veg + Non-Veg',
    activityInterests: ['Beaches', 'Local Markets'],
    shoppingBudget: 5000,
  });

  const [currentTripId, setCurrentTripId] = useState(null);
  const [activeBudget, setActiveBudget] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedSet = window.TripDatabase.getSettings();
    setSettings(savedSet);
    const trips = window.TripDatabase.getTrips();
    setSavedTrips(trips);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const toggleActivity = (act) => {
    setFormData(prev => {
      const current = prev.activityInterests;
      if (current.includes(act)) {
        return { ...prev, activityInterests: current.filter(x => x !== act) };
      } else {
        return { ...prev, activityInterests: [...current, act] };
      }
    });
  };

  const handleSwapCities = () => {
    setFormData(prev => ({
      ...prev,
      departureCity: prev.destination,
      destination: prev.departureCity
    }));
  };

  const callGeminiAPI = async (payload, systemPrompt, chatHistory = []) => {
    const apiKey = settings.geminiApiKey;
    if (!apiKey) throw new Error("No Gemini API key supplied");

    const contents = [];
    chatHistory.forEach(msg => {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: typeof msg.text === 'object' ? JSON.stringify(msg.text) : msg.text }]
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: JSON.stringify(payload) }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "API request failed");
    }

    const resData = await response.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonStr);
  };

  const handleGenerateBudget = async (customInput = null) => {
    const inputData = customInput || formData;
    if (!inputData.destination || !inputData.departureCity) {
      alert("Please specify Destination and Departure Cities!");
      return;
    }

    setLoading(true);
    setLoadingText('Running GenAI cost planning engines...');
    await new Promise(r => setTimeout(r, 1200));

    try {
      let budgetResult = null;
      if (settings.geminiApiKey) {
        setLoadingText('Processing travel rules via Gemini AI...');
        const systemPrompt = `You are a financial travel budget planner. Generate a customized budget report based on user preferences. Return ONLY a JSON object matching this schema:
        {
          "totalBudget": number,
          "currency": "INR",
          "categories": {
            "transportation": { "cost": number, "explanation": "string" },
            "hotel": { "cost": number, "explanation": "string" },
            "food": { "cost": number, "explanation": "string" },
            "localTransport": { "cost": number, "explanation": "string" },
            "activities": { "cost": number, "explanation": "string" },
            "shopping": { "cost": number, "explanation": "string" },
            "miscellaneous": { "cost": number, "explanation": "string" },
            "emergencyFund": { "cost": number, "explanation": "string" }
          },
          "savingTips": ["string", "string", ...],
          "aiExplanation": "string"
        }
        Do not wrap in anything else except a JSON block.`;

        budgetResult = await callGeminiAPI(inputData, systemPrompt);
      } else {
        budgetResult = generateMockBudget(inputData);
      }

      const initialGreeting = {
        id: 'msg_init',
        sender: 'ai',
        text: budgetResult.aiExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveBudget(budgetResult);
      setChatLog([initialGreeting]);

      const newTrip = {
        title: `${inputData.departureCity} to ${inputData.destination} (${inputData.days} Days)`,
        details: inputData,
        budget: budgetResult,
        chatHistory: [initialGreeting]
      };
      const saved = window.TripDatabase.saveTrip(newTrip);
      setCurrentTripId(saved.id);
      setSavedTrips(window.TripDatabase.getTrips());
      setChatOpen(true);
    } catch (e) {
      alert("Failed to connect via Live API: " + e.message + "\n\nLoading intelligent Demo Mock instead.");
      const budgetResult = generateMockBudget(inputData);
      const initialGreeting = {
        id: 'msg_init_fallback',
        sender: 'ai',
        text: budgetResult.aiExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setActiveBudget(budgetResult);
      setChatLog([initialGreeting]);
      const newTrip = {
        title: `${inputData.departureCity} to ${inputData.destination} (Demo)`,
        details: inputData,
        budget: budgetResult,
        chatHistory: [initialGreeting]
      };
      const saved = window.TripDatabase.saveTrip(newTrip);
      setCurrentTripId(saved.id);
      setSavedTrips(window.TripDatabase.getTrips());
      setChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // (Standard chat update and editing functionality processed exactly as in index.html)
}
