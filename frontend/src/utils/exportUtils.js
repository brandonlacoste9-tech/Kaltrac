// Export utilities for CSV and PDF
export function exportToCSV(data, filename = 'kaltrac-data.csv') {
  // Prepare CSV headers
  const headers = ['Date', 'Name', 'Type', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'];
  
  // Prepare CSV rows
  const rows = data.map(item => [
    item.date || new Date(item.logged_at).toISOString().split('T')[0],
    item.name || item.exercise_name || 'Water',
    item.exercise_name ? 'Workout' : 'Meal',
    item.calories || item.calories_burned || '-',
    item.protein || '-',
    item.carbs || '-',
    item.fat || '-'
  ]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function generateSimplePDF(weekData, monthData, dailyGoal) {
  // Since we don't want to add dependencies, create a simple PDF-like structure
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size (A4)
  canvas.width = 800;
  canvas.height = 1000;
  
  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 32px Fraunces';
  ctx.fillText('KalTrac Report', 50, 60);
  
  // Date
  ctx.fillStyle = '#999';
  ctx.font = '14px DM Mono';
  const today = new Date().toISOString().split('T')[0];
  ctx.fillText(`Generated: ${today}`, 50, 90);
  
  // Weekly summary
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px Fraunces';
  ctx.fillText('Weekly Summary', 50, 150);
  
  ctx.fillStyle = '#ccc';
  ctx.font = '12px DM Mono';
  
  let yPos = 180;
  const weekTotal = weekData.reduce((sum, day) => sum + day.calories, 0);
  const weekAvg = Math.round(weekTotal / weekData.length);
  
  ctx.fillText(`Total Calories (Week): ${weekTotal}`, 50, yPos);
  yPos += 25;
  ctx.fillText(`Average Daily: ${weekAvg}`, 50, yPos);
  yPos += 25;
  ctx.fillText(`Daily Goal: ${dailyGoal}`, 50, yPos);
  
  // Day breakdown
  yPos += 40;
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px Fraunces';
  ctx.fillText('Daily Breakdown', 50, yPos);
  
  yPos += 30;
  ctx.fillStyle = '#bbb';
  ctx.font = '11px DM Mono';
  
  weekData.forEach((day, index) => {
    const line = `${day.day}: ${day.calories} cal (Goal: ${dailyGoal})`;
    ctx.fillText(line, 50, yPos);
    yPos += 20;
  });
  
  // Convert to image and download
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `kaltrac-report-${today}.png`;
  link.click();
}

export function exportWeeklyStats(weekData, dailyGoal) {
  const data = {
    reportDate: new Date().toISOString().split('T')[0],
    dailyGoal,
    weekData: weekData.map(day => ({
      date: day.date,
      day: day.day,
      calories: day.calories,
      protein: day.protein,
      carbs: day.carbs,
      fat: day.fat,
      goalMet: day.calories >= dailyGoal
    })),
    weekTotal: weekData.reduce((sum, day) => sum + day.calories, 0),
    weekAverage: Math.round(weekData.reduce((sum, day) => sum + day.calories, 0) / weekData.length),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kaltrac-weekly-${data.reportDate}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
}
