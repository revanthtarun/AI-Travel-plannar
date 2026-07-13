const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  cost: Number,
  explanation: String,
  options: [mongoose.Schema.Types.Mixed],
  bookingProcess: String
}, { _id: false });

const TripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: {
    destination: String,
    departureCity: String,
    travelers: Number,
    days: Number,
    travelStyle: String,
    transportPreference: String,
    hotelPreference: String,
    foodPreference: String,
    activityInterests: [String],
    shoppingBudget: Number
  },
  budget: {
    totalBudget: Number,
    currency: String,
    transportPreference: String,
    aiExplanation: String,
    savingTips: [String],
    categories: {
      transportation: CategorySchema,
      hotel: CategorySchema,
      food: CategorySchema,
      localTransport: CategorySchema,
      activities: CategorySchema,
      shopping: CategorySchema,
      miscellaneous: CategorySchema,
      emergencyFund: CategorySchema
    }
  },
  chatHistory: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
