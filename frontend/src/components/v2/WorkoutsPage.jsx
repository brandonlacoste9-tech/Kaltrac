import React, { useState } from 'react';
import { useTranslation } from '../../i18n/translations';
import { workoutsAPI } from '../../services/api';

export function WorkoutsPage({ log, onAddWorkout, onRemoveWorkout, language }) {
  const { t } = useTranslation(language);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('moderate');
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(false);

  const MET_LOOKUP = {
    running: 11,
    walking: 4,
    cycling: 8,
    swimming: 10,
    strength: 5,
    lifting: 5,
    yoga: 3,
    hiit: 14,
    crossfit: 12
  };

  const calculateCalories = (val) => {
    const key = val.toLowerCase().trim();
    const met = MET_LOOKUP[key] || 6; 
    const intensityFactor = intensity === 'light' ? 0.8 : intensity === 'intense' ? 1.3 : 1;
    const calc = Math.round(met * duration * intensityFactor);
    setCalories(calc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exercise) return;
    setLoading(true);
    try {
      const workoutData = {
        exercise_name: exercise,
        duration_minutes: duration,
        calories_burned: calories,
        intensity: intensity,
        logged_at: new Date().toISOString()
      };
      await onAddWorkout(workoutData);
      setExercise('');
      setDuration(30);
      setCalories(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalBurned = log.reduce((sum, w) => sum + Number(w.calories_burned), 0);

  return (
    <div className="workouts-page animate-in">
      <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', marginBottom: '32px' }}>
        <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
           <span className="fleur" style={{ marginLeft: '12px' }}>🔥</span>
           <span className="strap-text" style={{ fontSize: '13px' }}>{t('activeStats')}</span>
        </div>
        <div style={{ textAlign: 'center', padding: '48px 32px' }}>
          <h2 className="serif" style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('energyBurned')}</h2>
          <div style={{ marginTop: '16px' }}>
             <span className="serif" style={{ fontSize: '56px', color: 'var(--gold)', textShadow: '0 4px 12px var(--gold-glow)' }}>{totalBurned}</span> <span className="serif" style={{ fontSize: '20px', color: 'var(--muted)' }}>{t('kcal')}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', marginBottom: '32px' }}>
        <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
           <span className="fleur" style={{ marginLeft: '12px' }}>🏋️</span>
           <span className="strap-text" style={{ fontSize: '13px' }}>{t('logWorkout')}</span>
        </div>
        <div style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
             <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>{t('exerciseName')}</label>
             <input type="text" value={exercise} onChange={(e) => {setExercise(e.target.value); calculateCalories(e.target.value);}} placeholder="Running, CrossFit, Yoga..." required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
             <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>{t('durationMin')}</label>
                <input type="number" value={duration} onChange={(e) => {setDuration(e.target.value); calculateCalories(exercise);}} required />
             </div>
             <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>{t('burned')}</label>
                <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
             </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
             <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>{t('intensity')}</label>
             <div className="toggle-pills" style={{ margin: 0 }}>
                {['light', 'moderate', 'intense'].map(lvl => (
                   <button 
                    key={lvl} 
                    type="button" 
                    className={`toggle-pill ${intensity === lvl ? 'active' : ''}`} 
                    onClick={() => {setIntensity(lvl); calculateCalories(exercise);}}
                   >
                     {t(lvl)}
                   </button>
                ))}
             </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', fontSize: '16px', padding: '16px' }}>
             {loading ? '...' : t('logWorkout')}
          </button>
        </form>
        </div>
      </div>

      {log.length > 0 && (
          <div className="card animate-in" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
               <span className="fleur" style={{ marginLeft: '12px' }}>🗓️</span>
               <span className="strap-text" style={{ fontSize: '13px' }}>{t('todaysSessions')}</span>
            </div>
            <div style={{ padding: '24px' }}>
            {log.map(w => (
               <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h4 style={{ fontSize: '15px' }}>{w.exercise_name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{w.duration_minutes} min · {t(w.intensity)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{w.calories_burned} {t('kcal')}</div>
                     <button onClick={() => onRemoveWorkout(w.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                  </div>
               </div>
            ))}
            </div>
          </div>
      )}
    </div>
  );
}
