import { useTranslation } from "../i18n/translations";

export function Header({ language, onLanguageChange }) {
  const { t } = useTranslation(language);

  return (
    <div className="header">
      <h2 className="header-title">Let's track your healthy day</h2>
      <p className="header-subtitle">Monitor calories, macros, workouts & hydration</p>
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button
          className={`mode-btn ${language === "en" ? "active" : ""}`}
          onClick={() => onLanguageChange("en")}
          style={{ flex: "none", padding: "8px 16px", fontSize: "12px" }}
        >
          🇺🇸 English
        </button>
        <button
          className={`mode-btn ${language === "fr" ? "active" : ""}`}
          onClick={() => onLanguageChange("fr")}
          style={{ flex: "none", padding: "8px 16px", fontSize: "12px" }}
        >
          🇫🇷 Français
        </button>
      </div>
    </div>
  );
}
