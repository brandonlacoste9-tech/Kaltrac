import { useRef, useState } from "react";
import { useTranslation } from "../i18n/translations";

export function PhotoUpload({
  image,
  onImageChange,
  analyzing,
  onAnalyze,
  onImageRemove,
  language,
}) {
  const { t } = useTranslation(language);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  if (image) {
    return (
      <div className="capture-zone">
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 200,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <img src={image} alt="food" className="preview-img" />
          <div className="preview-overlay">
            <button
              className="change-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current.click();
              }}
            >
              {t("change")}
            </button>
            <button className="analyze-btn" onClick={onImageRemove}>
              {t("remove")}
            </button>
          </div>
        </div>
        <button className="analyze-btn" onClick={onAnalyze} disabled={analyzing}>
          {analyzing ? (
            <>
              <div className="spinner" /> {t("analyzing")}
            </>
          ) : (
            t("analyze")
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="capture-zone">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        style={{ display: "none" }}
      />
      <button
        className={`upload-btn ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <div className="upload-icon">📷</div>
        <div className="upload-text">
          {t("uploadHint1")}
          <br />
          <strong>{t("uploadHint2")}</strong>
        </div>
      </button>
    </div>
  );
}
