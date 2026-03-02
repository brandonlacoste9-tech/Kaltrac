import { useTranslation } from "../i18n/translations";
import { useEffect, useState } from "react";

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieRing({ totalCals, percentage, dailyGoal, language }) {
  const { t } = useTranslation(language);
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE);

  // Smooth entry animation for the ring
  useEffect(() => {
    // Delay slightly to allow mounting then animate
    const timeout = setTimeout(() => {
      const offset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
      setAnimatedOffset(offset);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto" }}>
      <svg className="ring-svg" width="160" height="160" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="premiumGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e8d5a8', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#c5a055', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#a0802a', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="premiumGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background Track - Stitching Style */}
        <circle 
          cx="70" 
          cy="70" 
          r={RADIUS} 
          fill="none" 
          stroke="var(--stitch)" 
          strokeWidth="2" 
          strokeDasharray="4 4"
          opacity="0.5"
        />
        
        {/* Background Track Thick */}
        <circle 
          cx="70" 
          cy="70" 
          r={RADIUS} 
          fill="none" 
          stroke="rgba(0,0,0,0.4)" 
          strokeWidth="12" 
        />
        
        {/* Animated Progress Ring */}
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          stroke="url(#premiumGoldGradient)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          filter="url(#premiumGoldGlow)"
          style={{ transition: "stroke-dashoffset 1.2s var(--ease)" }}
        />
      </svg>
      
      {/* Centered Text Elements */}
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: "36px", 
          fontWeight: "700", 
          color: "var(--gold)",
          textShadow: "0 2px 10px var(--gold-glow)",
          lineHeight: "1.1",
        }}>
          {Math.round(percentage)}%
        </span>
        <span style={{ 
          fontFamily: "var(--font-body)", 
          fontSize: "12px", 
          color: "var(--text)", 
          textTransform: "uppercase", 
          letterSpacing: "1px",
          marginTop: "4px",
          fontWeight: "600",
          opacity: 0.9
        }}>
          {Math.round(totalCals)} kcal
        </span>
      </div>
    </div>
  );
}
