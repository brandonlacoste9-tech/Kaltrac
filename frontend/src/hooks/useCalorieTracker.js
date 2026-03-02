import { useState, useCallback, useEffect } from "react";
import { mealsAPI, settingsAPI, workoutsAPI, waterAPI } from "../services/api";

const DEFAULT_SETTINGS = {
  daily_calorie_goal: 2000,
  daily_protein_goal: 150,
  daily_carbs_goal: 250,
  daily_fat_goal: 65,
  daily_water_goal: 8,
  dietary_restrictions: [],
  language: ''
};

export function useCalorieTracker() {
  const [user, setUser] = useState(null);
  const [log, setLog] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [water, setWater] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Auth check
  const checkAuth = useCallback(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Offline/Trial Persisters
  const saveOffline = (key, data) => {
    localStorage.setItem(`kaltrac_trial_${key}`, JSON.stringify(data));
  };

  const loadOffline = (key, defaultValue) => {
    const saved = localStorage.getItem(`kaltrac_trial_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // Data Loading
  const loadData = useCallback(async () => {
    const isAuth = checkAuth();
    
    if (!isAuth) {
      // Load from localStorage for trial mode
      setLog(loadOffline('meals', []));
      setWorkouts(loadOffline('workouts', []));
      setWater(loadOffline('water', 0));
      setSettings(loadOffline('settings', DEFAULT_SETTINGS));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const [mealsRes, settingsRes, workoutsRes, waterRes] = await Promise.all([
        mealsAPI.getToday(),
        settingsAPI.get(),
        workoutsAPI.getToday(),
        waterAPI.getToday()
      ]);

      setLog(mealsRes.data || []);
      setSettings(settingsRes.data || DEFAULT_SETTINGS);
      setWorkouts(workoutsRes.data || []);
      setWater(waterRes.data?.glasses_count || 0);
    } catch (error) {
      console.error("Failed to load from API, falling back to local:", error);
      // Even if authed, if API fails, fallback to local for safety
      setLog(loadOffline('meals', []));
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  useEffect(() => { loadData(); }, [loadData]);

  // Actions
  const addMeal = async (mealData) => {
    const isAuth = !!localStorage.getItem('authToken');
    if (isAuth) {
      setSyncing(true);
      try {
        const res = await mealsAPI.add(mealData);
        setLog(prev => [res.data, ...prev]);
      } catch (err) { console.error(err); }
      finally { setSyncing(false); }
    } else {
      const newItem = { ...mealData, id: Date.now(), logged_at: new Date().toISOString() };
      const updated = [newItem, ...log];
      setLog(updated);
      saveOffline('meals', updated);
    }
  };

  const removeMeal = async (id) => {
    const isAuth = !!localStorage.getItem('authToken');
    if (isAuth) {
      try {
        await mealsAPI.delete(id);
        setLog(prev => prev.filter(m => m.id !== id));
      } catch (err) { console.error(err); }
    } else {
      const updated = log.filter(m => m.id !== id);
      setLog(updated);
      saveOffline('meals', updated);
    }
  };

  const addWorkout = async (workoutData) => {
    const isAuth = !!localStorage.getItem('authToken');
    if (isAuth) {
      try {
        const res = await workoutsAPI.add(workoutData);
        setWorkouts(prev => [res.data, ...prev]);
      } catch (err) { console.error(err); }
    } else {
      const newItem = { ...workoutData, id: Date.now() };
      const updated = [newItem, ...workouts];
      setWorkouts(updated);
      saveOffline('workouts', updated);
    }
  };

  const removeWorkout = async (id) => {
    const isAuth = !!localStorage.getItem('authToken');
    if (isAuth) {
      try {
        await workoutsAPI.delete(id);
        setWorkouts(prev => prev.filter(w => w.id !== id));
      } catch (err) { console.error(err); }
    } else {
      const updated = workouts.filter(w => w.id !== id);
      setWorkouts(updated);
      saveOffline('workouts', updated);
    }
  };

  const updateWater = async (count) => {
    const isAuth = !!localStorage.getItem('authToken');
    if (isAuth) {
      try {
        await waterAPI.update(count);
        setWater(count);
      } catch (err) { console.error(err); }
    } else {
      setWater(count);
      saveOffline('water', count);
    }
  };

  const updateSettings = async (newSettings) => {
    const isAuth = !!localStorage.getItem('authToken');
    if (isAuth) {
      try {
        await settingsAPI.update(newSettings);
        setSettings(newSettings);
      } catch (err) { console.error(err); }
    } else {
      setSettings(newSettings);
      saveOffline('settings', newSettings);
    }
  };

  // Analytics Helpers
  const getWeeklyStats = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() - i * 86400000).getDay()],
      calories: i === 0 ? log.reduce((s, m) => s + (Number(m.calories) || 0), 0) : 0
    })).reverse();
  };

  return {
    user,
    setUser,
    log,
    workouts,
    water,
    settings,
    loading,
    syncing,
    logout,
    addMeal,
    removeMeal,
    addWorkout,
    removeWorkout,
    updateWater,
    updateSettings,
    getWeeklyStats,
    loadData
  };
}
