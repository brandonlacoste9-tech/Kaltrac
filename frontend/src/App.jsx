import { useState, useCallback } from "react";
import { useTranslation } from "./i18n/translations";
import { useCalorieTracker } from "./hooks/useCalorieTracker";
import { analyzeFood } from "./services/deepseekAPI";
import { Header } from "./components/Header";
import { CalorieRing } from "./components/CalorieRing";
import { PhotoUpload } from "./components/PhotoUpload";
import { AnalysisResult } from "./components/AnalysisResult";
import { MealLog } from "./components/MealLog";
import BarcodeScanner from "./components/BarcodeScanner";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import "./styles/app.css";

export default function App() {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation(language);
  const {
    log,
    result,
    setResult,
    addToLog,
    removeFromLog,
    getTotalCalories,
    getCaloriePercentage,
    getTodayLog,
    getWeeklyData,
    getMonthlyData,
    DAILY_GOAL,
  } = useCalorieTracker();

  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("photo"); // "photo", "barcode", or "analytics"
  const [appMode, setAppMode] = useState("tracker"); // "tracker" or "analytics"

  const handleImageChange = useCallback((newImage) => {
    setImage(newImage);
    setError(null);
  }, []);

  const handleImageRemove = useCallback(() => {
    setImage(null);
    setResult(null);
    setError(null);
  }, [setResult]);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Image = image.split(",")[1];

      // Call DeepSeek API
      const foodData = await analyzeFood(base64Image);

      setResult({
        name: foodData.name,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        note: foodData.note,
        image: image,
      });
    } catch (err) {
      setError(err.message || "Failed to analyze food. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  }, [image, setResult]);

  const handleAddToLog = useCallback(() => {
    if (result) {
      addToLog(result);
      setImage(null);
      setResult(null);
    }
  }, [result, addToLog, setResult]);

  const handleBarcodeProductSelect = useCallback((productData) => {
    addToLog({
      name: productData.name,
      calories: productData.calories,
      protein: productData.protein,
      carbs: productData.carbs,
      fat: productData.fat,
      note: `From barcode: ${productData.productData?.brand || 'Unknown'}`,
      source: 'barcode'
    });
    setError(null);
  }, [addToLog]);

  const totalCals = getTotalCalories();
  const percentage = getCaloriePercentage();

  return (
    <div className="app">
      {/* Background orbs */}
      <div className="bg-orb" style={{ width: 300, height: 300, background: "#e8a045", top: -100, right: -100 }} />
      <div className="bg-orb" style={{ width: 200, height: 200, background: "#7ec98a", bottom: 200, left: -80 }} />

      {/* Main content */}
      <Header language={language} onLanguageChange={setLanguage} />

      <CalorieRing
        totalCals={totalCals}
        percentage={percentage}
        dailyGoal={DAILY_GOAL}
        language={language}
      />

      <div className="divider" />

      {/* Mode toggle */}
      <div style={styles.appModeToggle}>
        <button
          onClick={() => setAppMode("tracker")}
          style={{
            ...styles.appModeButton,
            ...(appMode === "tracker" ? styles.appModeButtonActive : {})
          }}
        >
          {t('home') || 'Tracker'}
        </button>
        <button
          onClick={() => setAppMode("analytics")}
          style={{
            ...styles.appModeButton,
            ...(appMode === "analytics" ? styles.appModeButtonActive : {})
          }}
        >
          {t('analytics') || 'Analytics'}
        </button>
      </div>

      {appMode === "tracker" ? (
        <>
          {/* Tracker Mode */}
          <div style={styles.modeToggle}>
            <button
              onClick={() => setMode("photo")}
              style={{
                ...styles.modeButton,
                ...(mode === "photo" ? styles.modeButtonActive : {})
              }}
            >
              {t('photoMode')}
            </button>
            <button
              onClick={() => setMode("barcode")}
              style={{
                ...styles.modeButton,
                ...(mode === "barcode" ? styles.modeButtonActive : {})
              }}
            >
              {t('scanMode')}
            </button>
          </div>

          {mode === "photo" ? (
            <>
              <PhotoUpload
                image={image}
                onImageChange={handleImageChange}
                analyzing={analyzing}
                onAnalyze={handleAnalyze}
                onImageRemove={handleImageRemove}
                language={language}
              />

              {error && <div className="error-msg">⚠️ {error}</div>}

              <AnalysisResult result={result} onAddToLog={handleAddToLog} language={language} />
            </>
          ) : (
            <>
              {error && <div className="error-msg">⚠️ {error}</div>}
              <BarcodeScanner
                language={language}
                t={t}
                onProductSelect={handleBarcodeProductSelect}
              />
            </>
          )}

          <MealLog log={getTodayLog()} onRemoveItem={removeFromLog} language={language} />
        </>
      ) : (
        <>
          {/* Analytics Mode */}
          <AnalyticsDashboard
            log={getTodayLog()}
            weeklyData={getWeeklyData()}
            monthlyData={getMonthlyData()}
            dailyGoal={DAILY_GOAL}
            t={t}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  appModeToggle: {
    display: 'flex',
    gap: '0',
    justifyContent: 'center',
    marginBottom: '20px',
    padding: '0 20px',
    borderBottom: '2px solid #333'
  },
  appModeButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#999',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  appModeButtonActive: {
    color: '#ffd700',
    borderBottomColor: '#ffd700'
  },
  modeToggle: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '30px',
    padding: '0 20px'
  },
  modeButton: {
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#999',
    border: '2px solid #333',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
    transition: 'all 0.3s ease',
    fontSize: '14px'
  },
  modeButtonActive: {
    backgroundColor: '#ffd700',
    color: '#000',
    borderColor: '#ffd700'
  }
};
