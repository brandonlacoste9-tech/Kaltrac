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
  
  // Auth state
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState({
    daily_calorie_goal: 2000,
    daily_protein_goal: 150,
    daily_carbs_goal: 250,
    daily_fat_goal: 65,
    dietary_restrictions: []
  });

  // UI state
  const [navMode, setNavMode] = useState("tracker");
  const [mode, setMode] = useState("photo");

  // Calorie tracker state
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

  // Food analysis state
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Check auth on mount
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

  // Photo analysis handlers
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
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">KalTrac</h1>
        </div>
        <div className="nav-center">
          <button 
            onClick={() => setNavMode('tracker')} 
            className={`nav-btn ${navMode === 'tracker' ? 'active' : ''}`}
          >
            📊 Track
          </button>
          <button 
            onClick={() => setNavMode('analytics')} 
            className={`nav-btn ${navMode === 'analytics' ? 'active' : ''}`}
          >
            📈 Analytics
          </button>
          <button 
            onClick={() => setNavMode('workouts')} 
            className={`nav-btn ${navMode === 'workouts' ? 'active' : ''}`}
          >
            💪 Workouts
          </button>
          <button 
            onClick={() => setNavMode('water')} 
            className={`nav-btn ${navMode === 'water' ? 'active' : ''}`}
          >
            💧 Water
          </button>
          <button 
            onClick={() => setNavMode('planning')} 
            className={`nav-btn ${navMode === 'planning' ? 'active' : ''}`}
          >
            🍽️ Plans
          </button>
          <button 
            onClick={() => setNavMode('export')} 
            className={`nav-btn ${navMode === 'export' ? 'active' : ''}`}
          >
            📥 Export
          </button>
        </div>
        <div className="nav-right">
          <button onClick={() => setNavMode('settings')} className="settings-btn">⚙️</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <div className="user-info">{user.name}</div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="content">
        <Header language={language} onLanguageChange={setLanguage} />

        {navMode === 'tracker' && (
          <>
            {/* Calorie Ring Card */}
            <div className="ring-card">
              <div className="ring-section">
                <div className="ring-wrap">
                  <CalorieRing
                    totalCals={totalCals}
                    percentage={percentage}
                    dailyGoal={userSettings.daily_calorie_goal}
                    language={language}
                  />
                </div>
                <div className="ring-stats">
                  <div className="stat">
                    <span className="stat-value">{Math.round(totalCals)}</span>
                    <span className="stat-label">Eaten</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{Math.round(userSettings.daily_calorie_goal - totalCals)}</span>
                    <span className="stat-label">Left</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{Math.round(percentage)}%</span>
                    <span className="stat-label">Done</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button 
                onClick={() => setMode("photo")} 
                className={`mode-btn ${mode === "photo" ? "active" : ""}`}
              >
                📷 Photo Mode
              </button>
              <button 
                onClick={() => setMode("barcode")} 
                className={`mode-btn ${mode === "barcode" ? "active" : ""}`}
              >
                📱 Barcode Scan
              </button>
            </div>

            {/* Photo or Barcode Input */}
            <div className="card">
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
            </div>

            {/* Favorites */}
            <Favorites t={t} onSelectFavorite={handleFavoriteSelect} />

            {/* Meal Log */}
            <div className="card">
              <h3 className="card-title">📝 Today's Meals</h3>
              <MealLog log={getTodayLog()} onRemoveItem={removeFromLog} language={language} />
            </div>
          </>
        )}

        {navMode === 'analytics' && (
          <div className="card">
            <AnalyticsDashboard
              log={getTodayLog()}
              weeklyData={getWeeklyData()}
              monthlyData={getMonthlyData()}
              dailyGoal={userSettings.daily_calorie_goal}
              t={t}
            />
          </div>
        )}

        {navMode === 'workouts' && (
          <div className="card">
            <WorkoutLogger t={t} />
          </div>
        )}

        {navMode === 'water' && (
          <div className="card">
            <WaterTracker t={t} />
          </div>
        )}

        {navMode === 'planning' && (
          <div className="card">
            <MealPlanning 
              dailyGoal={userSettings.daily_calorie_goal} 
              dietaryRestrictions={userSettings.dietary_restrictions} 
              t={t} 
            />
          </div>
        )}

        {navMode === 'export' && (
          <div className="card">
            <ExportData t={t} weekData={getWeeklyData()} dailyGoal={userSettings.daily_calorie_goal} />
          </div>
        )}

        {navMode === 'settings' && (
          <div className="card">
            <Settings 
              language={language} 
              t={t} 
              onClose={() => setNavMode('tracker')} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
