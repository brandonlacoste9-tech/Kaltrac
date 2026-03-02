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
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 className="serif" style={{ fontSize: '28px', marginBottom: '16px' }}>{t('claudeMealPlanning')}</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
          {t('personalizedFuel')
            .replace('{{goal}}', goals.daily_calorie_goal)
            .replace('{{count}}', userSettings.dietary_restrictions?.length || 0)}
        </p>
        <button className="btn btn-primary" onClick={generatePlan} disabled={loading}>
          {loading ? t('analyzing') : t('generatePlan')}
        </button>
      </div>

      {plan && (
        <div className="planner-results" style={{ marginTop: '24px' }}>
          <div className="grid-2x2">
            {plan.map((meal, i) => (
              <div key={i} className="card result-card animate-in" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '32px' }}>{meal.emoji}</span>
                  <div>
                    <h3 className="serif">{meal.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{meal.type}</p>
                  </div>
                </div>
                
                <div style={{ margin: '16px 0' }}>
                   <p className="serif" style={{ fontSize: '24px', color: 'var(--gold)' }}>{meal.calories} <small style={{ fontSize: '10px' }}>{t('kcal')}</small></p>
                   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span className="tag-pill green">{t('proteinAbbr')}: {meal.protein}g</span>
                      <span className="tag-pill blue">{t('carbsAbbr')}: {meal.carbs}g</span>
                      <span className="tag-pill pink">{t('fatAbbr')}: {meal.fat}g</span>
                   </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>{meal.description}</p>
                
                <button className="btn btn-ghost" style={{ width: '100%', fontSize: '12px' }} onClick={() => onAddMeal(meal)}>
                   {t('addToLog')}
                </button>
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
