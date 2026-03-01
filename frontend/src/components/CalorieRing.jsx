import { useTranslation } from "../i18n/translations";

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieRing({ totalCals, percentage, dailyGoal, language }) {
  const { t } = useTranslation(language);
  const remaining = dailyGoal - totalCals;
  const strokeDashoffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  return (
    <svg className="ring-svg" width="140" height="140" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle className="ring-bg" cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" />
      <circle
        className="ring-fill"
        cx="60"
        cy="60"
        r={RADIUS}
        fill="none"
        strokeWidth="10"
        stroke="url(#ringGradient)"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        filter="url(#glow)"
      />
      <text x="60" y="60" textAnchor="middle" dy="-12" className="ring-value">{Math.round(percentage)}%</text>
      <text x="60" y="60" textAnchor="middle" dy="16" className="ring-label">{Math.round(totalCals)} kcal</text>
    </svg>
  );
}
