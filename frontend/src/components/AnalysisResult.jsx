import { useTranslation } from "../i18n/translations";

export function AnalysisResult({ result, onAddToLog, language }) {
  const { t } = useTranslation(language);

  if (!result) return null;

  return (
    <div className="result-card">
      <div className="result-top">
        <div className="result-name">{result.name}</div>
        <div className="result-cal">{result.calories} kcal</div>
      </div>

      <div className="macros">
        <div className="macro">
          <div className="macro-val">{result.protein}g</div>
          <div className="macro-label">{t("protein")}</div>
        </div>
        <div className="macro">
          <div className="macro-val">{result.carbs}g</div>
          <div className="macro-label">{t("carbs")}</div>
        </div>
        <div className="macro">
          <div className="macro-val">{result.fat}g</div>
          <div className="macro-label">{t("fat")}</div>
        </div>
      </div>

      {result.note && <div className="note-text">💡 {result.note}</div>}

      <button className="add-log-btn" onClick={onAddToLog}>
        {t("addToLog")}
      </button>
    </div>
  );
}
