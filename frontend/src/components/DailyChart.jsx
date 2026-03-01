import { chartUtils } from "../utils/chartUtils";

export function DailyChart({ meals, dailyGoal }) {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const percentage = Math.min((totalCalories / dailyGoal) * 100, 100);

  const macros = {
    protein: meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
    carbs: meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
    fat: meals.reduce((sum, meal) => sum + (meal.fat || 0), 0),
  };

  const totalMacroCalories =
    macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
  const macroPercentages = {
    protein: (macros.protein * 4) / totalMacroCalories || 0,
    carbs: (macros.carbs * 4) / totalMacroCalories || 0,
    fat: (macros.fat * 9) / totalMacroCalories || 0,
  };

  const chartSize = 280;
  const radius = chartSize / 2 - 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Today's Progress</h3>

      {/* Circular Progress */}
      <div style={styles.chartWrapper}>
        <svg width={chartSize} height={chartSize} style={styles.svg}>
          {/* Background circle */}
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="#333"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="#ffd700"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: `${chartSize / 2}px ${chartSize / 2}px`,
              transition: "stroke-dashoffset 0.3s ease",
            }}
          />
          {/* Center text */}
          <text
            x={chartSize / 2}
            y={chartSize / 2 - 10}
            textAnchor="middle"
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              fill: "#ffd700",
              fontFamily: "Fraunces, serif",
            }}
          >
            {totalCalories}
          </text>
          <text
            x={chartSize / 2}
            y={chartSize / 2 + 20}
            textAnchor="middle"
            style={{
              fontSize: "12px",
              fill: "#999",
              fontFamily: "DM Mono, monospace",
            }}
          >
            / {dailyGoal} cal
          </text>
        </svg>
      </div>

      {/* Macros Breakdown */}
      <div style={styles.macrosContainer}>
        <div style={styles.macroBar}>
          <div style={styles.macroLabel}>Protein</div>
          <div style={styles.macroValue}>{macros.protein.toFixed(1)}g</div>
          <div
            style={{
              ...styles.progressBar,
              backgroundColor: "#ef4444",
            }}
          >
            <div
              style={{
                width: `${macroPercentages.protein * 100}%`,
                height: "100%",
                backgroundColor: "#ef4444",
              }}
            />
          </div>
        </div>

        <div style={styles.macroBar}>
          <div style={styles.macroLabel}>Carbs</div>
          <div style={styles.macroValue}>{macros.carbs.toFixed(1)}g</div>
          <div
            style={{
              ...styles.progressBar,
              backgroundColor: "#3b82f6",
            }}
          >
            <div
              style={{
                width: `${macroPercentages.carbs * 100}%`,
                height: "100%",
                backgroundColor: "#3b82f6",
              }}
            />
          </div>
        </div>

        <div style={styles.macroBar}>
          <div style={styles.macroLabel}>Fat</div>
          <div style={styles.macroValue}>{macros.fat.toFixed(1)}g</div>
          <div
            style={{
              ...styles.progressBar,
              backgroundColor: "#a78bfa",
            }}
          >
            <div
              style={{
                width: `${macroPercentages.fat * 100}%`,
                height: "100%",
                backgroundColor: "#a78bfa",
              }}
            />
          </div>
        </div>
      </div>

      {/* Meals List */}
      {meals.length > 0 && (
        <div style={styles.mealsList}>
          <h4 style={styles.mealsTitle}>Meals Today</h4>
          {meals.map((meal, idx) => (
            <div key={idx} style={styles.mealItem}>
              <span style={styles.mealName}>{meal.name}</span>
              <span style={styles.mealCalories}>{meal.calories} cal</span>
            </div>
          ))}
        </div>
      )}
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
  chartWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  svg: {
    maxWidth: "100%",
    height: "auto",
  },
  macrosContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  macroBar: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  macroLabel: {
    color: "#999",
    fontSize: "12px",
    fontFamily: "DM Mono, monospace",
    textTransform: "uppercase",
  },
  macroValue: {
    color: "#ffd700",
    fontSize: "14px",
    fontFamily: "Fraunces, serif",
    fontWeight: "600",
  },
  progressBar: {
    height: "8px",
    borderRadius: "4px",
    backgroundColor: "#333",
    overflow: "hidden",
  },
  mealsList: {
    borderTop: "1px solid #333",
    paddingTop: "15px",
  },
  mealsTitle: {
    color: "#999",
    fontSize: "12px",
    fontFamily: "DM Mono, monospace",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  mealItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #222",
    color: "#ccc",
    fontSize: "13px",
  },
  mealName: {
    color: "#ccc",
  },
  mealCalories: {
    color: "#ffd700",
    fontWeight: "600",
  },
};
