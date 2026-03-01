import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

export function Settings({ language, t, onClose }) {
  const [settings, setSettings] = useState({
    daily_calorie_goal: 2000,
    daily_protein_goal: 150,
    daily_carbs_goal: 250,
    daily_fat_goal: 65,
    dietary_restrictions: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.getSettings();
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setSettings(prev => ({
        ...prev,
        dietary_restrictions: checked 
          ? [...prev.dietary_restrictions, value]
          : prev.dietary_restrictions.filter(r => r !== value)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsAPI.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = ['vegan', 'vegetarian', 'keto', 'gluten-free', 'dairy-free'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Settings</h2>
        <button onClick={onClose} style={styles.closeBtn}>×</button>
      </div>

      <form onSubmit={handleSave} style={styles.form}>
        <section>
          <h3>Daily Goals</h3>
          
          <label style={styles.label}>
            <span>Daily Calorie Goal</span>
            <input
              type="number"
              name="daily_calorie_goal"
              value={settings.daily_calorie_goal}
              onChange={handleChange}
              min="1000"
              max="5000"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            <span>Daily Protein Goal (g)</span>
            <input
              type="number"
              name="daily_protein_goal"
              value={settings.daily_protein_goal}
              onChange={handleChange}
              min="0"
              max="300"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            <span>Daily Carbs Goal (g)</span>
            <input
              type="number"
              name="daily_carbs_goal"
              value={settings.daily_carbs_goal}
              onChange={handleChange}
              min="0"
              max="500"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            <span>Daily Fat Goal (g)</span>
            <input
              type="number"
              name="daily_fat_goal"
              value={settings.daily_fat_goal}
              onChange={handleChange}
              min="0"
              max="200"
              style={styles.input}
            />
          </label>
        </section>

        <section style={styles.section}>
          <h3>Dietary Restrictions</h3>
          <div style={styles.checkboxGroup}>
            {dietaryOptions.map(option => (
              <label key={option} style={styles.checkbox}>
                <input
                  type="checkbox"
                  name="dietary_restrictions"
                  value={option}
                  checked={settings.dietary_restrictions.includes(option)}
                  onChange={handleChange}
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </label>
            ))}
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999',
    fontSize: '24px',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
    fontSize: '14px'
  },
  input: {
    padding: '10px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#ffd700',
    fontFamily: 'DM Mono, monospace'
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  message: {
    backgroundColor: '#2d3d2d',
    color: '#90ee90',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center'
  },
  button: {
    padding: '12px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};
