import React, { useState, useEffect } from "react";
import { useTranslation } from "./i18n/translations";
import { useCalorieTracker } from "./hooks/useCalorieTracker";
import { Header } from "./components/v2/Header";
import { TrackerPage } from "./components/v2/TrackerPage";
import { AnalyticsPage } from "./components/v2/AnalyticsPage";
import { WorkoutsPage } from "./components/v2/WorkoutsPage";
import { WaterPage } from "./components/v2/WaterPage";
import { MealPlannerPage } from "./components/v2/MealPlannerPage";
import { GroceryScannerPage } from "./components/v2/GroceryScannerPage";
import { LoginPage } from "./components/v2/LoginPage";
import { LandingPage } from "./components/v2/LandingPage";
import { OnboardingPage } from "./components/v2/OnboardingPage";
import { ThemeSelector } from "./components/v2/ThemeSelector";
import "./styles/app.css";

export default function App() {
  const {
    user,
    setUser,
    log,
    workouts,
    water,
    settings,
    loading,
    syncing,
    logout,
    addMeal,
    removeMeal,
    addWorkout,
    removeWorkout,
    updateWater,
    updateSettings,
    getWeeklyStats,
    loadData
  } = useCalorieTracker();

  const [activeTab, setActiveTab] = useState("track");
  
  // Auto-detect Quebec/French Locale
  const detectInitialLanguage = () => {
    if (settings.language) return settings.language;
    const browserLang = navigator.language || '';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserLang.includes('fr') || timeZone.includes('Montreal')) return 'fr';
    return 'en';
  };

  const [language, setLanguage] = useState(detectInitialLanguage());
  const [view, setView] = useState("landing"); // 'landing', 'login', 'app'
  const [isTrial, setIsTrial] = useState(false);
  const [leatherTheme, setLeatherTheme] = useState(() => localStorage.getItem('kaltrac-theme') || 'brown');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => localStorage.getItem('kaltrac-onboarded') === 'true');
  const { t } = useTranslation(language);

  // Apply leather theme to document
  useEffect(() => {
    if (leatherTheme === 'brown') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', leatherTheme);
    }
    localStorage.setItem('kaltrac-theme', leatherTheme);
  }, [leatherTheme]);

  // Sync language with settings and document
  useEffect(() => {
    if (settings.language) {
      setLanguage(settings.language);
    }
    document.documentElement.lang = language;
  }, [settings.language, language]);

  // Handle View Logic
  useEffect(() => {
    if (user) {
      setView("app");
      setIsTrial(false);
    } else if (isTrial) {
      setView("app");
    } else if (view !== "login") {
      setView("landing");
    }
  }, [user, isTrial, view]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (user) updateSettings({ ...settings, language: lang });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    loadData();
    setView("app");
  };

  const handleLogout = () => {
    logout();
    setIsTrial(false);
    setView("landing");
  };

  const handleTabChange = (tab) => {
    if (!user && (tab === 'settings' || tab === 'login')) {
      setView('login');
    } else {
      setActiveTab(tab);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="loading"></div>
      </div>
    );
  }

  // View Routing
  if (!hasSeenOnboarding && !user) {
    return <OnboardingPage
      language={language}
      onLanguageChange={setLanguage}
      leatherTheme={leatherTheme}
      onThemeChange={setLeatherTheme}
      onComplete={() => {
        setHasSeenOnboarding(true);
        localStorage.setItem('kaltrac-onboarded', 'true');
      }}
    />;
  }

  if (view === "landing" && !user) {
    return <LandingPage 
      onStartTrial={() => setIsTrial(true)} 
      onGoToLogin={() => setView("login")} 
      language={language}
      leatherTheme={leatherTheme}
      onThemeChange={setLeatherTheme}
    />;
  }

  if (view === "login" && !user) {
    return (
      <div style={{ position: 'relative' }}>
         <button 
           className="btn btn-ghost" 
           style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}
           onClick={() => setView("landing")}
         >
           ← {t('back')}
         </button>
         <LoginPage onLoginSuccess={handleLoginSuccess} language={language} />
      </div>
    );
  }

  return (
    <div className="app">
      {isTrial && (
        <div style={{ 
          background: 'var(--gold)', 
          color: '#000', 
          fontSize: '11px', 
          textAlign: 'center', 
          padding: '6px', 
          fontWeight: 'bold',
          letterSpacing: '0.5px' 
        }}>
          {t('guestMode')} <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setView("login")}>{t('signUpToCloud')}</span>
        </div>
      )}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        user={user}
        onLogout={handleLogout}
      />

      <main className="content">
        {activeTab === "track" && (
          <TrackerPage 
            user={user} 
            log={log} 
            goals={settings} 
            onAddMeal={addMeal} 
            onRemoveMeal={removeMeal}
            language={language} 
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPage 
            log={log} 
            weeklyData={getWeeklyStats()} 
            monthlyData={getWeeklyStats()} 
            goals={settings} 
            language={language} 
          />
        )}

        {activeTab === "workouts" && (
          <WorkoutsPage 
            log={workouts} 
            onAddWorkout={addWorkout} 
            onRemoveWorkout={removeWorkout} 
            language={language} 
          />
        )}

        {activeTab === "water" && (
          <WaterPage 
            current={water} 
            goal={settings.daily_water_goal} 
            onUpdate={updateWater} 
            language={language} 
          />
        )}

        {activeTab === "mealPlans" && (
          <MealPlannerPage 
            goals={settings} 
            userSettings={settings} 
            language={language} 
            onAddMeal={addMeal} 
          />
        )}

        {activeTab === "grocery" && (
          <GroceryScannerPage 
            language={language} 
            userSettings={settings} 
          />
        )}

        {activeTab === "export" && (
          <div className="card animate-in" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
               <span className="fleur" style={{ marginLeft: '12px' }}>📥</span>
               <span className="strap-text" style={{ fontSize: '13px' }}>{t('exportData', 'Export Data')}</span>
            </div>
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--surface)' }}>
               <h2 className="serif" style={{ fontSize: '32px', marginBottom: '32px', color: 'var(--gold)', textShadow: '0 2px 8px var(--gold-glow)' }}>{t('exportData')}</h2>
               <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }} onClick={() => alert('CSV Export Started...')}>📥 {t('downloadCSV')}</button>
               <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--muted)' }}>{t('exportFormat')}</p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-view animate-in">
             <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
               <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
                 <span className="fleur" style={{ marginLeft: '12px' }}>⚙️</span>
                 <span className="strap-text" style={{ fontSize: '13px' }}>{t('settings', 'Settings')}</span>
               </div>
               <div style={{ padding: '32px' }}>
                 <h2 className="serif" style={{ marginBottom: '24px', fontSize: '24px', color: 'var(--gold)' }}>{t('dailyGoals')}</h2>
                 <div className="macro-grid" style={{ marginTop: '20px', gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('kcal')} (kcal)</label>
                      <input type="number" value={settings.daily_calorie_goal} onChange={(e) => updateSettings({ ...settings, daily_calorie_goal: Number(e.target.value) })} style={{ fontSize: '16px', padding: '12px', marginTop: '8px' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('protein')} (g)</label>
                      <input type="number" value={settings.daily_protein_goal} onChange={(e) => updateSettings({ ...settings, daily_protein_goal: Number(e.target.value) })} style={{ fontSize: '16px', padding: '12px', marginTop: '8px' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('carbs')} (g)</label>
                      <input type="number" value={settings.daily_carbs_goal} onChange={(e) => updateSettings({ ...settings, daily_carbs_goal: Number(e.target.value) })} style={{ fontSize: '16px', padding: '12px', marginTop: '8px' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('fat')} (g)</label>
                      <input type="number" value={settings.daily_fat_goal} onChange={(e) => updateSettings({ ...settings, daily_fat_goal: Number(e.target.value) })} style={{ fontSize: '16px', padding: '12px', marginTop: '8px' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('waterGoal')} ({t('glasses')})</label>
                      <input type="number" value={settings.daily_water_goal} onChange={(e) => updateSettings({ ...settings, daily_water_goal: Number(e.target.value) })} style={{ fontSize: '16px', padding: '12px', marginTop: '8px' }} />
                    </div>
                 </div>
                 <button className="btn btn-primary" style={{ marginTop: '40px', width: '100%', padding: '16px', fontSize: '16px' }}>{t('updateTargets')}</button>
               </div>
             </div>
          </div>
        )}
      </main>

      {syncing && (
        <div style={{ position: 'fixed', bottom: '100px', right: '20px', background: 'var(--surface)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '12px', zIndex: 10000 }}>
           <span className="loading" style={{ marginRight: '8px', verticalAlign: 'middle' }}></span>
           {t('syncing')}
        </div>
      )}
    </div>
  );
}
