import { useState, useEffect } from 'react';
import { waterAPI } from '../services/api';

const DAILY_GOAL_ML = 2000; // 8 cups = 2000ml

export function WaterTracker({ t }) {
  const [logs, setLogs] = useState([]);
  const [totalMl, setTotalMl] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayWater();
  }, []);

  const loadTodayWater = async () => {
    try {
      const response = await waterAPI.getTodayWater();
      setLogs(response.data.logs);
      setTotalMl(response.data.totalMl);
    } catch (error) {
      console.error('Failed to load water logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWater = async (amount) => {
    try {
      await waterAPI.add({ amount_ml: amount });
      loadTodayWater();
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  const deleteLog = async (id) => {
    try {
      await waterAPI.deleteWater(id);
      loadTodayWater();
    } catch (error) {
      console.error('Failed to delete water log:', error);
    }
  };

  const percentage = Math.min((totalMl / DAILY_GOAL_ML) * 100, 100);
  const waterCups = Math.round(totalMl / 250); // 250ml per cup

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Water Intake</h3>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${percentage}%`,
            }}
          />
        </div>
        <div style={styles.progressText}>
          <span>{waterCups} cups</span>
          <span style={{ color: percentage >= 100 ? '#90ee90' : '#ffd700' }}>
            {totalMl} / {DAILY_GOAL_ML} ml
          </span>
        </div>
      </div>

      <div style={styles.quickAdd}>
        <button onClick={() => addWater(250)} style={styles.quickBtn}>
          +250ml
        </button>
        <button onClick={() => addWater(500)} style={styles.quickBtn}>
          +500ml
        </button>
        <button onClick={() => addWater(750)} style={styles.quickBtn}>
          +750ml
        </button>
      </div>

      <div style={styles.logsList}>
        {logs.length === 0 ? (
          <p style={styles.empty}>No water logged yet today</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={styles.logItem}>
              <div>
                <span style={styles.logAmount}>{log.amount_ml} ml</span>
                <span style={styles.logTime}>
                  {new Date(log.logged_at).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => deleteLog(log.id)}
                style={styles.deleteBtn}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#222',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '16px',
    color: '#ffd700',
    fontFamily: 'Fraunces, serif',
    fontWeight: '600',
    marginBottom: '15px',
    margin: 0,
  },
  progressContainer: {
    marginBottom: '20px',
  },
  progressBar: {
    width: '100%',
    height: '24px',
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #333',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4da6ff',
    transition: 'width 0.3s ease',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#bbb',
    fontFamily: 'DM Mono, monospace',
  },
  quickAdd: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '15px',
  },
  quickBtn: {
    padding: '8px',
    backgroundColor: '#2a2a2a',
    color: '#4da6ff',
    border: '1px solid #4da6ff',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'DM Mono, monospace',
    transition: 'all 0.3s ease',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  empty: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    fontFamily: 'DM Mono, monospace',
    margin: 0,
  },
  logItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  logAmount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4da6ff',
    fontFamily: 'DM Mono, monospace',
    marginRight: '10px',
  },
  logTime: {
    fontSize: '11px',
    color: '#999',
    fontFamily: 'DM Mono, monospace',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    color: '#f44',
    border: 'none',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '0 4px',
  },
};
