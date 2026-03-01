import { useState, useCallback } from "react";
import { useTranslation } from "./i18n/translations";
import { useCalorieTracker } from "./hooks/useCalorieTracker";
import { analyzeFood } from "./services/deepseekAPI";
import { Header } from "./components/Header";
import { CalorieRing } from "./components/CalorieRing";
import { PhotoUpload } from "./components/PhotoUpload";
import { AnalysisResult } from "./components/AnalysisResult";
import { MealLog } from "./components/MealLog";
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
    DAILY_GOAL,
  } = useCalorieTracker();

  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

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

      <MealLog log={log} onRemoveItem={removeFromLog} language={language} />
    </div>
  );
}
