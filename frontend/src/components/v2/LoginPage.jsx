import React, { useState } from 'react';
import { useTranslation } from '../../i18n/translations';
import { authAPI } from '../../services/api';

export function LoginPage({ onLoginSuccess, language }) {
  const { t } = useTranslation(language);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const res = await authAPI.login(email, password);
        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
      } else {
        const res = await authAPI.register(email, password, name);
        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('errorAuth'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card login-card animate-in" style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <h1 className="logo serif" style={{ fontSize: '32px', marginBottom: '8px' }}>KalTrac</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '32px' }}>{t('tagline')}</p>

        <div className="toggle-pills" style={{ marginBottom: '32px' }}>
          <button className={`toggle-pill ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>{t('login')}</button>
          <button className={`toggle-pill ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>{t('signup')}</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
               <label>{t('name')}</label>
               <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Tremblay" required />
            </div>
          )}
          <div className="form-group">
             <label>{t('email')}</label>
             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@example.com" required />
          </div>
          <div className="form-group">
             <label>{t('password')}</label>
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <p className="text-red" style={{ fontSize: '12px', marginBottom: '16px' }}>⚠️ {error}</p>}

          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? '...' : (isLogin ? t('login') : t('signup'))}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '11px', color: 'var(--dim)' }}>
          {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')} 
          <span style={{ color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? t('signup') : t('login')}
          </span>
        </p>
      </div>
    </div>
  );
}
