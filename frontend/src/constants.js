// Constants for Kaltrac app

export const DEFAULT_GOALS = { 
  calories: 2000, 
  protein: 150, 
  carbs: 250, 
  fat: 65, 
  water: 8 
};

export const TODAY = () => new Date().toISOString().split("T")[0];

export const FMT_DATE = (d) => new Date(d + "T12:00:00").toLocaleDateString("en", { 
  weekday: "short", 
  month: "short", 
  day: "numeric" 
});

export const SHORT_DAY = (d) => new Date(d + "T12:00:00").toLocaleDateString("en", { 
  weekday: "short" 
});

export const BADGES = [
  { id: "first_bite",    icon: "🌱", name: "First Bite",    desc: "Log your first meal",              check: (s) => s.totalMeals >= 1 },
  { id: "hydrated",      icon: "💧", name: "Hydrated",      desc: "Hit water goal for a day",          check: (s) => s.waterGoalDays >= 1 },
  { id: "streak_3",      icon: "🔥", name: "On Fire",       desc: "3-day logging streak",              check: (s) => s.streak >= 3 },
  { id: "streak_7",      icon: "⚡", name: "Electric Week", desc: "7-day logging streak",              check: (s) => s.streak >= 7 },
  { id: "calorie_goal",  icon: "🎯", name: "Bullseye",      desc: "Hit calorie goal within 100 kcal", check: (s) => s.goalHitDays >= 1 },
  { id: "macro_master",  icon: "🏆", name: "Macro Master",  desc: "Hit all macro goals in one day",   check: (s) => s.macroMasterDays >= 1 },
  { id: "ten_meals",     icon: "🍽️",  name: "Foodie",       desc: "Log 10 total meals",               check: (s) => s.totalMeals >= 10 },
  { id: "week_logged",   icon: "📅", name: "Week Warrior",  desc: "Log meals 7 different days",        check: (s) => s.activeDays >= 7 },
];

export const COLORS = { 
  calories: "#e8a045", 
  protein: "#7ec98a", 
  carbs: "#6ab4e8", 
  fat: "#e87a9a", 
  water: "#5ec4c4" 
};
