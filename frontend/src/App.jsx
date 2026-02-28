import { useState, useRef, useCallback } from "react";
import { useTranslation } from "./i18n/translations";

const DAILY_GOAL = 2000;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0f0d0a;
  font-family: 'DM Mono', monospace;
  color: #f0e8d8;
  min-height: 100vh;
}

.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #0f0d0a;
  position: relative;
  overflow: hidden;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
}

.header {
  padding: 48px 24px 24px;
  position: relative;
  z-index: 1;
}

.logo {
  font-family: 'Fraunces', serif;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: #f0e8d8;
}

.logo span {
  color: #e8a045;
  font-style: italic;
}

.subtitle {
  font-size: 11px;
  color: #7a6e60;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 4px;
}

.ring-section {
  padding: 8px 24px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.ring-svg {
  transform: rotate(-90deg);
}

.ring-bg { stroke: #2a2318; }

.ring-fill {
  stroke: #e8a045;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-cal {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 600;
  color: #f0e8d8;
  line-height: 1;
}

.ring-label {
  font-size: 9px;
  color: #7a6e60;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 3px;
}

.stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.stat-label { font-size: 10px; color: #7a6e60; letter-spacing: 1px; text-transform: uppercase; }
.stat-val { font-size: 14px; color: #f0e8d8; }
.stat-val.accent { color: #e8a045; }
.stat-val.green { color: #7ec98a; }
.stat-val.red { color: #e87a6a; }

.divider { height: 1px; background: #2a2318; margin: 0 24px; }

.capture-zone {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.upload-btn {
  width: 100%;
  height: 160px;
  border: 1.5px dashed #3a3020;
  border-radius: 16px;
  background: #1a1610;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.upload-btn:hover {
  border-color: #e8a045;
  background: #1f1a12;
}

.upload-btn.dragging {
  border-color: #e8a045;
  background: #221d12;
  transform: scale(0.99);
}

.upload-icon {
  font-size: 36px;
}

.upload-text {
  font-size: 12px;
  color: #7a6e60;
  text-align: center;
  line-height: 1.6;
}

.upload-text strong {
  color: #e8a045;
  font-weight: 500;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
  border-radius: 14px;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15,13,10,0.9) 0%, transparent 50%);
  border-radius: 14px;
  display: flex;
  align-items: flex-end;
  padding: 12px;
}

.change-btn {
  font-size: 10px;
  color: #e8a045;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: rgba(232,160,69,0.15);
  border: 1px solid rgba(232,160,69,0.3);
  border-radius: 6px;
  padding: 5px 10px;
  cursor: pointer;
}

.analyze-btn {
  width: 100%;
  margin-top: 12px;
  padding: 16px;
  background: #e8a045;
  color: #0f0d0a;
  border: none;
  border-radius: 12px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.analyze-btn:hover:not(:disabled) { background: #f0b055; transform: translateY(-1px); }
.analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(15,13,10,0.3);
  border-top-color: #0f0d0a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.result-card {
  margin: 0 24px 16px;
  padding: 16px;
  background: #1a1610;
  border: 1px solid #2a2318;
  border-radius: 14px;
  animation: slideUp 0.4s ease;
  position: relative;
  z-index: 1;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.result-name {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #f0e8d8;
  flex: 1;
  margin-right: 12px;
  line-height: 1.2;
}

.result-cal {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  color: #e8a045;
  font-weight: 600;
  white-space: nowrap;
}

.result-cal span {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #7a6e60;
  font-weight: 400;
  display: block;
  text-align: right;
}

.macros {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.macro {
  flex: 1;
  background: #0f0d0a;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.macro-val {
  font-size: 14px;
  color: #f0e8d8;
  font-weight: 500;
}

.macro-label {
  font-size: 9px;
  color: #7a6e60;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 2px;
}

.add-log-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: transparent;
  border: 1px solid #e8a045;
  color: #e8a045;
  border-radius: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-log-btn:hover { background: rgba(232,160,69,0.1); }

.note-text {
  font-size: 10px;
  color: #7a6e60;
  line-height: 1.5;
  margin-top: 8px;
  font-style: italic;
}

.log-section {
  padding: 0 24px 24px;
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 10px;
  color: #7a6e60;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #1a1610;
  animation: slideUp 0.3s ease;
}

.log-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #2a2318;
}

.log-thumb-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #2a2318;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.log-info { flex: 1; min-width: 0; }

.log-name {
  font-size: 13px;
  color: #f0e8d8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-time {
  font-size: 10px;
  color: #7a6e60;
  margin-top: 2px;
}

.log-cal {
  font-family: 'Fraunces', serif;
  font-size: 16px;
  color: #e8a045;
  font-weight: 600;
}

.log-delete {
  background: none;
  border: none;
  color: #3a3020;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: color 0.2s;
}

.log-delete:hover { color: #e87a6a; }

.empty-log {
  text-align: center;
  padding: 24px 0;
  color: #3a3020;
  font-size: 12px;
}

.error-msg {
  margin: 0 24px 16px;
  padding: 12px;
  background: rgba(232,122,106,0.1);
  border: 1px solid rgba(232,122,106,0.3);
  border-radius: 10px;
  font-size: 12px;
  color: #e87a6a;
  position: relative;
  z-index: 1;
}
`;

export default function CalorieTracker() {
  const [language, setLanguage] = useState('fr'); // Default to French for Quebec
  const { t } = useTranslation(language);
  
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const totalCals = log.reduce((s, i) => s + i.calories, 0);
  const remaining = DAILY_GOAL - totalCals;
  const progress = Math.min(totalCals / DAILY_GOAL, 1);
  const circumference = 2 * Math.PI * 50;
  const dash = circumference * (1 - progress);

  const loadImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    loadImage(e.dataTransfer.files[0]);
  }, []);

  const analyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a nutrition expert. Analyze food images and return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "name": "Food name",
  "calories": 450,
  "protein": 25,
  "carbs": 40,
  "fat": 15,
  "confidence": "high|medium|low",
  "note": "Brief note about the estimate"
}

Be realistic with portion estimates. If you cannot identify food, return {"error": "reason"}.`,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
              { type: "text", text: "Analyze this food and estimate nutritional info." }
            ]
          }]
        })
      });

      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      
      if (parsed.error) throw new Error(parsed.error);
      setResult(parsed);
    } catch (err) {
      setError(err.message || "Could not analyze image. Try a clearer photo!");
    } finally {
      setAnalyzing(false);
    }
  };

  const addToLog = () => {
    if (!result) return;
    setLog(prev => [{
      id: Date.now(),
      name: result.name,
      calories: result.calories,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      thumb: image
    }, ...prev]);
    setResult(null);
    setImage(null);
    setImageBase64(null);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Background orbs */}
        <div className="bg-orb" style={{ width: 300, height: 300, background: "#e8a045", top: -100, right: -100 }} />
        <div className="bg-orb" style={{ width: 200, height: 200, background: "#7ec98a", bottom: 200, left: -80 }} />

        {/* Header with language toggle */}
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="logo">{t('appName')}</div>
              <div className="subtitle">{t('tagline')}</div>
            </div>
            <button 
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              style={{
                background: 'rgba(232,160,69,0.15)',
                border: '1px solid rgba(232,160,69,0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#e8a045',
                fontSize: '10px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'DM Mono, monospace'
              }}
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="ring-section">
          <div className="ring-wrap">
            <svg className="ring-svg" width="120" height="120" viewBox="0 0 120 120">
              <circle className="ring-bg" cx="60" cy="60" r="50" fill="none" strokeWidth="8" />
              <circle
                className="ring-fill"
                cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={dash}
              />
            </svg>
            <div className="ring-text">
              <div className="ring-cal">{totalCals}</div>
              <div className="ring-label">{t('kcalEaten')}</div>
            </div>
          </div>
          <div className="stats">
            <div className="stat-row">
              <span className="stat-label">{t('goal')}</span>
              <span className="stat-val">{DAILY_GOAL} {t('kcal')}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">{t('eaten')}</span>
              <span className="stat-val accent">{totalCals} {t('kcal')}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">{t('remaining')}</span>
              <span className={`stat-val ${remaining < 0 ? "red" : "green"}`}>
                {remaining < 0 ? `+${Math.abs(remaining)}` : remaining} {t('kcal')}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">{t('mealsLogged')}</span>
              <span className="stat-val">{log.length}</span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Capture Zone */}
        <div className="capture-zone">
          <input 
            ref={fileRef} 
            type="file" 
            accept="image/*" 
            capture="environment" 
            style={{ display: "none" }} 
            onChange={e => loadImage(e.target.files[0])} 
          />
          <div
            className={`upload-btn ${dragging ? "dragging" : ""}`}
            onClick={() => !image && fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {image ? (
              <>
                <img src={image} alt="food" className="preview-img" />
                <div className="preview-overlay">
                  <button className="change-btn" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
                    {t('changePhoto')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <div className="upload-text">
                  <strong>{t('tapToPhoto')}</strong><br />
                  {t('dragDrop')}
                </div>
              </>
            )}
          </div>
          {image && (
            <button className="analyze-btn" onClick={analyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <div className="spinner" /> {t('analyzing')}
                </>
              ) : (
                <>{t('identifyCalories')}</>
              )}
            </button>
          )}
        </div>

        {/* Error */}
        {error && <div className="error-msg">⚠️ {error}</div>}

        {/* Result Card */}
        {result && (
          <div className="result-card">
            <div className="result-top">
              <div className="result-name">{result.name}</div>
              <div className="result-cal">
                {result.calories}
                <span>kcal</span>
              </div>
            </div>
            <div className="macros">
              <div className="macro">
                <div className="macro-val">{result.protein}g</div>
                <div className="macro-label">{t('protein')}</div>
              </div>
              <div className="macro">
                <div className="macro-val">{result.carbs}g</div>
                <div className="macro-label">{t('carbs')}</div>
              </div>
              <div className="macro">
                <div className="macro-val">{result.fat}g</div>
                <div className="macro-label">{t('fat')}</div>
              </div>
            </div>
            {result.note && <div className="note-text">💡 {result.note}</div>}
            <button className="add-log-btn" onClick={addToLog}>
              {t('addToLog')}
            </button>
          </div>
        )}

        {/* Food Log */}
        <div className="log-section">
          <div className="section-title">{t('todaysLog')}</div>
          {log.length === 0 ? (
            <div className="empty-log">
              {t('noMealsYet')}<br />{t('snapFirstBite')}
            </div>
          ) : log.map(item => (
            <div key={item.id} className="log-item">
              {item.thumb 
                ? <img src={item.thumb} alt={item.name} className="log-thumb" />
                : <div className="log-thumb-placeholder">🍽️</div>
              }
              <div className="log-info">
                <div className="log-name">{item.name}</div>
                <div className="log-time">{item.time}</div>
              </div>
              <div className="log-cal">{item.calories}</div>
              <button 
                className="log-delete" 
                onClick={() => setLog(prev => prev.filter(i => i.id !== item.id))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
