import { useState } from "react";
import { DailyChart } from "./DailyChart";
import { WeeklyChart } from "./WeeklyChart";
import { MonthlyChart } from "./MonthlyChart";

export function AnalyticsDashboard({
  log,
  weeklyData,
  monthlyData,
  dailyGoal,
  t,
}) {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          onClick={() => setActiveTab("today")}
          style={{
            ...styles.tab,
            ...(activeTab === "today" ? styles.tabActive : {}),
          }}
        >
          {t("today") || "Today"}
        </button>
        <button
          onClick={() => setActiveTab("week")}
          style={{
            ...styles.tab,
            ...(activeTab === "week" ? styles.tabActive : {}),
          }}
        >
          {t("week") || "Week"}
        </button>
        <button
          onClick={() => setActiveTab("month")}
          style={{
            ...styles.tab,
            ...(activeTab === "month" ? styles.tabActive : {}),
          }}
        >
          {t("month") || "Month"}
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === "today" && (
          <DailyChart meals={log} dailyGoal={dailyGoal} />
        )}
        {activeTab === "week" && (
          <WeeklyChart weeklyData={weeklyData} dailyGoal={dailyGoal} />
        )}
        {activeTab === "month" && (
          <MonthlyChart monthlyData={monthlyData} dailyGoal={dailyGoal} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
  },
  tabNav: {
    display: "flex",
    gap: "0",
    borderBottom: "2px solid #333",
    marginBottom: "20px",
    justifyContent: "center",
  },
  tab: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#999",
    border: "none",
    cursor: "pointer",
    fontFamily: "Fraunces, serif",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
  },
  tabActive: {
    color: "#ffd700",
    borderBottomColor: "#ffd700",
  },
};
