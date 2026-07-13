const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const TRIPS_FILE = path.join(__dirname, 'trips.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (index.html, style.css, etc.)

// Helper to read trips database from file
function readTripsDatabase() {
  try {
    if (!fs.existsSync(TRIPS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TRIPS_FILE, 'utf8');
    if (!data.trim()) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading trips database file:", e);
    return [];
  }
}

// Helper to write trips database to file
function writeTripsDatabase(trips) {
  try {
    fs.writeFileSync(TRIPS_FILE, JSON.stringify(trips, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error writing trips database file:", e);
    return false;
  }
}

// POPULAR CITIES DICTIONARY
const POPULAR_CITIES = [
  { name: 'Hyderabad', code: 'HYD', country: 'India', desc: 'Rajiv Gandhi Intl Airport' },
  { name: 'Delhi', code: 'DEL', country: 'India', desc: 'Indira Gandhi Intl Airport' },
  { name: 'Goa', code: 'GOI', country: 'India', desc: 'Dabolim / Mopa Airport' },
  { name: 'Mumbai', code: 'BOM', country: 'India', desc: 'Chhatrapati Shivaji Maharaj Intl' },
  { name: 'Bangalore', code: 'BLR', country: 'India', desc: 'Kempegowda Intl Airport' },
  { name: 'Chennai', code: 'MAA', country: 'India', desc: 'Chennai Intl Airport' },
  { name: 'Manali', code: 'BHU', country: 'India', desc: 'Bhuntar Airport (Kullu/Manali)' },
  { name: 'Shimla', code: 'SLV', country: 'India', desc: 'Shimla Airport' },
  { name: 'Kolkata', code: 'CCU', country: 'India', desc: 'Netaji Subhash Chandra Bose Intl' },
  { name: 'Jaipur', code: 'JAI', country: 'India', desc: 'Jaipur Intl Airport' },
  { name: 'Pune', code: 'PNQ', country: 'India', desc: 'Pune Intl Airport' },
  { name: 'Kochi', code: 'COK', country: 'India', desc: 'Cochin Intl Airport' },
  { name: 'Ahmedabad', code: 'AMD', country: 'India', desc: 'Sardar Vallabhbhai Patel Intl' },
  { name: 'Amritsar', code: 'ATQ', country: 'India', desc: 'Sri Guru Ram Dass Jee Intl' },
  { name: 'Paris', code: 'CDG', country: 'France', desc: 'Charles de Gaulle Airport' },
  { name: 'London', code: 'LHR', country: 'United Kingdom', desc: 'Heathrow Airport' },
  { name: 'Singapore', code: 'SIN', country: 'Singapore', desc: 'Changi Airport' },
  { name: 'Dubai', code: 'DXB', country: 'United Arab Emirates', desc: 'Dubai Intl Airport' },
  { name: 'Maldives', code: 'MLE', country: 'Maldives', desc: 'Velana Intl Airport' },
  { name: 'Bangkok', code: 'BKK', country: 'Thailand', desc: 'Suvarnabhumi Airport' },
  { name: 'Tokyo', code: 'NRT', country: 'Japan', desc: 'Narita Intl Airport' },
  { name: 'New York', code: 'JFK', country: 'United States', desc: 'John F. Kennedy Intl Airport' },
  { name: 'Dehradun', code: 'DED', country: 'India', desc: 'Jolly Grant Airport' },
  { name: 'Chandigarh', code: 'IXC', country: 'India', desc: 'Chandigarh Airport' },
  { name: 'Kalka', code: 'KLK', country: 'India', desc: 'Kalka Railway Station' },
  { name: 'Agra', code: 'AGR', country: 'India', desc: 'Kheria Airport / Taj Mahal' },
  { name: 'Pondicherry', code: 'PNY', country: 'India', desc: 'Pondicherry Airport' },
  { name: 'Srinagar', code: 'SXR', country: 'India', desc: 'Sheikh ul-Alam Intl Airport' },
  { name: 'Leh', code: 'IXL', country: 'India', desc: 'Kushok Bakula Rimpochee Airport' },
  { name: 'Ooty', code: 'CBE', country: 'India', desc: 'Coimbatore Airport (Ooty Transit)' },
  { name: 'Munnar', code: 'COK', country: 'India', desc: 'Cochin Airport (Munnar Transit)' }
];

// SERVER-SIDE MOCK GENERATOR LOGIC
function generateMockBudgetServer(input) {
  const travelers = Number(input.travelers) || 1;
  const days = Number(input.days) || 5;
  const style = input.travelStyle || 'Standard';
  const shoppingBudget = Number(input.shoppingBudget) || 5000;

  // Compute destination factor
  let destFactor = 1.0;
  const lowerDest = (input.destination || '').toLowerCase();
  if (lowerDest.includes('paris') || lowerDest.includes('london') || lowerDest.includes('europe')) destFactor = 5.2;
  else if (lowerDest.includes('singapore') || lowerDest.includes('dubai')) destFactor = 3.5;
  else if (lowerDest.includes('maldives')) destFactor = 4.2;
  else if (lowerDest.includes('goa') || lowerDest.includes('manali') || lowerDest.includes('shimla')) destFactor = 1.2;

  let dailyHotelBase = 2500;
  if (input.hotelPreference === 'Hostel') dailyHotelBase = 600;
  else if (input.hotelPreference === '2-Star') dailyHotelBase = 1200;
  else if (input.hotelPreference === '3-Star') dailyHotelBase = 2500;
  else if (input.hotelPreference === '5-Star') dailyHotelBase = 7000;

  let dailyFoodBase = 800;
  if (input.foodPreference.includes('Fine')) dailyFoodBase = 2000;
  else if (input.foodPreference.includes('Veg')) dailyFoodBase = 600;

  const styleModifier = style === 'Luxury' ? 2.0 : style === 'Budget' ? 0.6 : 1.0;

  // Calculate independent base fares for each transit mode
  const flightFare = Math.round((style === 'Luxury' ? 12000 : style === 'Standard' ? 6000 : 3500) * travelers * destFactor);
  const trainFare = Math.round((style === 'Luxury' ? 4500 : style === 'Standard' ? 2200 : 1000) * travelers);
  const busFare = Math.round((style === 'Luxury' ? 2500 : style === 'Standard' ? 1400 : 800) * travelers);
  const cabFare = Math.round((style === 'Luxury' ? 7000 : style === 'Standard' ? 4000 : 2000) * travelers * destFactor);

  // Set default transCost based on user preference
  const pref = input.transportPreference || 'Flight';
  let transCost = flightFare;
  if (pref === 'Train') transCost = trainFare;
  else if (pref === 'Bus') transCost = busFare;
  else if (pref === 'Cab') transCost = cabFare;

  const hotelCost = Math.round(dailyHotelBase * days * styleModifier);
  const foodCost = Math.round(dailyFoodBase * days * travelers * styleModifier);
  const localCost = Math.round((style === 'Luxury' ? 1500 : style === 'Standard' ? 600 : 200) * days * travelers * destFactor);
  const activitiesCount = (input.activityInterests || []).length || 2;
  const activitiesCost = Math.round(activitiesCount * (style === 'Luxury' ? 3500 : style === 'Standard' ? 1500 : 600) * travelers);
  const shoppingCost = shoppingBudget;
  const miscCost = Math.round((hotelCost + foodCost) * 0.08);
  const emergencyCost = Math.round((transCost + hotelCost) * 0.05);
  const total = transCost + hotelCost + foodCost + localCost + activitiesCost + shoppingCost + miscCost + emergencyCost;

  const fromCity = (input.departureCity || 'Hyderabad').trim();
  const toCity = (input.destination || 'Goa').trim();
  const destKey = toCity.toLowerCase();
  
  let fromCode = fromCity.slice(0, 3).toUpperCase();
  let toCode = toCity.slice(0, 3).toUpperCase();
  if (fromCity.toLowerCase().includes('hyderabad')) fromCode = 'HYD';
  if (fromCity.toLowerCase().includes('delhi')) fromCode = 'DEL';
  if (fromCity.toLowerCase().includes('goa')) fromCode = 'GOI';
  if (fromCity.toLowerCase().includes('mumbai')) fromCode = 'BOM';
  if (fromCity.toLowerCase().includes('bangalore')) fromCode = 'BLR';
  if (fromCity.toLowerCase().includes('chennai')) fromCode = 'MAA';
  
  if (destKey.includes('goa')) toCode = 'GOI';
  else if (destKey.includes('delhi')) toCode = 'DEL';
  else if (destKey.includes('mumbai')) toCode = 'BOM';
  else if (destKey.includes('bangalore')) toCode = 'BLR';
  else if (destKey.includes('manali')) toCode = 'BHU';
  else if (destKey.includes('shimla')) toCode = 'SLV';
  else if (destKey.includes('paris')) toCode = 'CDG';
  else if (destKey.includes('london')) toCode = 'LHR';
  else if (destKey.includes('singapore')) toCode = 'SIN';

  let transOptions = [];
  let hotelOptions = [];
  let foodOptions = [];
  let localOptions = [];
  let activityOptionsList = [];

  if (destKey.includes('goa')) {
    transOptions = [
      { name: `IndiGo Flight 6E-241 (Direct)`, type: 'Flight', time: "06:15 AM - 07:40 AM (1h 25m)", price: flightFare, details: `Direct flight. Dep: ${fromCode}, Arr: ${toCode} (Mopa GOX). Cabin bags included.` },
      { name: `Air India AI-842 (Best Value)`, type: 'Flight', time: "11:30 AM - 01:05 PM (1h 35m)", price: Math.round(flightFare * 1.1), details: `Direct flight. Dep: ${fromCode}, Arr: ${toCode}. Hot meals & 15kg checked luggage included.` },
      { name: `Goa Express Train (12780)`, type: 'Train', time: "12:45 PM - 05:40 AM (+1) (16h 55m)", price: trainFare, details: `Third AC Sleeper berths (IRCTC reservation) to Madgaon Station (MAO).` },
      { name: `IntrCity SmartBus Sleeper (A/C)`, type: 'Bus', time: "05:30 PM - 08:30 AM (+1) (15h)", price: busFare, details: `Premium A/C Sleeper, charging ports, live tracking, water bottle provided.` },
      { name: `Self-Drive SUV Rental / Road Cab`, type: 'Cab', time: "Flexible Departure", price: cabFare, details: `Private outstation door-to-door cab or self-drive vehicle from source to Goa.` }
    ];
    
    hotelOptions = [
      { name: `Zostel Goa (Vagator Hostel)`, rating: "4.6", reviews: "1.1k", time: "Check-in: 12:00 PM", price: Math.round(hotelCost * 0.4), details: `Vibrant backpacker social beds, community cafe, high-speed Wi-Fi, near Vagator beach.` },
      { name: `Fairfield by Marriott Goa Baga (3-Star)`, rating: "4.2", reviews: "850", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 0.95), details: `Double room, pool views, complimentary buffet breakfast, near Baga beach.` },
      { name: `Taj Exotica Resort & Spa Goa (5-Star Luxury)`, rating: "4.8", reviews: "1.5k", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 2.2), details: `Ocean-view luxury villas, private beach access in Benaulim, fine-dining restaurants.` }
    ];
    
    foodOptions = [
      { name: `Beachside Fish Shacks (Calangute/Baga)`, rating: "4.1", reviews: "920", cuisine: "Goan Seafood & Drinks", tier: "₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.5), details: `Budget seafood shacks offering authentic Goan vindaloo, fish curry, and sea breeze.` },
      { name: `Britto's Beach Cafe (Baga)`, rating: "4.3", reviews: "1.4k", cuisine: "Multi-Cuisine Seafood", tier: "₹₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.9), details: `Famous beach restaurant, popular for continental meals, seafood platters, and desserts.` },
      { name: `The Fisherman's Wharf (Premium Dining)`, rating: "4.6", reviews: "2.1k", cuisine: "Goan Premium Fusion", tier: "₹₹₹", time: "Dinner Buffet", price: Math.round(foodCost * 1.6), details: `Riverside fine dining, Goan fusion menus, live music tables, and upscale family seating.` }
    ];
    
    localOptions = [
      { name: `Activa / Vespa Scooter Rental`, time: "Per day rental", price: Math.round(localCost * 0.4), details: `Rent scooters locally to roam beaches easily. Standard fuel cost excluded. Helmet provided.` },
      { name: `Thar / Creta Self-Drive SUV`, time: "Per day rental", price: Math.round(localCost * 1.8), details: `Self-drive open jeep rental, perfect for beach road trips. Unlimited kilometers.` },
      { name: `Goa Miles Prepaid App Cab`, time: "On-demand booking", price: Math.round(localCost * 0.9), details: `Government-monitored flat-rate prepaid app cabs. Safest taxi option.` }
    ];
    
    activityOptionsList = [
      { name: `Premium Water Sports Combo Pack`, time: "Half Day (09:00 AM)", price: Math.round(activitiesCost * 1.1), details: `Parasailing, jet ski, banana boat ride, and speed boat spin on Calangute Beach.` },
      { name: `Mandovi Sunset Cruise with Folk Dance`, time: "05:30 PM - 07:00 PM", price: Math.round(activitiesCost * 0.45), details: `1.5 hrs luxury cruise liner, cultural Goan folk dances, DJ music and welcome drinks.` },
      { name: `North Goa Historic Churches & Spice Plantation`, time: "Full Day Tour", price: Math.round(activitiesCost * 0.6), details: `Guided tour of Basilica of Bom Jesus, spice farm buffet lunch, and elephant showers.` }
    ];
  } else if (destKey.includes('delhi')) {
    transOptions = [
      { name: `Vistara Flight UK-812 (Direct)`, type: 'Flight', time: "07:30 AM - 09:40 AM (2h 10m)", price: flightFare, details: `Direct flight. Dep: ${fromCode}, Arr: ${toCode} (IGIA T3). Full hot meals & luggage included.` },
      { name: `IndiGo Flight 6E-2051 (Best Value)`, type: 'Flight', time: "02:15 PM - 04:30 PM (2h 15m)", price: Math.round(flightFare * 0.9), details: `Direct flight. Dep: ${fromCode}, Arr: ${toCode}. Standard check-in bag included.` },
      { name: `Nizamuddin Rajdhani Express (12437)`, type: 'Train', time: "12:45 PM - 05:55 AM (+1) (17h 10m)", price: trainFare, details: `Superfast premium 2nd AC sleeper, hot pantry meals and bedding included.` },
      { name: `Zingbus Multi-Axle Premium Sleeper (A/C)`, type: 'Bus', time: "04:30 PM - 09:30 AM (+1) (17h)", price: busFare, details: `Premium multi-axle sleeper bus, charging slots, blankets, and CCTV.` },
      { name: `Outstation Chauffeur Sedan Cab`, type: 'Cab', time: "Flexible Departure", price: cabFare, details: `Private door-to-door highway AC cab with professional driver.` }
    ];
    
    hotelOptions = [
      { name: `Zostel Delhi (Paharganj Metro Hub)`, rating: "4.5", reviews: "940", time: "Check-in: 12:00 PM", price: Math.round(hotelCost * 0.4), details: `Social dorms, co-working lounge, terrace cafe, walking distance to metro.` },
      { name: `Radisson Blu Connaught Place (3-Star Premium)`, rating: "4.3", reviews: "620", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 0.95), details: `Executive room, central Delhi hub location, buffet breakfast, fitness center.` },
      { name: `The Leela Palace New Delhi (5-Star Luxury)`, rating: "4.9", reviews: "1.8k", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 2.2), details: `Royal club rooms, rooftop infinity pool, butler service, heritage-rich luxury suites.` }
    ];
    
    foodOptions = [
      { name: `Chandni Chowk Old Delhi Street Food`, rating: "4.5", reviews: "2.5k", cuisine: "North Indian Snacks", tier: "₹", time: "Lunch / Snacks", price: Math.round(foodCost * 0.4), details: `Paranthe Wali Gali, famous spicy chaat, jalebis, and Karim's kebabs.` },
      { name: `Connaught Place Popular Cafes`, rating: "4.4", reviews: "1.1k", cuisine: "Modern Fusion Bistro", tier: "₹₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.85), details: `Multi-cuisine dine-ins, local craft beers, and trendy continental bistros.` },
      { name: `Bukhara - ITC Maurya (World-Famous Dining)`, rating: "4.8", reviews: "3.2k", cuisine: "North-West Frontier", tier: "₹₹₹", time: "Dinner Reservation", price: Math.round(foodCost * 1.8), details: `Iconic North-West frontier cuisine, tandoori lamb leg, and signature Dal Bukhara.` }
    ];
    
    localOptions = [
      { name: `Delhi Metro Smart Card Pass`, time: "All day pass", price: Math.round(localCost * 0.2), details: `Fastest traffic-free travel across Delhi NCR. High-frequency AC trains.` },
      { name: `Chauffeur-Driven Uber Premier Sedan`, time: "8 hours package", price: Math.round(localCost * 1.5), details: `Sedan car at service, perfect for city monuments tour. Air-conditioned.` },
      { name: `Auto-Rickshaw Hop-on Rides`, time: "Short distance transit", price: Math.round(localCost * 0.5), details: `Standard local auto rides, convenient for short lanes in markets.` }
    ];
    
    activityOptionsList = [
      { name: `Historical Monuments Guided Pass`, time: "09:00 AM - 04:00 PM", price: Math.round(activitiesCost * 0.6), details: `Priority entry passes for Red Fort, Qutub Minar, and Humayun's Tomb.` },
      { name: `Akshardham Temple Exhibition & Water Show`, time: "03:00 PM - 08:00 PM", price: Math.round(activitiesCost * 0.4), details: `Robotic exhibitions, IMAX theater, and musical water fountain show.` },
      { name: `Gurgaon CyberHub Dinner & Pub Tour`, time: "Evening Special", price: Math.round(activitiesCost * 1.0), details: `Visit CyberHub, live music theater show, and premium global food outlets.` }
    ];
  } else if (destKey.includes('manali') || destKey.includes('shimla') || destKey.includes('dharamshala')) {
    transOptions = [
      { name: `Alliance Air Flight (Delhi to Bhuntar UUU)`, type: 'Flight', time: "06:10 AM - 07:30 AM (1h 20m)", price: flightFare, details: `Flight to Bhuntar Airport near Manali. Scenic views, mountain limits apply.` },
      { name: `UNESCO Kalka-Shimla Toy Train Ride`, type: 'Train', time: "12:10 PM - 05:20 PM (5h 10m)", price: trainFare, details: `Heritage toy train through 103 tunnels and scenic valley views.` },
      { name: `Laxmi Holidays Volvo Semi-Sleeper (A/C)`, type: 'Bus', time: "08:30 PM - 08:00 AM (+1) (11h 30m)", price: busFare, details: `Overnight Volvo bus from Delhi. Blankets, mineral water & charging ports.` },
      { name: `Outstation Hill Cab Swift / Ertiga`, type: 'Cab', time: "Flexible Departure", price: cabFare, details: `Private taxi with driver experienced in mountain road navigation.` }
    ];
    
    hotelOptions = [
      { name: `Alt Life Hostel Manali (Old Manali)`, rating: "4.6", reviews: "450", time: "Check-in: 12:00 PM", price: Math.round(hotelCost * 0.4), details: `Cozy wooden dorm cabins, Beas river view, local live music, community kitchen.` },
      { name: `Solang Valley Ski Resort (3-Star Premium)`, rating: "4.2", reviews: "380", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 0.95), details: `Double deluxe valley rooms, snow peak views, complimentary buffet dinner.` },
      { name: `Span Resort & Spa Manali (5-Star Luxury)`, rating: "4.8", reviews: "730", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 2.2), details: `Luxury wood chalets by the river bank, heated pool, spa massage, private orchard lawns.` }
    ];
    
    foodOptions = [
      { name: `Old Manali Riverside Cafes`, rating: "4.4", reviews: "680", cuisine: "Himachali Cafe & Trout", tier: "₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.6), details: `Bohemian cafes serving hot wood-fired pizzas, local trout fish, and acoustic bands.` },
      { name: `Mall Road Himachali Food Hubs`, rating: "4.1", reviews: "520", cuisine: "Himachali Comfort Food", tier: "₹₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.9), details: `Local Siddus with ghee, steamed momos, hot thukpas, and traditional food.` },
      { name: `Span Premium Dining Room`, rating: "4.7", reviews: "310", cuisine: "Premium Trout & Global", tier: "₹₹₹", time: "Fine Dining Dinner", price: Math.round(foodCost * 1.7), details: `Rooftop glasshouse diner with mountain views. Multi-cuisine gourmet dishes.` }
    ];
    
    localOptions = [
      { name: `Royal Enfield Himalayan Bike Rental`, time: "Per day rental", price: Math.round(localCost * 0.7), details: `Perfect mountain cruiser bike. Excludes fuel cost. Helmets provided.` },
      { name: `Local Swift Cab (Rohtang & Solang Tour)`, time: "8 hours daily package", price: Math.round(localCost * 1.5), details: `Hatchback with experienced local driver for Solang Valley and Rohtang pass.` },
      { name: `Himachal State Local Shuttle Bus`, time: "Point-to-point transit", price: Math.round(localCost * 0.3), details: `State-run local shuttle buses linking Manali to Kullu, Solang, and Mall Road.` }
    ];
    
    activityOptionsList = [
      { name: `Solang Valley Paragliding & Zipline Pack`, time: "09:00 AM - 02:00 PM", price: Math.round(activitiesCost * 0.9), details: `Tandem flight from high cliff with instructor, giant zipline, and ropeway ticket.` },
      { name: `Rohtang Pass Snow Excursion & Skiing`, time: "Full Day Tour", price: Math.round(activitiesCost * 1.5), details: `Requires permit. Ride to 13,000 ft, rental snow jacket/boots, and ski training.` },
      { name: `Jogini Waterfall Trek & Vashisht Hot Springs`, time: "Day Trek", price: Math.round(activitiesCost * 0.3), details: `3km scenic pine forest trek to waterfalls, guide included. Dip in hot sulfur springs.` }
    ];
  } else if (destKey.includes('paris') || destKey.includes('london') || destKey.includes('europe') || destKey.includes('singapore') || destKey.includes('dubai') || destKey.includes('maldives')) {
    let carrier = "Air India / Singapore Airlines";
    if (destKey.includes('paris')) carrier = "Air France AF-225";
    else if (destKey.includes('london')) carrier = "British Airways BA-138";
    else if (destKey.includes('dubai')) carrier = "Emirates EK-527";
    else if (destKey.includes('maldives')) carrier = "IndiGo 6E-1793";
    
    transOptions = [
      { name: `${carrier} (Roundtrip Economy)`, type: 'Flight', time: "Direct Flight (8h / 4.5h)", price: flightFare, details: `International economy. In-flight meals, entertainment screens, and 23kg checked luggage.` },
      { name: `Eurostar High-Speed International Train`, type: 'Train', time: "2h 15m cross-border", price: trainFare, details: `Premium international high-speed express train connects major European nodes (e.g. London-Paris).` },
      { name: `FlixBus Europe Overnight Sleeper Coach`, type: 'Bus', time: "09:30 PM - 06:30 AM (+1) (9h)", price: busFare, details: `Overnight coach. Reclining sleeper seats, USB ports, Wi-Fi, on-board washroom.` },
      { name: `International Premium Chauffeur Airport Cab`, type: 'Cab', time: "Airport pick-up", price: cabFare, details: `Premium private airport connection directly to your central hotel stay.` }
    ];
    
    let hostelName = "Generator Boutique Hostel";
    let hotelName3 = "Mercure Hotel Plaza (3-Star)";
    let hotelName5 = "The Ritz Luxury Palace (5-Star)";
    let hRating1 = "4.4", hRev1 = "2.1k";
    let hRating3 = "4.2", hRev3 = "1.5k";
    let hRating5 = "4.9", hRev5 = "3.1k";
    if (destKey.includes('maldives')) {
      hostelName = "Maafushi Local Guest House";
      hotelName3 = "Arena Beach Resort (3-Star)";
      hotelName5 = "Kurumba Maldives Water Villa (5-Star)";
      hRating1 = "4.2"; hRev1 = "430";
      hRating3 = "4.5"; hRev3 = "920";
      hRating5 = "4.8"; hRev5 = "1.2k";
    } else if (destKey.includes('singapore')) {
      hostelName = "Wink Capsule Hostel Chinatown";
      hotelName3 = "Hotel Boss Singapore (3-Star)";
      hotelName5 = "Marina Bay Sands Luxury Club (5-Star)";
      hRating1 = "4.3"; hRev1 = "890";
      hRating3 = "4.1"; hRev3 = "2.5k";
      hRating5 = "4.8"; hRev5 = "4.8k";
    }
    
    hotelOptions = [
      { name: hostelName, rating: hRating1, reviews: hRev1, time: "Check-in: 03:00 PM", price: Math.round(hotelCost * 0.4), details: `Shared boutique bunk beds, city center location, high-speed Wi-Fi, community social cafe.` },
      { name: hotelName3, rating: hRating3, reviews: hRev3, time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 0.95), details: `Standard double room, city views, complimentary hot breakfast bar.` },
      { name: hotelName5, rating: hRating5, reviews: hRev5, time: "Check-in: 03:00 PM", price: Math.round(hotelCost * 2.2), details: `Luxury suites, rooftop infinity pools, absolute premium service, butler on call.` }
    ];
    
    foodOptions = [
      { name: `Local Street Markets & Food Courts`, rating: "4.4", reviews: "3.5k", cuisine: "Local Street Eats", tier: "₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.5), details: `Affordable food hubs (e.g., Lau Pa Sat in Singapore, local bakeries in Paris).` },
      { name: `Casual Dine-In Bistro & Cafe`, rating: "4.2", reviews: "1.1k", cuisine: "Regional Cuisines", tier: "₹₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.95), details: `Standard table service, popular local multi-cuisine menus, city center views.` },
      { name: `Fine Dining Restaurant reservation`, rating: "4.7", reviews: "940", cuisine: "Gourmet International", tier: "₹₹₹", time: "Dinner (08:00 PM)", price: Math.round(foodCost * 1.8), details: `Michelin star or premium dining reservation. Exceptional culinary experiences.` }
    ];
    
    localOptions = [
      { name: `Subway/Metro Tourist Rail Pass`, time: "All day pass", price: Math.round(localCost * 0.35), details: `Unlimited transit across metro and bus routes. Quickest traffic-free travel.` },
      { name: `City Ride-Share Taxi App (Uber/Grab)`, time: "On-demand booking", price: Math.round(localCost * 1.3), details: `App-based safe taxi pick-up. Direct to destination.` },
      { name: `Local City Bicycle Share pass`, time: "Per day rental", price: Math.round(localCost * 0.25), details: `Pick up/drop off bikes from street docks. Ideal for parks.` }
    ];
    
    activityOptionsList = [
      { name: `Iconic Landmark Tickets & Priority Pass`, time: "09:00 AM - 05:00 PM", price: Math.round(activitiesCost * 0.8), details: `Fast-track tickets for Eiffel Tower, London Eye, or Universal Studios.` },
      { name: `Guided City Walking Tour & History`, time: "Half Day Tour", price: Math.round(activitiesCost * 0.4), details: `Guided historical group walk through central monuments and heritage sites.` },
      { name: `Exclusive Evening Dinner Cruise / Show`, time: "07:30 PM - 10:00 PM", price: Math.round(activitiesCost * 1.2), details: `Scenic dinner cruise with 3-course meal or premium theater tickets.` }
    ];
  } else {
    transOptions = [
      { name: `SpiceJet / Akasa Air Flight (Direct)`, type: 'Flight', time: "08:00 AM - 10:00 AM (2h)", price: flightFare, details: `Direct flight. Dep: ${fromCode}, Arr: ${toCode}. Standard checked luggage slots.` },
      { name: `IndiGo Flight (Best Value)`, type: 'Flight', time: "05:00 PM - 07:10 PM (2h 10m)", price: Math.round(flightFare * 1.1), details: `Direct flight. Dep: ${fromCode}, Arr: ${toCode}. Clean seating, snack box included.` },
      { name: `Express Mail Train AC 3-Tier Sleeper`, type: 'Train', time: "09:00 PM - 01:00 PM (+1) (16h)", price: trainFare, details: `Overnight journey. Third AC Sleeper berths (IRCTC reservations).` },
      { name: `KSRTC/Sleeper Bus Operator (A/C)`, type: 'Bus', time: "07:00 PM - 08:30 AM (+1) (13.5h)", price: busFare, details: `Overnight sleeper coach. A/C Sleeper berth with clean bed sheets, charging sockets, water.` },
      { name: `Self-Drive Car Rental / Road Cab`, type: 'Cab', time: "Flexible Departure", price: cabFare, details: `Standard sedan car outstation rental including toll fees.` }
    ];
    
    hotelOptions = [
      { name: `Backpacker Social Hostel`, rating: "4.3", reviews: "210", time: "Check-in: 12:00 PM", price: Math.round(hotelCost * 0.4), details: `Shared bunk setups, high-speed Wi-Fi, and dynamic young travelers lounge.` },
      { name: `Lemon Tree Premier (Standard 3-Star)`, rating: "4.1", reviews: "850", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 0.95), details: `Double room, business center, pool access, free buffet breakfast.` },
      { name: `The Oberoi / ITC Grand (5-Star Luxury)`, rating: "4.8", reviews: "1.1k", time: "Check-in: 02:00 PM", price: Math.round(hotelCost * 2.2), details: `Chamber suites, butler services, heritage walk guides, and swimming pools.` }
    ];
    
    foodOptions = [
      { name: `Local Street Markets & Diners`, rating: "4.2", reviews: "450", cuisine: "Local Dishes", tier: "₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.5), details: `Popular regional food hubs, local snacks, and authentic dishes.` },
      { name: `Standard Casual Dine-in Cafes`, rating: "4.1", reviews: "620", cuisine: "Multi-Cuisine Buffet", tier: "₹₹", time: "Lunch / Dinner", price: Math.round(foodCost * 0.95), details: `Standard table service, popular local multi-cuisine continental and Indian buffet options.` },
      { name: `Premium Family Dine-in (Fine Dining)`, rating: "4.6", reviews: "890", cuisine: "Heritage Gourmet", tier: "₹₹₹", time: "Dinner Reservation", price: Math.round(foodCost * 1.6), details: `Fine dining, live music tables, and upscale chef special dishes.` }
    ];
    
    localOptions = [
      { name: `Prepaid Ola/Uber App Cab`, time: "On-demand booking", price: Math.round(localCost * 0.9), details: `App-based flat rate local city rides. Fast and transparent.` },
      { name: `Self-Drive Car Rental Drive`, time: "Per day rental", price: Math.round(localCost * 1.6), details: `Flexible self-drive city car rental. Unlimited kilometers.` },
      { name: `Local City Auto-Rickshaw Rides`, time: "Point-to-point transit", price: Math.round(localCost * 0.3), details: `Standard local auto rides. Quick and highly accessible.` }
    ];
    
    activityOptionsList = [
      { name: `Guided Local Monuments & Palace Pass`, time: "09:30 AM - 04:30 PM", price: Math.round(activitiesCost * 0.6), details: `Entry passes for palace fort museums, local art galleries, and historic sites.` },
      { name: `Popular Cultural Light & Sound Show`, time: "07:00 PM - 08:30 PM", price: Math.round(activitiesCost * 0.4), details: `Evening sound light show telling regional history, seats reserved.` },
      { name: `Local Adventure Activity/Theme Park Pass`, time: "Day Ticket", price: Math.round(activitiesCost * 1.1), details: `Access passes to amusement parks or custom outdoor adventure camps.` }
    ];
  }

  // Choose primary option as default for each category
  const selectedTrans = transOptions.find(o => o.type === pref) || transOptions[0];
  const selectedHotel = hotelOptions.find(o => o.name.toLowerCase().includes(input.hotelPreference.toLowerCase())) || hotelOptions[0];
  const selectedFood = foodOptions[0]; // first one is default
  const selectedLocal = localOptions[0];
  const selectedActivity = activityOptionsList[0];

  const responseText = `Here is a custom budget plan generated by your Node.js backend. Selected transportation: ${selectedTrans.name}, and lodging at ${selectedHotel.name}. You can optimize items directly inside details sliders.`;

  return {
    totalBudget: total,
    aiExplanation: responseText,
    categories: {
      transportation: { cost: transCost, explanation: `Includes departure transit via ${pref} option: ${selectedTrans.name}.`, options: transOptions.filter(o => o.type === pref), bookingProcess: "1. Click Irctc/Airline booking link.\n2. Fill departure details.\n3. Complete transaction." },
      hotel: { cost: hotelCost, explanation: `Accommodation stay at ${selectedHotel.name} for ${days} days.`, options: hotelOptions, bookingProcess: "1. Navigate to booking agent.\n2. Set dates: ${days} days.\n3. Make reservation payment." },
      food: { cost: foodCost, explanation: `Dining allowance supporting ${input.foodPreference} style food.`, options: foodOptions, bookingProcess: "1. Discover dining list.\n2. Walk-in and order meals." },
      localTransport: { cost: localCost, explanation: `Local transit options inside destination: ${selectedLocal.name}.`, options: localOptions, bookingProcess: "1. Hire rentals locally.\n2. Follow local guidelines." },
      activities: { cost: activitiesCost, explanation: `Sightseeing activities: ${selectedActivity.name}.`, options: activityOptionsList, bookingProcess: "1. Purchase online entry cards.\n2. Present QR code at entrance." },
      shopping: { cost: shoppingCost, explanation: `Shopping allowance budget cap.`, options: [], bookingProcess: "1. Pay vendors directly via cash/UPI." },
      miscellaneous: { cost: miscCost, explanation: `Unforeseen trip costs & local guides buffers.`, options: [], bookingProcess: "1. Keep buffer currency handy." },
      emergencyFund: { cost: emergencyCost, explanation: `Medical emergency & backup safety cushion fund.`, options: [], bookingProcess: "1. Maintain liquid savings." }
    }
  };
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. GET ALL TRIPS
app.get('/api/trips', (req, res) => {
  const trips = readTripsDatabase();
  res.json(trips);
});

// 2. GET SINGLE TRIP
app.get('/api/trips/:id', (req, res) => {
  const trips = readTripsDatabase();
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
  }
  res.json(trip);
});

// 3. SAVE/UPDATE TRIP
app.post('/api/trips', (req, res) => {
  const trips = readTripsDatabase();
  const trip = req.body;
  
  if (!trip.id) {
    trip.id = 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    trip.createdAt = new Date().toISOString();
  }
  trip.updatedAt = new Date().toISOString();

  const existingIndex = trips.findIndex(t => t.id === trip.id);
  if (existingIndex !== -1) {
    trips[existingIndex] = trip;
  } else {
    trips.push(trip);
  }

  writeTripsDatabase(trips);
  res.json(trip);
});

// 4. DELETE SINGLE TRIP
app.delete('/api/trips/:id', (req, res) => {
  const trips = readTripsDatabase();
  const filtered = trips.filter(t => t.id !== req.params.id);
  writeTripsDatabase(filtered);
  res.json({ success: true });
});

// 5. CLEAR ALL TRIPS OR DELETE SINGLE TRIP (Query parameter fallback for database.js)
app.delete('/api/trips', (req, res) => {
  const id = req.query.id;
  if (id) {
    const trips = readTripsDatabase();
    const filtered = trips.filter(t => t.id !== id);
    writeTripsDatabase(filtered);
    res.json({ success: true });
  } else {
    writeTripsDatabase([]);
    res.json({ success: true });
  }
});

// 6. GENERATE TRIP BUDGET
app.post('/api/generate-budget', async (req, res) => {
  const formData = req.body;
  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-api-key'];

  if (apiKey) {
    try {
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a professional travel agent. Estimate a detailed budget sheet in JSON format for a trip from ${formData.departureCity} to ${formData.destination} for ${formData.days} days, for ${formData.travelers} traveler(s), spending style is ${formData.travelStyle}, preferred transport is ${formData.transportPreference}, hotel class is ${formData.hotelPreference}, and food choice is ${formData.foodPreference}.
      Respond ONLY with a valid raw JSON object matching this schema:
      {
        "totalBudget": 45000,
        "aiExplanation": "Brief summary...",
        "categories": {
          "transportation": { "cost": 15000, "explanation": "Flights/train details...", "options": [{"name": "IndiGo Flight", "time": "10:00 AM", "price": 12000, "details": "..."}], "bookingProcess": "..." },
          "hotel": { "cost": 12000, "explanation": "Accommodation details...", "options": [{"name": "Alt Life Hostel", "rating": "4.5", "reviews": "200", "price": 4000, "details": "..."}], "bookingProcess": "..." },
          "food": { "cost": 6000, "explanation": "Restaurant recommendations...", "options": [{"name": "Beach Cafe", "rating": "4.2", "cuisine": "Local", "tier": "₹₹", "price": 1200, "details": "..."}], "bookingProcess": "..." },
          "localTransport": { "cost": 3000, "explanation": "Rental scooters/auto details...", "options": [], "bookingProcess": "..." },
          "activities": { "cost": 5000, "explanation": "Sightseeing admissions...", "options": [], "bookingProcess": "..." },
          "shopping": { "cost": 2000, "explanation": "Shopping limit...", "options": [], "bookingProcess": "..." },
          "miscellaneous": { "cost": 1000, "explanation": "Guides/tips buffers...", "options": [], "bookingProcess": "..." },
          "emergencyFund": { "cost": 1000, "explanation": "Safety cushion...", "options": [], "bookingProcess": "..." }
        }
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Clean potential JSON markdown blocks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const budgetObj = JSON.parse(cleanJson);
      return res.json(budgetObj);
    } catch (e) {
      console.error("Gemini API call failed, falling back to mock generator:", e);
      // Fallback to server-side mock
      const budgetObj = generateMockBudgetServer(formData);
      return res.json(budgetObj);
    }
  } else {
    // No API key -> Run Server Mock
    const budgetObj = generateMockBudgetServer(formData);
    return res.json(budgetObj);
  }
});

// Serve app on port
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`   AI Travel Planner Backend running on Port ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}/`);
  console.log(`   Serving files from: ${__dirname}`);
  console.log(`=============================================`);
});
