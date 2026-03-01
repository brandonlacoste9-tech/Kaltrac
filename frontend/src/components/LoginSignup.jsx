import { useState } from 'react';
import { authAPI } from '../services/api';

export function LoginSignup({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await authAPI.login(formData.email, formData.password);
      } else {
        result = await authAPI.register(formData.email, formData.password, formData.name);
      }

      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      onAuthSuccess(result.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    const demoUser = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@kaltrac.app',
      isDemo: true
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('isDemo', 'true');
    onAuthSuccess(demoUser);
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>KalTrac</h1>
          <p style={styles.subtitle}>AI-Powered Calorie Tracker</p>
          <p style={styles.tagline}>Track calories, macros, workouts & hydration with AI</p>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setMode('login')}
            style={{
              ...styles.tab,
              ...(mode === 'login' ? styles.tabActive : {})
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              ...styles.tab,
              ...(mode === 'signup' ? styles.tabActive : {})
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required={mode === 'signup'}
              style={styles.input}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              width: '100%',
              ...styles.submitButton,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>or try for free</span>
        </div>

        <button
          onClick={handleDemo}
          className="btn btn-accent"
          style={{
            width: '100%',
            ...styles.demoButton
          }}
        >
          🚀 Try Demo Mode
        </button>

        <p style={styles.disclaimer}>Demo mode uses local storage • No account needed • Full features included</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  background: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '-100px',
    right: '-100px',
    pointerEvents: 'none'
  },
  card: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    backdropFilter: 'blur(10px)',
    boxShadow: `
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(99, 102, 241, 0.1),
      inset 0 0 30px rgba(99, 102, 241, 0.05)
    `,
    position: 'relative',
    zIndex: 10
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#cbd5e1',
    marginBottom: '4px',
    fontWeight: '500'
  },
  tagline: {
    fontSize: '13px',
    color: '#94a3b8'
  },
  tabs: {
    display: 'flex',
    gap: '0',
    marginBottom: '28px',
    borderBottom: '2px solid rgba(99, 102, 241, 0.2)'
  },
  tab: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },
  tabActive: {
    color: '#f1f5f9',
    borderBottomColor: '#6366f1',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px'
  },
  input: {
    padding: '12px 16px',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.2)'
  },
  submitButton: {
    marginTop: '8px !important'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '500'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  demoButton: {
    fontSize: '14px !important',
    fontWeight: '600 !important'
  },
  disclaimer: {
    fontSize: '12px',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '16px'
  }
};
