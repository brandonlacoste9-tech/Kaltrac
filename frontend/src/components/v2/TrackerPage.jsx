import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from '../../i18n/translations';
import { CalorieRing } from './CalorieRing';
import { Scanner } from '@yudiel/react-qr-scanner';
import { aiAPI } from '../../services/api';

export function TrackerPage({ user, log, goals, onAddMeal, onRemoveMeal, language }) {
  const { t } = useTranslation(language);
  const [mode, setMode] = useState('photo'); // 'photo' | 'barcode'
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Totals calculations
  const totalEaten = log.reduce((sum, m) => sum + Number(m.calories), 0);
  const totalProtein = log.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
  const totalCarbs = log.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
  const totalFat = log.reduce((sum, m) => sum + (Number(m.fat) || 0), 0);

  // Photo handlers
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    setError(null);
    try {
      const base64 = photo.split(',')[1];
      const response = await aiAPI.analyzeFood(base64);
      const analysis = response.data || response;
      
      if (analysis.fallback) {
        // Ollama not running — show friendly message
        setError(analysis.note || 'AI is offline. Please enter calories manually.');
        setResult(null);
      } else if (analysis.error) {
        setError(analysis.error);
      } else {
        setResult({ ...analysis, source: 'photo' });
      }
    } catch (err) {
      setError(t('errorAnalyze') + ' — Make sure the backend is running on port 5000.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    setScannerOpen(false);
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();
      
      if (data.status === 1) {
        const p = data.product;
        const result = {
          name: p.product_name || 'Unknown Product',
          calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
          protein: p.nutriments?.proteins_100g || 0,
          carbs: p.nutriments?.carbohydrates_100g || 0,
          fat: p.nutriments?.fat_100g || 0,
          source: 'barcode',
          image_url: p.image_url
        };
        setResult(result);
      } else {
        setError(t('errorNotFound'));
      }
    } catch (err) {
      setError(t('errorNetwork'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    const input = document.getElementById('manual-barcode-input');
    if (input && input.value) {
      handleBarcodeDetected(input.value);
    }
  };

  const handleAddResult = () => {
    if (result) {
      onAddMeal({ ...result, logged_at: new Date().toISOString() });
      setResult(null);
      setPhoto(null);
    }
  };

  return (
    <div className="tracker-page animate-in">
      {analyzing && <div className="loading-overlay"><div className="loading"></div></div>}
      <CalorieRing eaten={totalEaten} goal={goals.daily_calorie_goal} language={language} />

      <div className="card macro-bars">
        <h3 className="serif" style={{ marginBottom: '16px', fontSize: '18px' }}>{t('macros')}</h3>
        <div className="macro-grid">
           <MacroBar label={t('protein')} current={totalProtein} goal={goals.daily_protein_goal} color="var(--green)" unit="g" t={t} />
           <MacroBar label={t('carbs')} current={totalCarbs} goal={goals.daily_carbs_goal} color="var(--blue)" unit="g" t={t} />
           <MacroBar label={t('fat')} current={totalFat} goal={goals.daily_fat_goal} color="var(--pink)" unit="g" t={t} />
        </div>
      </div>

      <div className="toggle-pills">
        <button className={`toggle-pill ${mode === 'photo' ? 'active' : ''}`} onClick={() => setMode('photo')}>
          {t('photoMode')}
        </button>
        <button className={`toggle-pill ${mode === 'barcode' ? 'active' : ''}`} onClick={() => setMode('barcode')}>
          {t('barcodeMode')}
        </button>
      </div>

      {mode === 'photo' ? (
        <div className="card photo-input">
          {!photo ? (
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              <span className="camera-icon">📷</span>
              <p>{t('tapToPhoto')}</p>
              <input type="file" hidden ref={fileInputRef} accept="image/*" capture="environment" onChange={handlePhotoUpload} />
            </div>
          ) : (
            <div className="photo-preview-container">
              <img src={photo} alt="Preview" style={{ borderRadius: '10px', width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={handleAnalyzePhoto} disabled={analyzing}>
                   {analyzing ? t('analyzing') : t('identifyCalories')}
                </button>
                <button className="btn btn-ghost" onClick={() => setPhoto(null)}>
                  {t('changePhoto')}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red" style={{ marginTop: '12px' }}>⚠️ {error}</p>}

          {result && result.source === 'photo' && (
            <div className="result-card animate-in" style={{ marginTop: '24px', padding: '16px', background: 'var(--raised)', borderRadius: '12px' }}>
              <h2 className="serif">{result.name}</h2>
              <div className="result-main" style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
                <span style={{ fontSize: '32px', color: 'var(--gold)' }} className="serif">{result.calories} <small style={{ fontSize: '14px' }}>{t('kcal')}</small></span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span className="tag-pill green">{t('proteinAbbr')}: {result.protein}g</span>
                <span className="tag-pill blue">{t('carbsAbbr')}: {result.carbs}g</span>
                <span className="tag-pill pink">{t('fatAbbr')}: {result.fat}g</span>
              </div>

              {result.ingredients && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{t('ingredients')}</p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {result.ingredients.map(ing => <span key={ing} className="tag-pill" style={{ fontSize: '10px' }}>{ing}</span>)}
                  </div>
                </div>
              )}

              {result.note && <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--muted)' }}>“{result.note}”</p>}

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleAddResult}>
                {t('addToLog')}
              </button>
            </div>
          )}
        </div>
      ) : (
         <div className="card barcode-input">
           {!scannerOpen ? (
             <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setScannerOpen(true)}>
                {t('openScanner')}
             </button>
           ) : (
             <div className="scanner-container" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}>
               <Scanner
                 onScan={(res) => {
                   if (res && res[0]?.rawValue) {
                     handleBarcodeDetected(res[0].rawValue);
                   }
                 }}
                 styles={{ container: { width: '100%', height: 220 } }}
                 components={{ torch: true, finder: true }}
                 constraints={{ facingMode: 'environment' }}
               />
               <button 
                  className="btn btn-ghost" 
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none' }}
                  onClick={() => setScannerOpen(false)}
               >✕</button>
             </div>
           )}

           <div style={{ marginTop: '16px' }}>
             <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>{t('manualEntry')}</p>
             <form onSubmit={handleManualLookup} style={{ display: 'flex', gap: '8px' }}>
               <input type="text" id="manual-barcode-input" placeholder="123456789..." style={{ flex: 1 }} />
               <button className="btn btn-ghost" type="submit">{t('lookup')}</button>
             </form>
           </div>

           {result && result.source === 'barcode' && (
             <div className="result-card animate-in" style={{ marginTop: '24px', padding: '16px', background: 'var(--raised)', borderRadius: '12px' }}>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                 {result.image_url && <img src={result.image_url} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />}
                 <h2 className="serif" style={{ fontSize: '18px' }}>{result.name}</h2>
               </div>
               <div className="serif" style={{ fontSize: '24px', color: 'var(--gold)', marginBottom: '12px' }}>{result.calories} {t('kcal')}</div>
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddResult}>
                 {t('addToLog')}
               </button>
             </div>
           )}
         </div>
      )}

      {/* Today's Log */}
      <div className="card meal-log">
        <h3 className="serif" style={{ marginBottom: '16px' }}>{t('todaysMeals')}</h3>
        {log.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
            <p>{t('noMealsYet')}</p>
            <p style={{ marginTop: '8px' }}>{t('snapFirstBite')}</p>
          </div>
        ) : (
          <div className="meal-list">
            {log.map(meal => (
              <div key={meal.id} className="meal-item animate-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '20px', justifyContent: 'center' }}>
                  {meal.source === 'barcode' ? '🔲' : '📷'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px' }}>{meal.name}</h4>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {t('proteinAbbr')}: {meal.protein}g · {t('carbsAbbr')}: {meal.carbs}g · {t('fatAbbr')}: {meal.fat}g
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{meal.calories}</div>
                  <button onClick={() => onRemoveMeal(meal.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function MacroBar({ label, current, goal, color, unit, t }) {
  const percentage = Math.min((current / goal) * 100, 100);
  return (
    <div className="macro-item">
      <div className="macro-header">
        <span style={{ color: color, fontWeight: 'bold' }}>{label}</span>
        <span style={{ color: 'var(--muted)' }}>{Math.round(current)}{unit} / {goal}{unit}</span>
      </div>
      <div className="macro-bar-bg">
        <div className="macro-bar-fill" style={{ width: `${percentage}%`, background: color }}></div>
      </div>
    </div>
  );
}
