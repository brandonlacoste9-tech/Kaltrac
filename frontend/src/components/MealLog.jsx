import { useTranslation } from "../i18n/translations";

export function MealLog({ log, onRemoveItem, language }) {
  const { t } = useTranslation(language);

  return (
    <div className="log-section">
      <div className="section-title">{t("todaysLog")}</div>

      {log.length === 0 ? (
        <div className="empty-log">{t("noMeals")}</div>
      ) : (
        log.map((item) => (
          <div key={item.id} className="log-item">
            {item.thumb ? (
              <img src={item.thumb} alt={item.name} className="log-thumb" />
            ) : (
              <div className="log-thumb-placeholder">🍽️</div>
            )}

            <div className="log-info">
              <div className="log-name">{item.name}</div>
              <div className="log-time">{item.time}</div>
            </div>

            <div className="log-cal">{item.calories}</div>

            <button
              className="log-delete"
              onClick={() => onRemoveItem(item.id)}
              title={t("delete")}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}
