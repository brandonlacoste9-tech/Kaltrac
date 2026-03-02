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

      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
         <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
           <span className="fleur" style={{ marginLeft: '12px' }}>⚜</span>
           <span className="strap-text" style={{ fontSize: '13px' }}>{t('macros')}</span>
         </div>
        
        <div className="macro-grid" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <MacroBar label={t('protein')} current={totalProtein} goal={goals.daily_protein_goal} color="var(--green)" unit="g" t={t} />
           <MacroBar label={t('carbs')} current={totalCarbs} goal={goals.daily_carbs_goal} color="var(--blue)" unit="g" t={t} />
           <MacroBar label={t('fat')} current={totalFat} goal={goals.daily_fat_goal} color="var(--gold)" unit="g" t={t} />
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
        <div className="card photo-input" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
            <div className="buckle">
              <div className="buckle-prong"></div>
            </div>
            <span className="strap-text" style={{ fontSize: '13px' }}>{t('photoMode')}</span>
          </div>

          <div style={{ padding: '32px' }}>
            {!photo ? (
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: 'var(--raised)', transition: 'var(--transition)' }}>
                <span className="camera-icon" style={{ fontSize: '48px', opacity: 0.8, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>📷</span>
                <p className="serif" style={{ marginTop: '16px', fontSize: '20px', color: 'var(--gold)' }}>{t('tapToPhoto')}</p>
                <input type="file" hidden ref={fileInputRef} accept="image/*" capture="environment" onChange={handlePhotoUpload} />
              </div>
            ) : (
              <div className="photo-preview-container animate-in">
                <div style={{ padding: '8px', background: 'var(--raised)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                  <img src={photo} alt="Preview" style={{ borderRadius: '10px', width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAnalyzePhoto} disabled={analyzing}>
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
            <div className="result-card animate-in" style={{ marginTop: '32px', padding: '24px', background: 'var(--raised)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                 <h2 className="serif" style={{ fontSize: '28px', color: 'var(--text)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{result.name}</h2>
                 <span style={{ fontSize: '32px', color: 'var(--gold)', textShadow: '0 2px 8px var(--gold-glow)' }} className="serif">{result.calories} <small style={{ fontSize: '14px', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--muted)' }}>{t('kcal')}</small></span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <span className="tag-pill green">{t('proteinAbbr')}: {result.protein}g</span>
                <span className="tag-pill blue">{t('carbsAbbr')}: {result.carbs}g</span>
                <span className="tag-pill gold">{t('fatAbbr')}: {result.fat}g</span>
              </div>

              {result.ingredients && (
                <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('ingredients')}</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {result.ingredients.map(ing => <span key={ing} className="tag-pill" style={{ opacity: 0.8 }}>{ing}</span>)}
                  </div>
                </div>
              )}

              {result.note && <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--gold)', opacity: 0.8, padding: '12px', borderLeft: '3px solid var(--gold)', background: 'rgba(197, 160, 85, 0.05)' }}>“{result.note}”</p>}

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px', fontSize: '16px' }} onClick={handleAddResult}>
                {t('addToLog')}
              </button>
            </div>
          )}
          </div>
        </div>
      ) : (
         <div className="card barcode-input" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
              <span className="fleur" style={{ marginLeft: '12px' }}>🔎</span>
              <span className="strap-text" style={{ fontSize: '13px' }}>{t('barcodeMode')}</span>
            </div>
            
            <div style={{ padding: '32px' }}>
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
                 onError={(err) => setError(err?.message || "Failed to access camera")}
                 formats={['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']}
                 styles={{ container: { width: '100%', height: 220 } }}
                 components={{ torch: true, finder: true }}
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
             <div className="result-card animate-in" style={{ marginTop: '32px', padding: '24px', background: 'var(--raised)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                 {result.image_url && <img src={result.image_url} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', background: 'var(--surface)', padding: '4px', border: '1px solid var(--border)' }} />}
                 <div>
                   <h2 className="serif" style={{ fontSize: '22px', color: 'var(--text)' }}>{result.name}</h2>
                   <div className="serif" style={{ fontSize: '28px', color: 'var(--gold)', textShadow: '0 2px 8px var(--gold-glow)' }}>{result.calories} <small style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--muted)' }}>{t('kcal')}</small></div>
                 </div>
               </div>
               <button className="btn btn-primary" style={{ width: '100%', fontSize: '16px' }} onClick={handleAddResult}>
                 {t('addToLog')}
               </button>
             </div>
           )}
           </div>
         </div>
      )}

      {/* Today's Log */}
      <div className="card meal-log" style={{ padding: '0', overflow: 'hidden', marginTop: '32px' }}>
        <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
           <span className="fleur" style={{ marginLeft: '12px' }}>🍽️</span>
           <span className="strap-text" style={{ fontSize: '13px' }}>{t('todaysMeals')}</span>
        </div>
        
        <div style={{ padding: '24px' }}>
          {log.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🥗</div>
              <p className="serif" style={{ fontSize: '20px', color: 'var(--gold)' }}>{t('noMealsYet')}</p>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>{t('snapFirstBite')}</p>
            </div>
          ) : (
            <div className="meal-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {log.map(meal => (
                <div key={meal.id} className="meal-item animate-in" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--raised)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.02)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '24px', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                    {meal.source === 'barcode' ? '🔲' : '📷'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="serif" style={{ fontSize: '18px', color: 'var(--text)' }}>{meal.name}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--green)' }}>{meal.protein}g {t('proteinAbbr')}</span> · 
                      <span style={{ color: 'var(--blue)' }}>{meal.carbs}g {t('carbsAbbr')}</span> · 
                      <span style={{ color: 'var(--gold)' }}>{meal.fat}g {t('fatAbbr')}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="serif" style={{ color: 'var(--gold)', fontSize: '24px', textShadow: '0 2px 8px var(--gold-glow)' }}>{meal.calories}</div>
                    <button onClick={() => onRemoveMeal(meal.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '16px', cursor: 'pointer', opacity: 0.7, padding: '4px' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function MacroBar({ label, current, goal, color, unit, t }) {
  const percentage = Math.min((current / goal) * 100, 100);
  return (
    <div className="macro-item">
      <div className="macro-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
        <span style={{ color: color, textShadow: color === 'var(--gold)' ? '0 2px 4px var(--gold-glow)' : 'none' }}>{label}</span>
        <span style={{ color: 'var(--muted)' }}><span style={{ color: 'var(--text)' }}>{Math.round(current)}</span> / {goal} {unit}</span>
      </div>
      <div className="macro-bar-bg" style={{ height: '14px', background: 'var(--dim)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
        <div className="macro-bar-fill" style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '8px', boxShadow: `0 0 10px ${color}80`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
      </div>
    </div>
  );
}
