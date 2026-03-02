import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { DailyChart } from "./DailyChart";
import { WeeklyChart } from "./WeeklyChart";
import { MonthlyChart } from "./MonthlyChart";

export function AnalyticsDashboard({
  log = [],
  weeklyData,
  monthlyData,
  dailyGoal,
  t,
}) {
  const [activeTab, setActiveTab] = useState("today");

  // Calculate macros from today's log
  const todayMacros = log.reduce(
    (acc, meal) => ({
      protein: acc.protein + (Number(meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.carbs) || 0),
      fat: acc.fat + (Number(meal.fat) || 0),
      calories: acc.calories + (Number(meal.calories) || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );

  const macroData = [
    { name: t("protein") || "Protein", value: todayMacros.protein, color: "var(--blue)" },
    { name: t("carbs") || "Carbs", value: todayMacros.carbs, color: "var(--green)" },
    { name: t("fat") || "Fat", value: todayMacros.fat, color: "var(--gold)" },
  ];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      
      {/* Premium Macro Wheel Section */}
      <div className="card" style={{ padding: 0 }}>
        {/* Leather Strap Header */}
        <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
          <div className="buckle">
            <div className="buckle-prong"></div>
          </div>
          <span className="fleur">⚜</span>
          <span className="strap-text">Nutrition Breakdown</span>
        </div>
        
        <div style={{ padding: "var(--space-lg)" }}>
          <p style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-body)", marginBottom: "var(--space-md)" }}>
            Your macroscopic footprint today
          </p>
          
          <div style={{ position: "relative", width: "100%", height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px rgba(197, 160, 85, 0.3))` }} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)' }} 
                  itemStyle={{ color: 'var(--gold)', fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'var(--font-body)' }}/>
              </PieChart>
            </ResponsiveContainer>
            
            <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", top: "50%", left: "50%", transform: "translate(-50%, -60%)", pointerEvents: "none" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "700", color: "var(--text)", textShadow: "0 2px 10px var(--gold-glow)" }}>
                {todayMacros.calories}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>
                kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="toggle-pills" style={{ maxWidth: "400px", margin: "0 auto", marginBottom: "var(--space-lg)" }}>
        <button
          onClick={() => setActiveTab("today")}
          className={`toggle-pill ${activeTab === "today" ? "active" : ""}`}
        >
          {t("today") || "Today"}
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={`toggle-pill ${activeTab === "week" ? "active" : ""}`}
        >
          {t("week") || "Week"}
        </button>
        <button
          onClick={() => setActiveTab("month")}
          className={`toggle-pill ${activeTab === "month" ? "active" : ""}`}
        >
          {t("month") || "Month"}
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
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
