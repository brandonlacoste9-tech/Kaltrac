import React from 'react';
import { useTranslation } from '../../i18n/translations';

export function WaterPage({ current, goal, onUpdate, language }) {
  const { t } = useTranslation(language);

  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="water-page animate-in" style={{ textAlign: 'center' }}>
      <div className="card" style={{ padding: '60px 40px' }}>
         <h2 className="serif" style={{ fontSize: '32px', marginBottom: '8px' }}>{t('water')}</h2>
         <p style={{ color: 'var(--muted)', marginBottom: '40px' }}>{t('stayHydrated')}</p>

         <div className="water-container" style={{ position: 'relative', width: '200px', height: '300px', background: 'var(--raised)', borderRadius: '24px 24px 44px 44px', margin: '0 auto 40px', overflow: 'hidden', border: '5px solid var(--border)' }}>
            <div className="water-fill" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${percentage}%`, background: 'var(--blue)', transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.2)' }}>
               <div className="wave"></div>
            </div>
            
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
               <span className="serif" style={{ fontSize: '48px', color: percentage > 50 ? 'white' : 'var(--blue)' }}>{current}</span>
               <span style={{ fontSize: '12px', opacity: 0.6 }}>{t('glasses')}</span>
            </div>
         </div>

         <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button className="btn btn-ghost" style={{ fontSize: '24px', borderRadius: '50%', width: '60px', height: '60px', padding: 0 }} onClick={() => onUpdate(Math.max(0, current - 1))}>−</button>
            <button className="btn btn-primary" style={{ fontSize: '24px', borderRadius: '50%', width: '60px', height: '60px', padding: 0 }} onClick={() => onUpdate(current + 1)}>+</button>
         </div>

         <div style={{ marginTop: '40px', fontSize: '14px', color: 'var(--muted)' }}>
            {t('goalTargets')} {goal} {t('glasses')}
            {current >= goal && <div style={{ color: 'var(--green)', fontWeight: 'bold', marginTop: '12px' }}>{t('dailyGoalReached')}</div>}
         </div>
      </div>
    </div>
  );
}
