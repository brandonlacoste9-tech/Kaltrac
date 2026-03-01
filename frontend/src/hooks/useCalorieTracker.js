import { useState, useCallback } from "react";

const DAILY_GOAL = 2000;

export function useCalorieTracker() {
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  const addToLog = useCallback((foodItem) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLog((prev) => [
      {
        id: Date.now(),
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        time,
        thumb: foodItem.image,
      },
      ...prev,
    ]);
  }, []);

  const removeFromLog = useCallback((id) => {
    setLog((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getTotalCalories = useCallback(() => {
    return log.reduce((sum, item) => sum + item.calories, 0);
  }, [log]);

  const getTotalMacros = useCallback(() => {
    return {
      protein: log.reduce((sum, item) => sum + (item.protein || 0), 0),
      carbs: log.reduce((sum, item) => sum + (item.carbs || 0), 0),
      fat: log.reduce((sum, item) => sum + (item.fat || 0), 0),
    };
  }, [log]);

  const getCaloriePercentage = useCallback(() => {
    const total = getTotalCalories();
    return Math.min((total / DAILY_GOAL) * 100, 100);
  }, [getTotalCalories]);

  return {
    log,
    result,
    setResult,
    addToLog,
    removeFromLog,
    getTotalCalories,
    getTotalMacros,
    getCaloriePercentage,
    DAILY_GOAL,
  };
}
