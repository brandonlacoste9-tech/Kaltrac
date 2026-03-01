import { useTranslation } from "../i18n/translations";

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieRing({ totalCals, percentage, dailyGoal, language }) {
  const { t } = useTranslation(language);
  const remaining = dailyGoal - totalCals;
  const strokeDashoffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  return (
    <div className="ring-section">
      <div className="ring-wrap">
        <svg className="ring-svg" width="120" height="120" viewBox="0 0 120 120">
          <circle className="ring-bg" cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="8" />
          <circle
            className="ring-fill"
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="ring-text">
          <div className="ring-cal">{totalCals}</div>
          <div className="ring-label">{t("kcalEaten")}</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat-row">
          <span className="stat-label">{t("goal")}</span>
          <span className="stat-val">
            {dailyGoal} {t("kcal")}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">{t("eaten")}</span>
          <span className="stat-val accent">{totalCals} {t("kcal")}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">{t("remaining")}</span>
          <span className={`stat-val ${remaining < 0 ? "red" : "green"}`}>
            {remaining < 0 ? Math.abs(remaining) : remaining} {t("kcal")}
          </span>
        </div>
      </div>
    </div>
  );
}
