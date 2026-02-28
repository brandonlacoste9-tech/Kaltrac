// Utility functions for Kaltrac

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); 
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function calcStreak(days) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (days[key]?.meals?.length > 0) { 
      streak++; 
      d.setDate(d.getDate() - 1); 
    } else break;
  }
  return streak;
}

export function calcStats(days, goals) {
  const allMeals = Object.values(days).flatMap(d => d.meals || []);
  const totalMeals = allMeals.length;
  const activeDays = Object.values(days).filter(d => (d.meals || []).length > 0).length;
  const waterGoalDays = Object.values(days).filter(d => (d.water || 0) >= goals.water).length;
  const streak = calcStreak(days);
  
  let goalHitDays = 0, macroMasterDays = 0;
  for (const d of Object.values(days)) {
    const cals = (d.meals || []).reduce((s, m) => s + m.calories, 0);
    if (Math.abs(cals - goals.calories) <= 100) goalHitDays++;
    
    const p = (d.meals || []).reduce((s, m) => s + (m.protein || 0), 0);
    const c = (d.meals || []).reduce((s, m) => s + (m.carbs || 0), 0);
    const f = (d.meals || []).reduce((s, m) => s + (m.fat || 0), 0);
    if (p >= goals.protein && c >= goals.carbs && f <= goals.fat + 10) macroMasterDays++;
  }
  
  return { totalMeals, activeDays, waterGoalDays, streak, goalHitDays, macroMasterDays };
}
