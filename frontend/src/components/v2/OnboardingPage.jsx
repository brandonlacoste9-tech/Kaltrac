import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/translations';
import { settingsAPI } from '../../services/api';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function lbsToKg(lbs) { return Number(lbs) / 2.20462; }
function ftInToCm(ft, inch) { return (Number(ft) * 12 + Number(inch || 0)) * 2.54; }

function computeTDEE(sex, weightKg, heightCm, age, activityKey) {
  if (!weightKg || !heightCm || !age) return null;
  const w = Number(weightKg);
  const h = Number(heightCm);
  const a = Number(age);
  if (w <= 0 || h <= 0 || a <= 0) return null;
  const bmr =
    sex === 'female'
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5;
  const mult = ACTIVITY_MULTIPLIERS[activityKey] || 1.2;
  return Math.round(bmr * mult);
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid var(--v2-border)',
  background: 'rgba(0,0,0,0.25)',
  color: 'var(--v2-text)',
  fontSize: '16px',
};

export function OnboardingPage({ onComplete, language }) {
  const { t } = useTranslation(language);
  const [name, setName] = useState('');
  const [sex, setSex] = useState('male');
  const [useImperial, setUseImperial] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');

  const weightKgValue = useMemo(() => {
    if (useImperial) return weightLbs ? lbsToKg(weightLbs) : null;
    return weightKg ? Number(weightKg) : null;
  }, [useImperial, weightKg, weightLbs]);

  const heightCmValue = useMemo(() => {
    if (useImperial) return (heightFt || heightIn) ? ftInToCm(heightFt, heightIn) : null;
    return heightCm ? Number(heightCm) : null;
  }, [useImperial, heightCm, heightFt, heightIn]);

  const suggestedCalories = useMemo(
    () => computeTDEE(sex, weightKgValue, heightCmValue, age, activityLevel),
    [sex, weightKgValue, heightCmValue, age, activityLevel]
  );

  const finish = async (applySuggested = false) => {
    try {
      const payload = {
        language: language || 'fr',
        name: name.trim() || undefined,
        sex,
        weightKg: weightKgValue != null ? Math.round(weightKgValue * 10) / 10 : undefined,
        heightCm: heightCmValue != null ? Math.round(heightCmValue) : undefined,
        age: age ? Number(age) : undefined,
        activityLevel,
      };
      if (applySuggested && suggestedCalories) payload.dailyGoal = suggestedCalories;
      await settingsAPI.update(payload);
      localStorage.setItem('kaltrac-onboarded', 'true');
      onComplete();
    } catch (e) {
      console.error(e);
      localStorage.setItem('kaltrac-onboarded', 'true');
      onComplete();
    }
  };

  const section = (label, children) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--v2-muted)', marginBottom: '0.6rem' }}>{label}</div>
      {children}
    </div>
  );

  return (
    <div className="v2-page" style={{ padding: '1.5rem', maxWidth: '440px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1.25rem 0' }}>{t('yourProfile')}</h1>

      {section(t('yourName') || 'Name', (
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kal" style={inputStyle} />
      ))}

      {section(t('onboardingSex'), (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['male', 'female', 'other'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              style={{
                flex: '1 1 100px',
                padding: '14px 16px',
                borderRadius: '14px',
                border: sex === s ? '2px solid var(--v2-gold)' : '1px solid var(--v2-border)',
                background: sex === s ? 'rgba(198, 166, 100, 0.2)' : 'rgba(0,0,0,0.2)',
                color: 'var(--v2-text)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {t(s === 'male' ? 'sexMale' : s === 'female' ? 'sexFemale' : 'sexOther')}
            </button>
          ))}
        </div>
      ))}

      {section(t('weightLabel') + ' & ' + t('heightLabel'), (
        <>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
            <button type="button" onClick={() => setUseImperial(false)} style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--v2-border)', background: !useImperial ? 'var(--v2-gold)' : 'transparent', color: !useImperial ? '#111' : 'var(--v2-muted)', fontSize: '12px', fontWeight: 600 }}>{t('unitMetric')}</button>
            <button type="button" onClick={() => setUseImperial(true)} style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--v2-border)', background: useImperial ? 'var(--v2-gold)' : 'transparent', color: useImperial ? '#111' : 'var(--v2-muted)', fontSize: '12px', fontWeight: 600 }}>{t('unitImperial')}</button>
          </div>
          {useImperial ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 90px' }}>
              <label style={{ fontSize: '12px', color: 'var(--v2-muted)' }}>{t('lbs')}</label>
              <input type="number" min="60" max="600" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="154" style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 50px' }}>
              <label style={{ fontSize: '12px', color: 'var(--v2-muted)' }}>{t('ft')}</label>
              <input type="number" min="3" max="8" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 50px' }}>
              <label style={{ fontSize: '12px', color: 'var(--v2-muted)' }}>{t('inch')}</label>
              <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="10" style={inputStyle} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ fontSize: '12px', color: 'var(--v2-muted)' }}>kg</label>
              <input type="number" min="30" max="300" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ fontSize: '12px', color: 'var(--v2-muted)' }}>cm</label>
              <input type="number" min="100" max="250" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="170" style={inputStyle} />
            </div>
          </div>
          </div>
          )
        </>
      ))}

      {section(t('ageLabel'), (
        <input type="number" min="13" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" style={inputStyle} />
      ))}

      {section(t('activityLevel'), (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { key: 'sedentary', label: t('activitySedentary') },
            { key: 'light', label: t('activityLight') },
            { key: 'moderate', label: t('activityModerate') },
            { key: 'active', label: t('activityActive') },
            { key: 'very_active', label: t('activityVeryActive') },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivityLevel(key)}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: activityLevel === key ? '2px solid var(--v2-gold)' : '1px solid var(--v2-border)',
                background: activityLevel === key ? 'rgba(198, 166, 100, 0.15)' : 'rgba(0,0,0,0.2)',
                color: 'var(--v2-text)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ))}

      {suggestedCalories != null && (
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '14px', background: 'rgba(198, 166, 100, 0.12)', border: '1px solid rgba(198, 166, 100, 0.35)' }}>
          <div style={{ fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '0.25rem' }}>{t('suggestedCalories')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--v2-gold)' }}>{suggestedCalories} kcal/day</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" style={{ flex: '1 1 160px', padding: '16px' }} onClick={() => finish(!!suggestedCalories)}>
          {suggestedCalories != null ? t('applySuggested') : t('next')}
        </button>
        <button type="button" className="btn btn-ghost" style={{ padding: '16px' }} onClick={() => finish(false)}>{t('skip')}</button>
      </div>
    </div>
  );
}
