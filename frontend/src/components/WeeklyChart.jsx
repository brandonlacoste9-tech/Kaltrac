import { chartUtils } from "../utils/chartUtils";

export function WeeklyChart({ weeklyData, dailyGoal }) {
  const maxCalories = chartUtils.getMaxValue(weeklyData, "calories") || dailyGoal;
  const chartHeight = 250;
  const barWidth = 40;
  const gap = 8;
  const padding = 40;
  const chartWidth = (barWidth + gap) * 7 + padding * 2;

  // Calculate bar positions
  const bars = weeklyData.map((day, idx) => {
    const barHeight = chartUtils.calculateBarHeight(
      day.calories,
      maxCalories,
      chartHeight - 60
    );
    const x = padding + idx * (barWidth + gap);
    const y = chartHeight - barHeight - 40;

    return {
      x,
      y,
      height: barHeight,
      calories: day.calories,
      day: day.day,
      date: day.date,
      achieved: day.calories >= dailyGoal,
    };
  });

  const avgCalories = Math.round(
    weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7
  );
  const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Weekly Overview</h3>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Avg Daily</div>
          <div style={styles.statValue}>{avgCalories}</div>
          <div style={styles.statUnit}>cal</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Week Total</div>
          <div style={styles.statValue}>{totalCalories}</div>
          <div style={styles.statUnit}>cal</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Goal Met</div>
          <div style={styles.statValue}>
            {weeklyData.filter((d) => d.calories >= dailyGoal).length}
          </div>
          <div style={styles.statUnit}>days</div>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartWrapper}>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Goal line */}
          <line
            x1={padding}
            y1={chartHeight - (dailyGoal / maxCalories) * (chartHeight - 60) - 40}
            x2={chartWidth - padding}
            y2={chartHeight - (dailyGoal / maxCalories) * (chartHeight - 60) - 40}
            stroke="#666"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <text
            x={padding - 30}
            y={chartHeight - (dailyGoal / maxCalories) * (chartHeight - 60) - 35}
            style={{
              fontSize: "10px",
              fill: "#666",
              fontFamily: "DM Mono, monospace",
            }}
          >
            Goal
          </text>

          {/* Bars */}
          {bars.map((bar, idx) => (
            <g key={idx}>
              <rect
                x={bar.x}
                y={bar.y}
                width={barWidth}
                height={bar.height}
                fill={chartUtils.getColorForCalories(bar.calories, dailyGoal)}
                rx="4"
                style={{ transition: "fill 0.3s ease" }}
              />
              {/* Day label */}
              <text
                x={bar.x + barWidth / 2}
                y={chartHeight - 15}
                textAnchor="middle"
                style={{
                  fontSize: "12px",
                  fill: "#999",
                  fontFamily: "DM Mono, monospace",
                }}
              >
                {bar.day}
              </text>
              {/* Value on hover area */}
              <title>{`${bar.day}: ${bar.calories} cal`}</title>
            </g>
          ))}
        </svg>
      </div>

      {/* Detailed breakdown */}
      <div style={styles.breakdown}>
        {weeklyData.map((day, idx) => (
          <div key={idx} style={styles.breakdownItem}>
            <span style={styles.breakdownDay}>{day.day}</span>
            <span
              style={{
                color: chartUtils.getColorForCalories(day.calories, dailyGoal),
                fontWeight: "600",
              }}
            >
              {day.calories}
            </span>
            <span style={styles.breakdownGoal}>/ {dailyGoal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  title: {
    color: "#ffd700",
    fontSize: "18px",
    fontFamily: "Fraunces, serif",
    marginBottom: "20px",
    textAlign: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "20px",
  },
  stat: {
    backgroundColor: "#222",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
  },
  statLabel: {
    color: "#999",
    fontSize: "11px",
    fontFamily: "DM Mono, monospace",
    textTransform: "uppercase",
    marginBottom: "5px",
  },
  statValue: {
    color: "#ffd700",
    fontSize: "20px",
    fontFamily: "Fraunces, serif",
    fontWeight: "bold",
  },
  statUnit: {
    color: "#666",
    fontSize: "10px",
    fontFamily: "DM Mono, monospace",
  },
  chartWrapper: {
    marginBottom: "20px",
    overflowX: "auto",
  },
  breakdown: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    paddingTop: "15px",
    borderTop: "1px solid #333",
  },
  breakdownItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
  },
  breakdownDay: {
    color: "#999",
    fontFamily: "DM Mono, monospace",
    textTransform: "uppercase",
  },
  breakdownGoal: {
    color: "#666",
    fontSize: "10px",
  },
};
