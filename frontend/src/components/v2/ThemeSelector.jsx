import React from 'react';

const themes = [
  { id: 'brown', label: 'Mahogany', emoji: '🤎' },
  { id: 'green', label: 'Forest', emoji: '💚' },
  { id: 'pink', label: 'Rose', emoji: '🩷' },
];

export function ThemeSelector({ currentTheme, onThemeChange }) {
  return (
    <div className="theme-selector" style={{ padding: '8px 0' }}>
      {themes.map(t => (
        <button
          key={t.id}
          className={`theme-swatch theme-swatch--${t.id} ${currentTheme === t.id ? 'active' : ''}`}
          onClick={() => onThemeChange(t.id)}
          title={t.label}
          aria-label={`${t.label} leather theme`}
        />
      ))}
    </div>
  );
}
