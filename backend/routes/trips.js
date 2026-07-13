const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const TRIPS_FILE = path.join(__dirname, '../../trips.json');

// --- Helpers for JSON file fallback ---
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function readFile() {
  try {
    if (!fs.existsSync(TRIPS_FILE)) return [];
    const data = fs.readFileSync(TRIPS_FILE, 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch { return []; }
}

function writeFile(trips) {
  fs.writeFileSync(TRIPS_FILE, JSON.stringify(trips, null, 2), 'utf8');
}

// Lazy-load Trip model only when Mongo is connected
function getModel() {
  return require('../models/Trip');
}

// GET all trips
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const trips = await getModel().find().sort({ createdAt: -1 });
      return res.json(trips);
    }
    const trips = readFile().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trip
router.get('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const trip = await getModel().findById(req.params.id);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      return res.json(trip);
    }
    const trip = readFile().find(t => t.id === req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create trip
router.post('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const trip = new (getModel())(req.body);
      const saved = await trip.save();
      return res.status(201).json(saved);
    }
    const trips = readFile();
    const newTrip = {
      ...req.body,
      id: 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    trips.push(newTrip);
    writeFile(trips);
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update trip
router.put('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await getModel().findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Trip not found' });
      return res.json(updated);
    }
    const trips = readFile();
    const idx = trips.findIndex(t => t.id === req.params.id || t._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Trip not found' });
    trips[idx] = { ...trips[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeFile(trips);
    res.json(trips[idx]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE single trip
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await getModel().findByIdAndDelete(req.params.id);
      return res.json({ success: true });
    }
    const trips = readFile().filter(t => t.id !== req.params.id && t._id !== req.params.id);
    writeFile(trips);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all trips
router.delete('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await getModel().deleteMany({});
      return res.json({ success: true });
    }
    writeFile([]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
