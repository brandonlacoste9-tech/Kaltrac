import { useState, useCallback, useEffect } from "react";

const DAILY_GOAL = 2000;

export function useCalorieTracker() {
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [historicalData, setHistoricalData] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kaltrac_meals");
      const savedHistory = localStorage.getItem("kaltrac_history");
      if (saved) setLog(JSON.parse(saved));
      if (savedHistory) setHistoricalData(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Error loading data:", e);
    }
  }, []);

  // Save current log to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kaltrac_meals", JSON.stringify(log));
    } catch (e) {
      console.error("Error saving meals:", e);
    }
  }, [log]);

  // Save historical data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kaltrac_history", JSON.stringify(historicalData));
    } catch (e) {
      console.error("Error saving history:", e);
    }
  }, [historicalData]);

  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const addToLog = useCallback(
    (foodItem) => {
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const todayDate = getTodayDate();

      const newItem = {
        id: Date.now(),
        date: todayDate,
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        time,
        thumb: foodItem.image,
      };

      setLog((prev) => [newItem, ...prev]);

      // Update today's history
      setHistoricalData((prev) => ({
        ...prev,
        [todayDate]: {
          calories:
            (prev[todayDate]?.calories || 0) + (foodItem.calories || 0),
          protein: (prev[todayDate]?.protein || 0) + (foodItem.protein || 0),
          carbs: (prev[todayDate]?.carbs || 0) + (foodItem.carbs || 0),
          fat: (prev[todayDate]?.fat || 0) + (foodItem.fat || 0),
          mealCount: (prev[todayDate]?.mealCount || 0) + 1,
        },
      }));
    },
    [getTodayDate]
  );

  const removeFromLog = useCallback((id) => {
    setLog((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        // Update history
        setHistoricalData((prevHistory) => {
          const date = itemToRemove.date;
          const updated = { ...prevHistory };
          if (updated[date]) {
            updated[date] = {
              ...updated[date],
              calories: Math.max(0, updated[date].calories - itemToRemove.calories),
              protein: Math.max(0, updated[date].protein - (itemToRemove.protein || 0)),
              carbs: Math.max(0, updated[date].carbs - (itemToRemove.carbs || 0)),
              fat: Math.max(0, updated[date].fat - (itemToRemove.fat || 0)),
              mealCount: Math.max(0, updated[date].mealCount - 1),
            };
          }
          return updated;
        });
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const getTodayLog = useCallback(() => {
    const todayDate = getTodayDate();
    return log.filter((item) => item.date === todayDate);
  }, [log, getTodayDate]);

  const getTotalCalories = useCallback(() => {
    return getTodayLog().reduce((sum, item) => sum + item.calories, 0);
  }, [getTodayLog]);

  const getTotalMacros = useCallback(() => {
    const todayLog = getTodayLog();
    return {
      protein: todayLog.reduce((sum, item) => sum + (item.protein || 0), 0),
      carbs: todayLog.reduce((sum, item) => sum + (item.carbs || 0), 0),
      fat: todayLog.reduce((sum, item) => sum + (item.fat || 0), 0),
    };
  }, [getTodayLog]);

  const getCaloriePercentage = useCallback(() => {
    const total = getTotalCalories();
    return Math.min((total / DAILY_GOAL) * 100, 100);
  }, [getTotalCalories]);

  // Get last 7 days data
  const getWeeklyData = useCallback(() => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      weekData.push({
        date: dateStr,
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
        ...( historicalData[dateStr] || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        })
      });
    }
    return weekData;
  }, [historicalData]);

  // Get last 30 days data
  const getMonthlyData = useCallback(() => {
    const monthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      monthData.push({
        date: dateStr,
        day: date.getDate(),
        ...( historicalData[dateStr] || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        })
      });
    }
    return monthData;
  }, [historicalData]);

  return {
    log,
    result,
    setResult,
    addToLog,
    removeFromLog,
    getTotalCalories,
    getTotalMacros,
    getCaloriePercentage,
    getTodayLog,
    getWeeklyData,
    getMonthlyData,
    historicalData,
    DAILY_GOAL,
  };
}
