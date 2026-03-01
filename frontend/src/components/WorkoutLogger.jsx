import { useState, useEffect } from 'react';
import { workoutsAPI } from '../services/api';

export function WorkoutLogger({ t }) {
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    exercise_name: '',
    duration_minutes: 30,
    calories_burned: 200,
    intensity: 'moderate',
    notes: '',
  });

  useEffect(() => {
    loadTodayWorkouts();
  }, []);

  const loadTodayWorkouts = async () => {
    try {
      const response = await workoutsAPI.getTodayWorkouts();
      setWorkouts(response.data);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await workoutsAPI.add(formData);
      setFormData({
        exercise_name: '',
        duration_minutes: 30,
        calories_burned: 200,
        intensity: 'moderate',
        notes: '',
      });
      setShowForm(false);
      loadTodayWorkouts();
    } catch (error) {
      console.error('Failed to add workout:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await workoutsAPI.deleteWorkout(id);
      loadTodayWorkouts();
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const totalBurned = workouts.reduce((sum, w) => sum + w.calories_burned, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Workouts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addBtn}
        >
          {showForm ? '−' : '+'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Exercise name"
            value={formData.exercise_name}
            onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
            style={styles.input}
            required
          />

          <input
            type="number"
            placeholder="Duration (min)"
            min="1"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            style={styles.input}
            required
          />

          <input
            type="number"
            placeholder="Calories burned"
            min="1"
            value={formData.calories_burned}
            onChange={(e) => setFormData({ ...formData, calories_burned: parseInt(e.target.value) })}
            style={styles.input}
            required
          />

          <select
            value={formData.intensity}
            onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
            style={styles.input}
          >
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="intense">Intense</option>
          </select>

          <button type="submit" style={styles.submitBtn}>Log Workout</button>
        </form>
      )}

      <div style={styles.summary}>
        <span>Calories Burned Today: <strong style={{ color: '#ffd700' }}>{totalBurned}</strong></span>
      </div>

      <div style={styles.workoutsList}>
        {workouts.map((workout) => (
          <div key={workout.id} style={styles.workoutItem}>
            <div style={styles.workoutInfo}>
              <div style={styles.workoutName}>{workout.exercise_name}</div>
              <div style={styles.workoutDetails}>
                {workout.duration_minutes} min · {workout.calories_burned} cal
              </div>
            </div>
            <button
              onClick={() => handleDelete(workout.id)}
              style={styles.deleteBtn}
            >
              ×
            </button>
          </div>
        ))}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  title: {
    fontSize: '16px',
    color: '#ffd700',
    fontFamily: 'Fraunces, serif',
    fontWeight: '600',
    margin: 0,
  },
  addBtn: {
    width: '32px',
    height: '32px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '15px',
  },
  input: {
    padding: '8px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    fontFamily: 'DM Mono, monospace',
  },
  submitBtn: {
    padding: '8px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  summary: {
    fontSize: '13px',
    color: '#bbb',
    marginBottom: '10px',
    fontFamily: 'DM Mono, monospace',
  },
  workoutsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  workoutItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'DM Mono, monospace',
  },
  workoutDetails: {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
  },
  deleteBtn: {
    backgroundColor: '#333',
    color: '#f44',
    border: '1px solid #444',
    borderRadius: '4px',
    width: '28px',
    height: '28px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
