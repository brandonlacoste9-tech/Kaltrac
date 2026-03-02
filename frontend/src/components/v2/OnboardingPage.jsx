import React, { useState } from 'react';
import { useTranslation } from '../../i18n/translations';
import { ThemeSelector } from './ThemeSelector';

const slides = [
  {
    emoji: '📷',
    titleKey: 'onb1Title',
    subtitleKey: 'onb1Sub',
    accentKey: 'onb1Accent',
  },
  {
    emoji: '🔲',
    titleKey: 'onb2Title',
    subtitleKey: 'onb2Sub',
    accentKey: 'onb2Accent',
  },
  {
    emoji: '⚜',
    titleKey: 'onb3Title',
    subtitleKey: 'onb3Sub',
    accentKey: 'onb3Accent',
    hasThemePicker: true,
    hasLanguagePicker: true,
  }
];

export function OnboardingPage({ language, onLanguageChange, leatherTheme, onThemeChange, onComplete }) {
  const { t } = useTranslation(language);
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const next = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrent(c => c + 1);
    }
  };

  const prev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient Glow */}
      <div style={{
        position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)', zIndex: 0
      }} />

      {/* Progress Dots */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '40px', zIndex: 10
      }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === current ? '28px' : '10px',
            height: '10px',
            borderRadius: '5px',
            background: i === current ? 'var(--gold)' : 'var(--border)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: i === current ? '0 0 12px var(--gold-glow)' : 'none',
          }} />
        ))}
      </div>

      {/* Main Card */}
      <div className="card" key={current} style={{
        maxWidth: '480px',
        width: '100%',
        padding: '60px 40px',
        textAlign: 'center',
        animation: 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        zIndex: 10,
      }}>
        {/* Emoji Icon */}
        <div style={{
          fontSize: slide.emoji === '⚜' ? '64px' : '72px',
          marginBottom: '28px',
          color: slide.emoji === '⚜' ? 'var(--gold)' : undefined,
          textShadow: slide.emoji === '⚜' ? '0 4px 12px var(--gold-glow)' : undefined,
          filter: slide.emoji !== '⚜' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : undefined,
        }}>
          {slide.emoji}
        </div>

        {/* Title */}
        <h2 className="serif" style={{
          fontSize: '32px',
          lineHeight: 1.2,
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}>
          {t(slide.titleKey).split('*').map((part, i) => (
            <React.Fragment key={i}>
              {i % 2 === 1
                ? <span style={{ color: 'var(--gold)' }}>{part}</span>
                : part}
            </React.Fragment>
          ))}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: 'var(--muted)',
          lineHeight: 1.6,
          marginBottom: '8px',
          fontWeight: 300,
        }}>
          {t(slide.subtitleKey)}
        </p>

        {/* Accent Line */}
        <p style={{
          fontSize: '12px',
          color: 'var(--gold)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginTop: '20px',
          opacity: 0.8,
        }}>
          {t(slide.accentKey)}
        </p>

        {/* Theme Picker - Slide 3 */}
        {slide.hasThemePicker && (
          <div style={{ marginTop: '32px' }}>
            <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              {t('chooseLeather')}
            </p>
            <ThemeSelector currentTheme={leatherTheme} onThemeChange={onThemeChange} />
          </div>
        )}

        {/* Language Picker - Slide 3 */}
        {slide.hasLanguagePicker && (
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              {t('chooseLanguage')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className={`btn ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '10px 28px', fontSize: '14px' }}
                onClick={() => onLanguageChange('en')}
              >
                English
              </button>
              <button
                className={`btn ${language === 'fr' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '10px 28px', fontSize: '14px' }}
                onClick={() => onLanguageChange('fr')}
              >
                Français
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', gap: '16px', marginTop: '40px', zIndex: 10,
        width: '100%', maxWidth: '480px', justifyContent: 'space-between',
      }}>
        <button
          className="btn btn-ghost"
          style={{ opacity: current === 0 ? 0.3 : 1, pointerEvents: current === 0 ? 'none' : 'auto' }}
          onClick={prev}
        >
          ← {t('back')}
        </button>
        <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }} onClick={next}>
          {isLast ? `⚜ ${t('beginJourney')}` : `${t('next')} →`}
        </button>
      </div>

      {/* Skip */}
      <button
        onClick={onComplete}
        style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'none', border: 'none', color: 'var(--muted)',
          fontSize: '13px', cursor: 'pointer', letterSpacing: '1px',
          zIndex: 100,
        }}
      >
        {t('skip')} →
      </button>
    </div>
  );
}
