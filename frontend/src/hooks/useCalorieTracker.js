import { useState, useCallback, useEffect } from "react";
import { mealsAPI, settingsAPI } from "../services/api";

const DEFAULT_DAILY_GOAL = 2000;

export function useCalorieTracker() {
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [historicalData, setHistoricalData] = useState({});
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => localStorage.getItem("authToken") !== null;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        if (isAuthenticated()) {
          const settingsRes = await settingsAPI.getSettings();
          setDailyGoal(settingsRes.data.daily_calorie_goal || DEFAULT_DAILY_GOAL);

          // Load meals from backend
          const mealsRes = await mealsAPI.getTodayMeals();
          processAndSetMeals(mealsRes.data);
        } else {
          // Fall back to localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        loadFromLocalStorage();
      }
    };

    loadData();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("kaltrac_meals");
      const savedHistory = localStorage.getItem("kaltrac_history");
      if (saved) setLog(JSON.parse(saved));
      if (savedHistory) setHistoricalData(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, []);

  const processAndSetMeals = useCallback((meals) => {
    const processed = meals.map((meal) => ({
      id: meal.id,
      date: meal.logged_at.split("T")[0],
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      time: new Date(meal.logged_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    setLog(processed);

    // Rebuild historical data
    const history = {};
    processed.forEach((meal) => {
      if (!history[meal.date]) {
        history[meal.date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        };
      }
      history[meal.date].calories += meal.calories;
      history[meal.date].protein += meal.protein;
      history[meal.date].carbs += meal.carbs;
      history[meal.date].fat += meal.fat;
      history[meal.date].mealCount += 1;
    });

    setHistoricalData(history);
  }, []);

  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const addToLog = useCallback(
    async (foodItem) => {
      const now = new Date();
      const todayDate = getTodayDate();

      const mealData = {
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        fiber: foodItem.fiber || 0,
        meal_type: "tracked",
        notes: foodItem.note || "",
      };

      if (isAuthenticated()) {
        try {
          setSyncing(true);
          const response = await mealsAPI.add(mealData);

          // Add to local state
          const newItem = {
            id: response.data.id,
            date: todayDate,
            name: response.data.name,
            calories: response.data.calories,
            protein: response.data.protein,
            carbs: response.data.carbs,
            fat: response.data.fat,
            time: now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setLog((prev) => [newItem, ...prev]);

          // Update historical data
          setHistoricalData((prev) => ({
            ...prev,
            [todayDate]: {
              calories:
                (prev[todayDate]?.calories || 0) + (foodItem.calories || 0),
              protein:
                (prev[todayDate]?.protein || 0) + (foodItem.protein || 0),
              carbs: (prev[todayDate]?.carbs || 0) + (foodItem.carbs || 0),
              fat: (prev[todayDate]?.fat || 0) + (foodItem.fat || 0),
              mealCount: (prev[todayDate]?.mealCount || 0) + 1,
            },
          }));
        } catch (error) {
          console.error("Error adding meal to backend:", error);
          // Fall back to localStorage
          addToLocalStorage(foodItem, todayDate);
        } finally {
          setSyncing(false);
        }
      } else {
        // Use localStorage if not authenticated
        addToLocalStorage(foodItem, todayDate);
      }
    },
    [getTodayDate, isAuthenticated]
  );

  const addToLocalStorage = useCallback((foodItem, todayDate) => {
    const newItem = {
      id: Date.now(),
      date: todayDate,
      name: foodItem.name,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setLog((prev) => [newItem, ...prev]);

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

    // Save to localStorage as backup
    localStorage.setItem("kaltrac_meals", JSON.stringify([newItem, ...log]));
  }, [log]);

  const removeFromLog = useCallback(
    async (id) => {
      if (isAuthenticated()) {
        try {
          setSyncing(true);
          await mealsAPI.deleteMeal(id);
        } catch (error) {
          console.error("Error deleting meal:", error);
        } finally {
          setSyncing(false);
        }
      }

      // Remove from local state
      setLog((prev) => {
        const itemToRemove = prev.find((item) => item.id === id);
        if (itemToRemove) {
          setHistoricalData((prevHistory) => {
            const date = itemToRemove.date;
            const updated = { ...prevHistory };
            if (updated[date]) {
              updated[date] = {
                ...updated[date],
                calories: Math.max(
                  0,
                  updated[date].calories - itemToRemove.calories
                ),
                protein: Math.max(
                  0,
                  updated[date].protein - (itemToRemove.protein || 0)
                ),
                carbs: Math.max(
                  0,
                  updated[date].carbs - (itemToRemove.carbs || 0)
                ),
                fat: Math.max(0, updated[date].fat - (itemToRemove.fat || 0)),
                mealCount: Math.max(0, updated[date].mealCount - 1),
              };
            }
            return updated;
          });
        }
        return prev.filter((item) => item.id !== id);
      });
    },
    [isAuthenticated]
  );

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
    return Math.min((total / dailyGoal) * 100, 100);
  }, [getTotalCalories, dailyGoal]);

  const getWeeklyData = useCallback(() => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      weekData.push({
        date: dateStr,
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
        ...(historicalData[dateStr] || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        }),
      });
    }
    return weekData;
  }, [historicalData]);

  const getMonthlyData = useCallback(() => {
    const monthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      monthData.push({
        date: dateStr,
        day: date.getDate(),
        ...(historicalData[dateStr] || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        }),
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
    DAILY_GOAL: dailyGoal,
    isOnline,
    syncing,
  };
}
