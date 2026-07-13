// Full-Stack DB Gateway Layer for AI Trip Budget Planner
// Syncs to the PowerShell REST API Backend with LocalStorage backup fallback.

const DB_TRIPS_KEY = 'ai_trip_budget_planner_trips';
const DB_SETTINGS_KEY = 'ai_trip_budget_planner_settings';

const Database = {
  // --- TRIP STORAGE ---

  // Get all trips ordered by date created desc
  getTrips() {
    try {
      // Synchronous request to the backend API
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/trips', false); // synchronous call
      xhr.send(null);
      if (xhr.status === 200) {
        const trips = JSON.parse(xhr.responseText);
        // Write to LocalStorage as backup
        localStorage.setItem(DB_TRIPS_KEY, xhr.responseText);
        return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (e) {
      console.warn("Backend server not reachable, falling back to LocalStorage:", e);
    }

    // LocalStorage Fallback
    try {
      const data = localStorage.getItem(DB_TRIPS_KEY);
      if (!data) return [];
      const trips = JSON.parse(data);
      return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.error("LocalStorage read failed:", e);
      return [];
    }
  },

  // Get a single trip by ID
  getTrip(id) {
    const trips = this.getTrips();
    return trips.find(trip => trip.id === id) || null;
  },

  // Save a new trip or update an existing one
  saveTrip(trip) {
    // Client-side auto-generate ID if missing
    const tripData = {
      ...trip,
      id: trip.id || 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: trip.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Try posting to backend synchronously
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/trips', false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(tripData));
      if (xhr.status === 200) {
        const saved = JSON.parse(xhr.responseText);
        // Update LocalStorage backup
        const localTrips = this.getTripsLocal();
        const idx = localTrips.findIndex(t => t.id === saved.id);
        if (idx !== -1) localTrips[idx] = saved;
        else localTrips.push(saved);
        localStorage.setItem(DB_TRIPS_KEY, JSON.stringify(localTrips));
        return saved;
      }
    } catch (e) {
      console.warn("Backend save failed, using local storage:", e);
    }

    // LocalStorage Fallback save
    const localTrips = this.getTripsLocal();
    const existingIndex = localTrips.findIndex(t => t.id === tripData.id);
    if (existingIndex !== -1) {
      localTrips[existingIndex] = tripData;
    } else {
      localTrips.push(tripData);
    }
    localStorage.setItem(DB_TRIPS_KEY, JSON.stringify(localTrips));
    return tripData;
  },

  // Delete a trip by ID
  deleteTrip(id) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', `/api/trips?id=${id}`, false);
      xhr.send(null);
      if (xhr.status === 200) {
        // Sync local storage backup
        const localTrips = this.getTripsLocal();
        const filtered = localTrips.filter(t => t.id !== id);
        localStorage.setItem(DB_TRIPS_KEY, JSON.stringify(filtered));
        return true;
      }
    } catch (e) {
      console.warn("Backend delete failed, using local storage:", e);
    }

    // LocalStorage delete fallback
    const localTrips = this.getTripsLocal();
    const filtered = localTrips.filter(t => t.id !== id);
    localStorage.setItem(DB_TRIPS_KEY, JSON.stringify(filtered));
    return true;
  },

  // Clear all saved trips
  clearAllTrips() {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', '/api/trips', false);
      xhr.send(null);
      if (xhr.status === 200) {
        localStorage.setItem(DB_TRIPS_KEY, JSON.stringify([]));
        return true;
      }
    } catch (e) {
      console.warn("Backend clear failed, using local storage:", e);
    }

    localStorage.setItem(DB_TRIPS_KEY, JSON.stringify([]));
    return true;
  },

  // Helper to get local storage array only
  getTripsLocal() {
    try {
      const data = localStorage.getItem(DB_TRIPS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  // --- SETTINGS STORAGE ---

  getSettings() {
    try {
      const data = localStorage.getItem(DB_SETTINGS_KEY);
      if (!data) {
        // Return default settings
        return {
          geminiApiKey: '',
          defaultCurrency: 'INR',
          currencySymbol: '₹'
        };
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading settings:", e);
      return { geminiApiKey: '', defaultCurrency: 'INR', currencySymbol: '₹' };
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = {
        ...current,
        ...settings
      };
      
      // Update currency symbol automatically based on code
      if (settings.defaultCurrency) {
        const symbols = {
          'INR': '₹',
          'USD': '$',
          'EUR': '€',
          'GBP': '£',
          'JPY': '¥',
          'AUD': 'A$'
        };
        updated.currencySymbol = symbols[settings.defaultCurrency] || '$';
      }

      localStorage.setItem(DB_SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Error saving settings:", e);
      return null;
    }
  }
};

// Export to window object for CDN scripts to access
window.TripDatabase = Database;
