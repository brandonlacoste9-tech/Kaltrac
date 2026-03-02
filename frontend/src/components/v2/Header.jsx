import React from 'react';
import { useTranslation } from '../../i18n/translations';

export function Header({ activeTab, onTabChange, language, onLanguageChange, user, onLogout }) {
  const { t } = useTranslation(language);

  const tabs = [
    { id: 'track', label: t('track'), icon: '📊' },
    { id: 'analytics', label: t('analytics'), icon: '📈' },
    { id: 'workouts', label: t('workouts'), icon: '💪' },
    { id: 'water', label: t('water'), icon: '💧' },
    { id: 'mealPlans', label: t('mealPlans'), icon: '🍽️' },
    { id: 'grocery', label: t('grocery'), icon: '🛒' },
    { id: 'export', label: t('export'), icon: '📥' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        <a href="/" className="logo serif" onClick={(e) => { e.preventDefault(); onTabChange('track'); }}>
          {t('logoText')}
        </a>
      </div>

      <div className="nav-center nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-right">
        <button 
          className="btn-ghost" 
          style={{ padding: '4px 8px', fontSize: '11px' }}
          onClick={() => onLanguageChange(language === 'en' ? 'fr' : 'en')}
        >
          {language === 'en' ? 'FR' : 'EN'}
        </button>
        
        <button className="btn-ghost" onClick={() => onTabChange('settings')}>
          ⚙️
        </button>

        {user ? (
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }} className="hide-mobile">
              {user.name}
            </span>
            <button className="btn-ghost" style={{ color: 'var(--red)' }} onClick={onLogout}>
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '6px 12px' }} onClick={() => onTabChange('login')}>
              {t('login')}
            </button>
            <button className="btn btn-primary" style={{ fontSize: '10px', padding: '6px 12px' }} onClick={() => { localStorage.setItem('kaltrac-initial-login', 'false'); onTabChange('login'); }}>
              {t('signup')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
