import { chartUtils } from "../utils/chartUtils";

export function MonthlyChart({ monthlyData, dailyGoal }) {
  const maxCalories = chartUtils.getMaxValue(monthlyData, "calories") || dailyGoal;
  const chartHeight = 280;
  const barWidth = 10;
  const gap = 2;
  const padding = 40;
  const chartWidth = (barWidth + gap) * 30 + padding * 2;

  // Calculate bar positions
  const bars = monthlyData.map((day, idx) => {
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
    monthlyData.reduce((sum, day) => sum + day.calories, 0) / 30
  );
  const totalCalories = monthlyData.reduce((sum, day) => sum + day.calories, 0);
  const goalsMetDays = monthlyData.filter((d) => d.calories >= dailyGoal).length;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Monthly Overview</h3>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Avg Daily</div>
          <div style={styles.statValue}>{avgCalories}</div>
          <div style={styles.statUnit}>cal</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Month Total</div>
          <div style={styles.statValue}>
            {(totalCalories / 1000).toFixed(1)}K
          </div>
          <div style={styles.statUnit}>cal</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Goals Met</div>
          <div style={styles.statValue}>{goalsMetDays}</div>
          <div style={styles.statUnit}>% {Math.round((goalsMetDays / 30) * 100)}</div>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartWrapper}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
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

          {/* Week separators */}
          {[1, 2, 3, 4].map((week) => (
            <line
              key={`week-${week}`}
              x1={padding + week * 7 * (barWidth + gap)}
              y1={chartHeight - 40}
              x2={padding + week * 7 * (barWidth + gap)}
              y2={chartHeight - 30}
              stroke="#444"
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {bars.map((bar, idx) => (
            <g key={idx}>
              <rect
                x={bar.x}
                y={bar.y}
                width={barWidth}
                height={Math.max(bar.height, 1)}
                fill={chartUtils.getColorForCalories(bar.calories, dailyGoal)}
                rx="1"
                style={{ transition: "fill 0.3s ease" }}
              />
              <title>{`${chartUtils.formatDate(bar.date)}: ${bar.calories} cal`}</title>
            </g>
          ))}

          {/* Day numbers */}
          {monthlyData.map((day, idx) => {
            const isWeekStart = (idx + 1) % 7 === 1;
            return (
              isWeekStart && (
                <text
                  key={`label-${idx}`}
                  x={padding + idx * (barWidth + gap) + barWidth / 2}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  style={{
                    fontSize: "9px",
                    fill: "#666",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  {day.day}
                </text>
              )
            );
          })}
        </svg>
      </div>

      {/* Weekly averages */}
      <div style={styles.weeklyBreakdown}>
        <h4 style={styles.weeklyTitle}>Weekly Averages</h4>
        <div style={styles.weekGrid}>
          {[0, 1, 2, 3].map((weekIdx) => {
            const weekStart = weekIdx * 7;
            const weekEnd = Math.min(weekStart + 7, 30);
            const weekData = monthlyData.slice(weekStart, weekEnd);
            const weekAvg = Math.round(
              weekData.reduce((sum, day) => sum + day.calories, 0) / weekData.length
            );
            const weekGoalsMet = weekData.filter(
              (d) => d.calories >= dailyGoal
            ).length;

            return (
              <div key={`week-${weekIdx}`} style={styles.weekItem}>
                <span style={styles.weekLabel}>Week {weekIdx + 1}</span>
                <span style={styles.weekValue}>{weekAvg}</span>
                <span style={styles.weekGoals}>
                  {weekGoalsMet}/{weekData.length} days
                </span>
              </div>
            );
          })}
        </div>
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
  weeklyBreakdown: {
    borderTop: "1px solid #333",
    paddingTop: "15px",
  },
  weeklyTitle: {
    color: "#999",
    fontSize: "12px",
    fontFamily: "DM Mono, monospace",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  weekGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },
  weekItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
    backgroundColor: "#222",
    padding: "10px",
    borderRadius: "6px",
  },
  weekLabel: {
    color: "#999",
    fontSize: "11px",
    fontFamily: "DM Mono, monospace",
  },
  weekValue: {
    color: "#ffd700",
    fontSize: "16px",
    fontFamily: "Fraunces, serif",
    fontWeight: "bold",
  },
  weekGoals: {
    color: "#666",
    fontSize: "10px",
    fontFamily: "DM Mono, monospace",
  },
};
