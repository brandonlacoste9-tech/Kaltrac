import React, { useState } from 'react';
import { useTranslation } from '../../i18n/translations';
import { aiAPI } from '../../services/api';

export function MealPlannerPage({ goals, userSettings, language, onAddMeal }) {
  const { t } = useTranslation(language);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.generateMealPlan({
        dailyGoal: goals.daily_calorie_goal,
        proteinGoal: goals.daily_protein_goal,
        carbsGoal: goals.daily_carbs_goal,
        fatGoal: goals.daily_fat_goal,
        restrictions: userSettings.dietary_restrictions?.join(', ') || 'None'
      });
      if (res.data.meals) {
        setPlan(res.data.meals);
      }
    } catch (err) {
      setError(t('errorAnalyze'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meal-planner-page animate-in">
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '40px' }}>
         <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
           <span className="fleur" style={{ marginLeft: '12px' }}>🍽️</span>
           <span className="strap-text" style={{ fontSize: '13px' }}>{t('claudeMealPlanning')}</span>
         </div>
        
        <div style={{ textAlign: 'center', padding: '48px 32px' }}>
          <h2 className="serif" style={{ fontSize: '42px', marginBottom: '16px', letterSpacing: '-1px' }}>{t('personalizedFuel').split(' ')[0]} <span style={{ color: 'var(--gold)' }}>{t('personalizedFuel').split(' ').slice(1).join(' ')}</span></h2>
          <p style={{ color: 'var(--muted)', marginBottom: '40px', fontSize: '16px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            {t('personalizedFuel')
              .replace('{{goal}}', goals.daily_calorie_goal)
              .replace('{{count}}', userSettings.dietary_restrictions?.length || 0)}
          </p>
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }} onClick={generatePlan} disabled={loading}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div className="loading" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> {t('analyzing')}</span> : t('generatePlan')}
          </button>
        </div>
      </div>

      {plan && (
        <div className="planner-results" style={{ marginTop: '24px' }}>
          <div className="grid-2x2">
            {plan.map((meal, i) => (
              <div key={i} className="card result-card animate-in" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none", height: '48px' }}>
                  <span className="strap-text" style={{ fontSize: '11px' }}>{meal.type}</span>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontSize: '40px', width: '64px', height: '64px', background: 'var(--raised)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>{meal.emoji}</div>
                    <div>
                      <h3 className="serif" style={{ fontSize: '22px', color: 'var(--text)' }}>{meal.name}</h3>
                    </div>
                  </div>
                  
                  <div style={{ margin: '24px 0' }}>
                     <p className="serif" style={{ fontSize: '32px', color: 'var(--gold)', textShadow: '0 2px 8px var(--gold-glow)' }}>{meal.calories} <small style={{ fontSize: '14px', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--muted)' }}>{t('kcal')}</small></p>
                     <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        <span className="tag-pill green">{t('proteinAbbr')}: {meal.protein}g</span>
                        <span className="tag-pill blue">{t('carbsAbbr')}: {meal.carbs}g</span>
                        <span className="tag-pill gold">{t('fatAbbr')}: {meal.fat}g</span>
                     </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.5 }}>{meal.description}</p>
                  
                  <button className="btn btn-primary" style={{ width: '100%', fontSize: '14px' }} onClick={() => onAddMeal(meal)}>
                     {t('addToLog')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={generatePlan}>{t('regenerate')}</button>
            <button className="btn btn-ghost">{t('saveAsTemplate')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
