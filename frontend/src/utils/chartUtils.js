// Chart utility functions for SVG-based visualizations

export const chartUtils = {
  // Format calories value with K suffix if needed
  formatValue: (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
  },

  // Get color based on calorie target achievement
  getColorForCalories: (calories, goal) => {
    const percentage = (calories / goal) * 100;
    if (percentage < 50) return "#999"; // Gray
    if (percentage < 100) return "#ffd700"; // Gold
    if (percentage < 125) return "#4ade80"; // Green
    return "#ef4444"; // Red (over)
  },

  // Calculate bar height based on values
  calculateBarHeight: (value, maxValue, maxHeight = 200) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * maxHeight;
  },

  // Get readable day label
  getDayLabel: (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short" });
  },

  // Get max value from array for scaling
  getMaxValue: (dataArray, key) => {
    const values = dataArray.map((item) => item[key] || 0);
    return Math.max(...values) || 1;
  },

  // Format date for display
  formatDate: (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  },

  // Smooth animation easing
  easeInOutQuad: (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
};
