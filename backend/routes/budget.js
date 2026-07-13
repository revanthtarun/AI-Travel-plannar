const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const generateMockBudget = require('../utils/mockBudget');

router.post('/generate', async (req, res) => {
  const formData = req.body;
  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-api-key'];

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a professional travel agent. Estimate a detailed budget sheet in JSON format for a trip from ${formData.departureCity} to ${formData.destination} for ${formData.days} days, for ${formData.travelers} traveler(s), spending style is ${formData.travelStyle}, preferred transport is ${formData.transportPreference}, hotel class is ${formData.hotelPreference}, and food choice is ${formData.foodPreference}.
      Respond ONLY with a valid raw JSON object matching this schema:
      {
        "totalBudget": 45000,
        "aiExplanation": "Brief summary...",
        "savingTips": ["tip1", "tip2"],
        "categories": {
          "transportation": { "cost": 15000, "explanation": "...", "options": [{"name": "IndiGo Flight", "type": "Flight", "time": "10:00 AM", "price": 12000, "details": "..."}], "bookingProcess": "..." },
          "hotel": { "cost": 12000, "explanation": "...", "options": [{"name": "Hotel", "rating": "4.5", "reviews": "200", "price": 4000, "details": "..."}], "bookingProcess": "..." },
          "food": { "cost": 6000, "explanation": "...", "options": [{"name": "Cafe", "rating": "4.2", "cuisine": "Local", "tier": "₹₹", "price": 1200, "details": "..."}], "bookingProcess": "..." },
          "localTransport": { "cost": 3000, "explanation": "...", "options": [], "bookingProcess": "..." },
          "activities": { "cost": 5000, "explanation": "...", "options": [], "bookingProcess": "..." },
          "shopping": { "cost": 2000, "explanation": "...", "options": [], "bookingProcess": "..." },
          "miscellaneous": { "cost": 1000, "explanation": "...", "options": [], "bookingProcess": "..." },
          "emergencyFund": { "cost": 1000, "explanation": "...", "options": [], "bookingProcess": "..." }
        }
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return res.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error('Gemini API failed, using mock:', e.message);
    }
  }

  res.json(generateMockBudget(formData));
});

module.exports = router;
