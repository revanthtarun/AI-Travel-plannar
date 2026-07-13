function generateMockBudget(input) {
  const travelers = Number(input.travelers) || 1;
  const days = Number(input.days) || 5;
  const style = input.travelStyle || 'Standard';
  const shoppingBudget = Number(input.shoppingBudget) || 5000;
  const pref = input.transportPreference || 'Flight';

  const dest = (input.destination || 'Goa').toLowerCase();
  let destFactor = 1.0;
  if (dest.includes('paris') || dest.includes('london') || dest.includes('europe')) destFactor = 5.2;
  else if (dest.includes('singapore') || dest.includes('dubai')) destFactor = 3.5;
  else if (dest.includes('maldives')) destFactor = 4.2;
  else if (dest.includes('goa') || dest.includes('manali') || dest.includes('shimla')) destFactor = 1.2;

  let dailyHotelBase = 2500;
  if (input.hotelPreference === 'Hostel') dailyHotelBase = 600;
  else if (input.hotelPreference === '2-Star') dailyHotelBase = 1200;
  else if (input.hotelPreference === '3-Star') dailyHotelBase = 2500;
  else if (input.hotelPreference === '5-Star') dailyHotelBase = 7000;

  let dailyFoodBase = 800;
  if ((input.foodPreference || '').includes('Fine')) dailyFoodBase = 2000;
  else if ((input.foodPreference || '').includes('Veg')) dailyFoodBase = 600;

  const styleModifier = style === 'Luxury' ? 2.0 : style === 'Budget' ? 0.6 : 1.0;

  const flightFare = Math.round((style === 'Luxury' ? 12000 : style === 'Standard' ? 6000 : 3500) * travelers * destFactor);
  const trainFare = Math.round((style === 'Luxury' ? 4500 : style === 'Standard' ? 2200 : 1000) * travelers);
  const busFare = Math.round((style === 'Luxury' ? 2500 : style === 'Standard' ? 1400 : 800) * travelers);
  const cabFare = Math.round((style === 'Luxury' ? 7000 : style === 'Standard' ? 4000 : 2000) * travelers * destFactor);

  let transCost = flightFare;
  if (pref === 'Train') transCost = trainFare;
  else if (pref === 'Bus') transCost = busFare;
  else if (pref === 'Cab') transCost = cabFare;

  const hotelCost = Math.round(dailyHotelBase * days * styleModifier);
  const foodCost = Math.round(dailyFoodBase * days * travelers * styleModifier);
  const localCost = Math.round((style === 'Luxury' ? 1500 : style === 'Standard' ? 600 : 200) * days * travelers * destFactor);
  const activitiesCount = (input.activityInterests || []).length || 2;
  const activitiesCost = Math.round(activitiesCount * (style === 'Luxury' ? 3500 : style === 'Standard' ? 1500 : 600) * travelers);
  const miscCost = Math.round((hotelCost + foodCost) * 0.08);
  const emergencyCost = Math.round((transCost + hotelCost) * 0.05);
  const total = transCost + hotelCost + foodCost + localCost + activitiesCost + shoppingBudget + miscCost + emergencyCost;

  const fromCity = (input.departureCity || 'Hyderabad').trim();
  const toCity = (input.destination || 'Goa').trim();

  return {
    totalBudget: total,
    currency: 'INR',
    transportPreference: pref,
    aiExplanation: `Generated a ${style} budget for ${days}-day trip from ${fromCity} to ${toCity} for ${travelers} traveler(s). Total: ₹${total.toLocaleString('en-IN')}.`,
    savingTips: [
      `Staying outside the central area in ${toCity} can reduce lodging costs by up to 30%.`,
      `Rent local scooters or use transit passes to cut local travel costs in half.`,
      `Explore street food zones for authentic meals at 40% less cost.`,
      `Book activities directly on-site to save on agent commissions.`
    ],
    categories: {
      transportation: {
        cost: transCost,
        explanation: `${pref} from ${fromCity} to ${toCity} for ${travelers} pax.`,
        options: getTransOptions(dest, pref, flightFare, trainFare, busFare, cabFare, fromCity, toCity, input.travelDate),
        bookingProcess: '1. Compare options.\n2. Open MakeMyTrip/IRCTC.\n3. Book and confirm.'
      },
      hotel: {
        cost: hotelCost,
        explanation: `${days} nights in ${input.hotelPreference} accommodation.`,
        options: getHotelOptions(dest, hotelCost),
        bookingProcess: '1. Search on Booking.com.\n2. Confirm dates.\n3. Reserve with free cancellation.'
      },
      food: {
        cost: foodCost,
        explanation: `Daily meals for ${travelers} travelers (${input.foodPreference}).`,
        options: getFoodOptions(dest, foodCost),
        bookingProcess: 'Walk-in to recommended spots. Reserve dinner tables via hotel reception.'
      },
      localTransport: {
        cost: localCost,
        explanation: `Local transit in ${toCity} for ${days} days.`,
        options: getLocalOptions(dest, localCost),
        bookingProcess: '1. Hire rentals at airport.\n2. Provide driving license copy.'
      },
      activities: {
        cost: activitiesCost,
        explanation: `Sightseeing and activity admissions.`,
        options: getActivityOptions(dest, activitiesCost),
        bookingProcess: '1. Book on Klook or Thrillophilia.\n2. Check combo deals.'
      },
      shopping: {
        cost: shoppingBudget,
        explanation: `Shopping allowance cap.`,
        options: [],
        bookingProcess: 'Pay vendors directly via cash/UPI.'
      },
      miscellaneous: {
        cost: miscCost,
        explanation: `SIM card, tips, laundry, and unplanned expenses.`,
        options: [],
        bookingProcess: 'Keep buffer currency handy.'
      },
      emergencyFund: {
        cost: emergencyCost,
        explanation: `5% emergency buffer of transit & hotel costs.`,
        options: [],
        bookingProcess: 'Maintain liquid savings in a separate account.'
      }
    }
  };
}

function getTransOptions(dest, pref, flightFare, trainFare, busFare, cabFare, from, to, travelDate) {
  const dateLabel = travelDate ? new Date(travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Selected Date';

  const flights = [
    { name: 'IndiGo 6E-241 (Direct)', type: 'Flight', time: `06:15 AM - 07:40 AM | ${dateLabel}`, price: Math.round(flightFare * 0.88), details: `Direct flight ${from} → ${to}. Cabin bag included. IndiGo.` },
    { name: 'Air India AI-544 (Direct)', type: 'Flight', time: `09:30 AM - 11:00 AM | ${dateLabel}`, price: Math.round(flightFare * 1.05), details: `Direct flight ${from} → ${to}. Meal included. Air India.` },
    { name: 'SpiceJet SG-112 (Direct)', type: 'Flight', time: `01:15 PM - 02:45 PM | ${dateLabel}`, price: Math.round(flightFare * 0.82), details: `Direct flight ${from} → ${to}. Budget carrier. SpiceJet.` },
    { name: 'Vistara UK-812 (Direct)', type: 'Flight', time: `05:00 PM - 06:30 PM | ${dateLabel}`, price: Math.round(flightFare * 1.18), details: `Direct flight ${from} → ${to}. Premium economy. Vistara.` },
    { name: 'Akasa Air QP-1302', type: 'Flight', time: `07:45 PM - 09:15 PM | ${dateLabel}`, price: Math.round(flightFare * 0.79), details: `Direct flight ${from} → ${to}. New-gen low-cost. Akasa Air.` },
  ];

  const trains = [
    { name: 'Rajdhani Express (12431)', type: 'Train', time: `06:00 PM - 08:30 AM (+1) | ${dateLabel}`, price: Math.round(trainFare * 1.1), details: `2AC sleeper, meals included. Departs ${from}.` },
    { name: 'Shatabdi Express (12007)', type: 'Train', time: `06:15 AM - 01:30 PM | ${dateLabel}`, price: Math.round(trainFare * 0.85), details: `Chair car, breakfast included. Day train.` },
    { name: 'Duronto Express (12213)', type: 'Train', time: `11:00 PM - 09:00 AM (+1) | ${dateLabel}`, price: Math.round(trainFare * 0.95), details: `3AC sleeper, non-stop express.` },
    { name: 'Vande Bharat Express', type: 'Train', time: `08:00 AM - 02:00 PM | ${dateLabel}`, price: Math.round(trainFare * 1.2), details: `Semi-high speed, executive chair car.` },
    { name: 'Garib Rath Express (12215)', type: 'Train', time: `04:30 PM - 06:00 AM (+1) | ${dateLabel}`, price: Math.round(trainFare * 0.65), details: `3AC budget sleeper. Most affordable.` },
  ];

  const buses = [
    { name: 'IntrCity SmartBus Sleeper', type: 'Bus', time: `05:30 PM - 08:30 AM (+1) | ${dateLabel}`, price: Math.round(busFare * 1.0), details: 'A/C Sleeper, charging ports, live tracking.' },
    { name: 'Zingbus Premium Sleeper', type: 'Bus', time: `07:00 PM - 10:00 AM (+1) | ${dateLabel}`, price: Math.round(busFare * 0.9), details: 'Multi-axle sleeper, blankets, CCTV.' },
    { name: 'KSRTC / TSRTC Volvo A/C', type: 'Bus', time: `09:00 PM - 07:00 AM (+1) | ${dateLabel}`, price: Math.round(busFare * 0.7), details: 'Government Volvo A/C sleeper.' },
    { name: 'RedBus Primo Sleeper', type: 'Bus', time: `10:30 PM - 09:00 AM (+1) | ${dateLabel}`, price: Math.round(busFare * 0.85), details: 'Private operator, wide berths.' },
  ];

  const cabs = [
    { name: 'Outstation Sedan (Swift/Etios)', type: 'Cab', time: `Flexible | ${dateLabel}`, price: Math.round(cabFare * 0.85), details: 'Shared outstation cab, AC sedan.' },
    { name: 'SUV Cab (Innova/Ertiga)', type: 'Cab', time: `Flexible | ${dateLabel}`, price: Math.round(cabFare * 1.2), details: 'Private SUV, 6-seater, AC.' },
    { name: 'Self-Drive Car Rental', type: 'Cab', time: `Flexible | ${dateLabel}`, price: Math.round(cabFare * 0.75), details: 'Zoomcar/Revv self-drive rental.' },
  ];

  const allOptions = { Flight: flights, Train: trains, Bus: buses, Cab: cabs };
  return allOptions[pref] || flights;
}

function getHotelOptions(dest, hotelCost) {
  if (dest.includes('goa')) return [
    { name: 'Zostel Goa (Hostel)', rating: '4.6', reviews: '1.1k', time: 'Check-in: 12:00 PM', price: Math.round(hotelCost * 0.4), details: 'Backpacker hostel near Vagator beach.' },
    { name: 'Fairfield by Marriott Goa (3-Star)', rating: '4.2', reviews: '850', time: 'Check-in: 02:00 PM', price: Math.round(hotelCost * 0.95), details: 'Pool views, buffet breakfast, near Baga.' },
    { name: 'Taj Exotica Resort Goa (5-Star)', rating: '4.8', reviews: '1.5k', time: 'Check-in: 02:00 PM', price: Math.round(hotelCost * 2.2), details: 'Ocean-view villas, private beach.' }
  ];
  if (dest.includes('delhi')) return [
    { name: 'Zostel Delhi (Hostel)', rating: '4.5', reviews: '940', time: 'Check-in: 12:00 PM', price: Math.round(hotelCost * 0.4), details: 'Social dorms, near metro.' },
    { name: 'Radisson Blu Connaught Place (3-Star)', rating: '4.3', reviews: '620', time: 'Check-in: 02:00 PM', price: Math.round(hotelCost * 0.95), details: 'Central location, buffet breakfast.' },
    { name: 'The Leela Palace New Delhi (5-Star)', rating: '4.9', reviews: '1.8k', time: 'Check-in: 02:00 PM', price: Math.round(hotelCost * 2.2), details: 'Rooftop pool, butler service.' }
  ];
  return [
    { name: 'Budget Hostel', rating: '4.2', reviews: '200', time: 'Check-in: 12:00 PM', price: Math.round(hotelCost * 0.4), details: 'Shared dorms, Wi-Fi.' },
    { name: 'Lemon Tree Premier (3-Star)', rating: '4.1', reviews: '850', time: 'Check-in: 02:00 PM', price: Math.round(hotelCost * 0.95), details: 'Pool, buffet breakfast.' },
    { name: 'The Oberoi / ITC Grand (5-Star)', rating: '4.8', reviews: '1.1k', time: 'Check-in: 02:00 PM', price: Math.round(hotelCost * 2.2), details: 'Luxury suites, butler service.' }
  ];
}

function getFoodOptions(dest, foodCost) {
  if (dest.includes('goa')) return [
    { name: 'Beachside Fish Shacks', rating: '4.1', reviews: '920', cuisine: 'Goan Seafood', tier: '₹', time: 'Lunch/Dinner', price: Math.round(foodCost * 0.5), details: 'Authentic Goan vindaloo and fish curry.' },
    { name: "Britto's Beach Cafe", rating: '4.3', reviews: '1.4k', cuisine: 'Multi-Cuisine', tier: '₹₹', time: 'Lunch/Dinner', price: Math.round(foodCost * 0.9), details: 'Famous beach restaurant.' },
    { name: "The Fisherman's Wharf", rating: '4.6', reviews: '2.1k', cuisine: 'Goan Fusion', tier: '₹₹₹', time: 'Dinner', price: Math.round(foodCost * 1.6), details: 'Riverside fine dining, live music.' }
  ];
  return [
    { name: 'Local Street Markets', rating: '4.2', reviews: '450', cuisine: 'Local Dishes', tier: '₹', time: 'Lunch/Dinner', price: Math.round(foodCost * 0.5), details: 'Authentic regional food.' },
    { name: 'Casual Dine-in Cafe', rating: '4.1', reviews: '620', cuisine: 'Multi-Cuisine', tier: '₹₹', time: 'Lunch/Dinner', price: Math.round(foodCost * 0.95), details: 'Standard table service.' },
    { name: 'Premium Fine Dining', rating: '4.6', reviews: '890', cuisine: 'Heritage Gourmet', tier: '₹₹₹', time: 'Dinner', price: Math.round(foodCost * 1.6), details: 'Fine dining, live music.' }
  ];
}

function getLocalOptions(dest, localCost) {
  if (dest.includes('goa')) return [
    { name: 'Activa / Vespa Scooter Rental', time: 'Per day', price: Math.round(localCost * 0.4), details: 'Rent scooters to roam beaches.' },
    { name: 'Thar / Creta Self-Drive SUV', time: 'Per day', price: Math.round(localCost * 1.8), details: 'Self-drive jeep for beach road trips.' },
    { name: 'Goa Miles Prepaid App Cab', time: 'On-demand', price: Math.round(localCost * 0.9), details: 'Government-monitored flat-rate cabs.' }
  ];
  return [
    { name: 'Prepaid Ola/Uber Cab', time: 'On-demand', price: Math.round(localCost * 0.9), details: 'App-based flat rate rides.' },
    { name: 'Self-Drive Car Rental', time: 'Per day', price: Math.round(localCost * 1.6), details: 'Unlimited km rental.' },
    { name: 'Local Metro / Auto Rides', time: 'Point-to-point', price: Math.round(localCost * 0.3), details: 'Quick and affordable.' }
  ];
}

function getActivityOptions(dest, activitiesCost) {
  if (dest.includes('goa')) return [
    { name: 'Premium Water Sports Combo', time: 'Half Day 09:00 AM', price: Math.round(activitiesCost * 1.1), details: 'Parasailing, jet ski, banana boat.' },
    { name: 'Mandovi Sunset Cruise', time: '05:30 PM - 07:00 PM', price: Math.round(activitiesCost * 0.45), details: 'Folk dances, DJ, welcome drinks.' },
    { name: 'North Goa Churches & Spice Farm', time: 'Full Day', price: Math.round(activitiesCost * 0.6), details: 'Basilica of Bom Jesus, spice farm lunch.' }
  ];
  return [
    { name: 'Guided Monuments & Palace Pass', time: '09:30 AM - 04:30 PM', price: Math.round(activitiesCost * 0.6), details: 'Entry passes for historic sites.' },
    { name: 'Cultural Light & Sound Show', time: '07:00 PM - 08:30 PM', price: Math.round(activitiesCost * 0.4), details: 'Evening heritage show.' },
    { name: 'Adventure / Theme Park Pass', time: 'Day Ticket', price: Math.round(activitiesCost * 1.1), details: 'Amusement or outdoor adventure.' }
  ];
}

module.exports = generateMockBudget;
