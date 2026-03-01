import { useTranslation } from "../i18n/translations";

export function Header({ language, onLanguageChange }) {
  const { t } = useTranslation(language);

  return (
    <div className="header">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="logo">
            Kal<span>Trac</span>
          </div>
          <div className="subtitle">{t("tagline")}</div>
        </div>
        <button
          className={`lang-btn ${language === "en" ? "active" : ""}`}
          onClick={() => onLanguageChange("en")}
        >
          EN
        </button>
        <button
          className={`lang-btn ${language === "fr" ? "active" : ""}`}
          onClick={() => onLanguageChange("fr")}
        >
          FR
        </button>
      </div>
    </div>
  );
}
