import React from 'react';
import { useTranslation } from '../../i18n/translations';
import { ThemeSelector } from './ThemeSelector';

export function LandingPage({ onStartTrial, onGoToLogin, language, leatherTheme, onThemeChange }) {
  const { t } = useTranslation(language);

  const renderHighlightedText = (text) => {
    if (!text) return null;
    return text.split('*').map((part, i) => (
      <React.Fragment key={i}>
        {i % 2 === 1 ? <span style={{ color: 'var(--gold)' }}>{part}</span> : part}
      </React.Fragment>
    ));
  };

  return (
    <div className="landing-page animate-in" style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '80px',
      position: 'relative'
    }}>
      {/* Dynamic Glows */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(232, 122, 154, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>

      <header className="card" style={{ 
        width: '100%', 
        padding: 'var(--space-md) var(--space-xl)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRadius: '0 0 24px 24px',
        margin: 0,
        borderTop: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="fleur" style={{ fontSize: '28px' }}>⚜</span>
          <h1 className="logo serif" style={{ fontSize: '32px' }}>KalTrac</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeSelector currentTheme={leatherTheme} onThemeChange={onThemeChange} />
          <button className="btn btn-ghost" onClick={onGoToLogin}>
            {t('login')}
          </button>
        </div>
      </header>

      <main style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 var(--space-lg)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Hero Section - Matching the Rich Leather below */}
        <section className="card animate-in" style={{ 
          margin: '60px 0 100px',
          padding: '120px 40px',
          textAlign: 'center',
          borderRadius: '32px'
        }}>
          <h2 className="serif" style={{ 
            fontSize: 'clamp(42px, 8vw, 88px)', 
            lineHeight: '1.05', 
            marginBottom: 'var(--space-lg)',
            letterSpacing: '-0.04em'
          }}>
             {renderHighlightedText(t('landingTitle'))}
          </h2>
          <p style={{ 
            fontSize: 'var(--space-lg)', 
            color: 'var(--muted)', 
            maxWidth: '740px', 
            margin: '0 auto var(--space-xl)',
            fontWeight: '300',
            lineHeight: '1.6'
          }}>
             {t('landingSubtitle')}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '24px 70px', fontSize: '22px' }} onClick={onStartTrial}>
               {t('startFreeTrial')}
            </button>
          </div>
        </section>

        {/* Bento Grid Showcase */}
        <div className="bento-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(240px, auto)',
          gap: 'var(--space-lg)',
        }}>
          <div className="card" style={{ gridColumn: 'span 2', gridRow: 'span 2', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-lg)' }}>📷</div>
            <h3 className="serif" style={{ fontSize: '38px', marginBottom: 'var(--space-md)', color: 'var(--gold)' }}>{t('visionEngine')}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '19px', lineHeight: '1.5' }}>{t('visionDesc')}</p>
          </div>

          <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: 'var(--space-md)' }}>🔲</div>
            <h3 className="serif" style={{ fontSize: '30px', marginBottom: 'var(--space-sm)' }}>{t('deepScan')}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '16px' }}>{t('deepScanDesc')}</p>
          </div>

          <div className="card" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <div style={{ fontSize: '40px', marginBottom: '16px' }}>🍽️</div>
             <h4 className="serif" style={{ fontSize: '20px' }}>{t('aiPlanning')}</h4>
          </div>

          <div className="card" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
             <h4 className="serif" style={{ fontSize: '20px' }}>{t('privacyFirst')}</h4>
          </div>

          <div className="card" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '32px', padding: 'var(--space-xl)' }}>
            <div style={{ fontSize: '64px' }}>🇨🇦</div>
            <div>
              <h3 className="serif" style={{ fontSize: '28px' }}>{t('bilingual')}</h3>
              <p style={{ fontSize: '15px', color: 'var(--muted)' }}>{t('quebecOptimized')}</p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ marginTop: '100px', width: '100%' }}>
        {/* Leather Strap with Buckle */}
        <div className="strap">
          <div className="buckle">
            <div className="buckle-prong"></div>
          </div>
          <span className="fleur">⚜</span>
          <span className="strap-text">{t('footerText')}</span>
        </div>
        <div style={{ padding: '32px', textAlign: 'center', opacity: 0.5 }}>
          <p style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Artisan Leather Interface · Quebec, Canada</p>
        </div>
      </footer>
    </div>
  );
}
