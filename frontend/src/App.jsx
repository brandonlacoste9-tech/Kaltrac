import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "./i18n/translations";
import { useCalorieTracker } from "./hooks/useCalorieTracker";
import { analyzeFood } from "./services/deepseekAPI";
import { authAPI, settingsAPI } from "./services/api";
import { Header } from "./components/Header";
import { CalorieRing } from "./components/CalorieRing";
import { PhotoUpload } from "./components/PhotoUpload";
import { AnalysisResult } from "./components/AnalysisResult";
import { MealLog } from "./components/MealLog";
import BarcodeScanner from "./components/BarcodeScanner";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { LoginSignup } from "./components/LoginSignup";
import { Settings } from "./components/Settings";
import { Favorites } from "./components/Favorites";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { WaterTracker } from "./components/WaterTracker";
import { MealPlanning } from "./components/MealPlanning";
import { ExportData } from "./components/ExportData";
import "./styles/app.css";

export default function App() {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation(language);
  
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState({
    daily_calorie_goal: 2000,
    daily_protein_goal: 150,
    daily_carbs_goal: 250,
    daily_fat_goal: 65,
    dietary_restrictions: []
  });

  const [navMode, setNavMode] = useState("tracker");
  const [mode, setMode] = useState("photo");

  const {
    result,
    setResult,
    addToLog,
    removeFromLog,
    getTotalCalories,
    getCaloriePercentage,
    getTodayLog,
    getWeeklyData,
    getMonthlyData,
  } = useCalorieTracker();

  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      loadUserSettings();
    }
  }, []);

  const loadUserSettings = async () => {
    try {
      const res = await settingsAPI.getSettings();
      setUserSettings(res.data);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    loadUserSettings();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setNavMode('tracker');
  };

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
      const base64Image = image.split(",")[1];
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

  const handleFavoriteSelect = (favorite) => {
    addToLog(favorite);
  };

  if (!user) {
    return <LoginSignup onAuthSuccess={handleAuthSuccess} />;
  }

  const totalCals = getTotalCalories();
  const percentage = getCaloriePercentage();

  return (
    <div className="app">
      <div className="bg-orb" style={{ width: 300, height: 300, background: "#e8a045", top: -100, right: -100 }} />
      <div className="bg-orb" style={{ width: 200, height: 200, background: "#7ec98a", bottom: 200, left: -80 }} />

      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <h1 style={styles.logo}>KalTrac</h1>
        </div>
        <div style={styles.navCenter}>
          <button onClick={() => setNavMode('tracker')} style={{...styles.navBtn, ...(navMode === 'tracker' ? styles.navBtnActive : {})}}>Track</button>
          <button onClick={() => setNavMode('analytics')} style={{...styles.navBtn, ...(navMode === 'analytics' ? styles.navBtnActive : {})}}>Analytics</button>
          <button onClick={() => setNavMode('workouts')} style={{...styles.navBtn, ...(navMode === 'workouts' ? styles.navBtnActive : {})}}>Workouts</button>
          <button onClick={() => setNavMode('water')} style={{...styles.navBtn, ...(navMode === 'water' ? styles.navBtnActive : {})}}>Water</button>
          <button onClick={() => setNavMode('planning')} style={{...styles.navBtn, ...(navMode === 'planning' ? styles.navBtnActive : {})}}>Plan</button>
          <button onClick={() => setNavMode('export')} style={{...styles.navBtn, ...(navMode === 'export' ? styles.navBtnActive : {})}}>Export</button>
        </div>
        <div style={styles.navRight}>
          <button onClick={() => setNavMode('settings')} style={styles.settingsBtn}>⚙️</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          <div style={styles.userInfo}>{user.name}</div>
        </div>
      </nav>

      <Header language={language} onLanguageChange={setLanguage} />

      {navMode === 'tracker' && (
        <>
          <CalorieRing
            totalCals={totalCals}
            percentage={percentage}
            dailyGoal={userSettings.daily_calorie_goal}
            language={language}
          />

          <div className="divider" />

          <div style={styles.modeToggle}>
            <button onClick={() => setMode("photo")} style={{...styles.modeButton, ...(mode === "photo" ? styles.modeButtonActive : {})}}>
              📷 Photo
            </button>
            <button onClick={() => setMode("barcode")} style={{...styles.modeButton, ...(mode === "barcode" ? styles.modeButtonActive : {})}}>
              📱 Barcode
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
              <BarcodeScanner language={language} t={t} onProductSelect={handleBarcodeProductSelect} />
            </>
          )}

          <Favorites t={t} onSelectFavorite={handleFavoriteSelect} />
          <MealLog log={getTodayLog()} onRemoveItem={removeFromLog} language={language} />
        </>
      )}

      {navMode === 'analytics' && (
        <AnalyticsDashboard
          log={getTodayLog()}
          weeklyData={getWeeklyData()}
          monthlyData={getMonthlyData()}
          dailyGoal={userSettings.daily_calorie_goal}
          t={t}
        />
      )}

      {navMode === 'workouts' && <WorkoutLogger t={t} />}
      {navMode === 'water' && <WaterTracker t={t} />}
      {navMode === 'planning' && <MealPlanning dailyGoal={userSettings.daily_calorie_goal} dietaryRestrictions={userSettings.dietary_restrictions} t={t} />}
      {navMode === 'export' && <ExportData t={t} weekData={getWeeklyData()} dailyGoal={userSettings.daily_calorie_goal} />}

      {navMode === 'settings' && (
        <Settings language={language} t={t} onClose={() => setNavMode('tracker')} />
      )}
    </div>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#0a0a0a',
    borderBottom: '1px solid #333',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
    gap: '16px'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffd700',
    margin: 0,
    fontFamily: 'Fraunces, serif'
  },
  navCenter: {
    display: 'flex',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  navBtn: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#999',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s',
    fontFamily: 'Fraunces, serif'
  },
  navBtnActive: {
    backgroundColor: '#ffd700',
    color: '#000'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px'
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: '#3d1f1f',
    color: '#ff6b6b',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600'
  },
  userInfo: {
    fontSize: '12px',
    color: '#999'
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
