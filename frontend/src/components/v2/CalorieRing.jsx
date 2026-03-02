import React from 'react';
import { useTranslation } from '../../i18n/translations';

export function CalorieRing({ eaten, goal, language }) {
  const { t } = useTranslation(language);
  const percentage = Math.round((eaten / goal) * 100);
  const remaining = goal - eaten;
  
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const getRingColor = () => {
    if (percentage < 75) return 'var(--green)';
    if (percentage <= 100) return 'var(--gold)';
    return 'var(--red)';
  };

  return (
    <div className="card ring-card" style={{ padding: '48px 24px', overflow: 'hidden', position: 'relative' }}>
      
      {/* Decorative Leather Accent at Top */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60px', height: '12px', background: 'var(--raised)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', border: '1px solid var(--border)', borderTop: 'none', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', position: 'absolute', top: '4px', left: '10px', boxShadow: '0 0 4px var(--gold)' }}></div>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', position: 'absolute', top: '4px', right: '10px', boxShadow: '0 0 4px var(--gold)' }}></div>
      </div>

      <div className="ring-container" style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 32px' }}>
        {/* Decorative Outer Ring Glimmer */}
        <div style={{ position: 'absolute', inset: '-10px', border: '1px solid var(--border)', borderRadius: '50%', opacity: 0.3 }}></div>
        
        <svg className="ring-svg" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
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
            cx="100" 
            cy="100" 
            r={radius} 
            fill="none" 
            stroke="var(--stitch)" 
            strokeWidth="3" 
            strokeDasharray="6 6"
            opacity="0.5"
          />

          <circle
            className="ring-bg"
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="12"
          />
          <circle
            className="ring-fill"
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={percentage <= 100 ? "url(#premiumGoldGradient)" : getRingColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter={percentage <= 100 ? "url(#premiumGoldGlow)" : `drop-shadow(0 0 8px ${getRingColor()}60)`}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="ring-text" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="serif" style={{ fontSize: '56px', color: 'var(--gold)', lineHeight: 1, letterSpacing: '-2px', textShadow: '0 2px 10px var(--gold-glow)' }}>{Math.round(eaten)}</span>
          <span style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{t('kcal')}</span>
        </div>
      </div>

      <div className="stat-pills" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <StatPill value={Math.round(eaten)} label={t('eaten')} t={t} />
        <StatPill 
          value={remaining < 0 ? `+${Math.abs(Math.round(remaining))}` : Math.round(remaining)} 
          label={t('remaining')} 
          color={remaining < 0 ? 'var(--red)' : 'var(--gold)'}
          t={t}
        />
        <StatPill value={percentage} unit="%" label={t('done')} t={t} />
      </div>
    </div>
  );
}

function StatPill({ value, label, unit = '', color = 'var(--gold)', t }) {
  return (
    <div style={{ 
      background: 'var(--raised)', 
      padding: '10px 16px', 
      borderRadius: '20px', 
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: '80px',
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)'
    }}>
      <span className="serif" style={{ fontSize: '18px', color: color }}>{value}{unit}</span>
      <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</span>
    </div>
  );
}
