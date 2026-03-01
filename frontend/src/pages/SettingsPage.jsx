import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

export function SettingsPage({ t, user, onLogout }) {
  const [settings, setSettings] = useState({
    daily_calorie_goal: 2000,
    daily_protein_goal: 150,
    daily_carbs_goal: 250,
    daily_fat_goal: 65,
    dietary_restrictions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return <div style={styles.loading}>Loading settings...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.userInfo}>Logged in as: {user.email}</p>
      </div>

      <div style={styles.settingsSection}>
        <h2 style={styles.sectionTitle}>Daily Nutrition Goals</h2>
        
        <div style={styles.settingItem}>
          <label style={styles.label}>Daily Calorie Goal</label>
          <input
            type="number"
            value={settings.daily_calorie_goal}
            onChange={(e) => handleInputChange('daily_calorie_goal', parseInt(e.target.value))}
            style={styles.input}
          />
        </div>

        <div style={styles.settingItem}>
          <label style={styles.label}>Daily Protein Goal (g)</label>
          <input
            type="number"
            value={settings.daily_protein_goal}
            onChange={(e) => handleInputChange('daily_protein_goal', parseInt(e.target.value))}
            style={styles.input}
          />
        </div>

        <div style={styles.settingItem}>
          <label style={styles.label}>Daily Carbs Goal (g)</label>
          <input
            type="number"
            value={settings.daily_carbs_goal}
            onChange={(e) => handleInputChange('daily_carbs_goal', parseInt(e.target.value))}
            style={styles.input}
          />
        </div>

        <div style={styles.settingItem}>
          <label style={styles.label}>Daily Fat Goal (g)</label>
          <input
            type="number"
            value={settings.daily_fat_goal}
            onChange={(e) => handleInputChange('daily_fat_goal', parseInt(e.target.value))}
            style={styles.input}
          />
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.buttonGroup}>
        <button onClick={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    color: '#ffd700',
    marginBottom: '8px',
    fontFamily: 'Fraunces, serif',
    fontWeight: '700',
  },
  userInfo: {
    fontSize: '14px',
    color: '#999',
    fontFamily: 'DM Mono, monospace',
  },
  settingsSection: {
    backgroundColor: '#222',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#ffd700',
    marginBottom: '20px',
    fontFamily: 'Fraunces, serif',
    fontWeight: '600',
  },
  settingItem: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#ccc',
    marginBottom: '8px',
    fontFamily: 'DM Mono, monospace',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'DM Mono, monospace',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  saveButton: {
    padding: '12px 30px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  logoutButton: {
    padding: '12px 30px',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  message: {
    backgroundColor: '#2a5a2a',
    color: '#90ee90',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #3a7a3a',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontFamily: 'DM Mono, monospace',
  },
};
