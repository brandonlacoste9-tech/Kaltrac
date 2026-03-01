import { useState } from 'react';
import { generateMealPlan, getMealAlternatives } from '../services/mealPlanner';

export function MealPlanner({ dailyGoal, t }) {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [restrictions, setRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');
  const [alternatives, setAlternatives] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const plan = await generateMealPlan(dailyGoal, restrictions, preferences);
      setMealPlan(plan);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAlternatives = async (mealName) => {
    setLoading(true);
    try {
      const alts = await getMealAlternatives(mealName);
      setAlternatives(alts);
      setSelectedMeal(mealName);
    } catch (error) {
      console.error('Failed to get alternatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPlanner = () => {
    setMealPlan([]);
    setShowForm(true);
    setRestrictions('');
    setPreferences('');
    setAlternatives(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI Meal Planner</h2>

      {showForm ? (
        <form onSubmit={handleGeneratePlan} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Dietary Restrictions</label>
            <input
              type="text"
              placeholder="e.g., vegetarian, vegan, gluten-free"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Preferences</label>
            <input
              type="text"
              placeholder="e.g., high protein, low sodium, Mediterranean diet"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Generating...' : 'Generate 7-Day Plan'}
          </button>
        </form>
      ) : (
        <>
          <div style={styles.planGrid}>
            {mealPlan.length > 0 ? (
              mealPlan.map((meal, idx) => (
                <div key={idx} style={styles.mealCard}>
                  <div style={styles.dayLabel}>Day {meal.day} - {meal.meal_type}</div>
                  <div style={styles.mealName}>{meal.name}</div>
                  <div style={styles.macros}>
                    <span>{meal.calories} cal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fat}g</span>
                  </div>
                  <p style={styles.description}>{meal.description}</p>
                  <button
                    onClick={() => handleGetAlternatives(meal.name)}
                    style={styles.altBtn}
                  >
                    Alternatives
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.empty}>No meal plan generated</p>
            )}
          </div>

          {alternatives && (
            <div style={styles.alternativesModal}>
              <div style={styles.alternativesContent}>
                <h3 style={styles.altTitle}>Alternatives for {selectedMeal}</h3>
                <div style={styles.altsList}>
                  {alternatives.map((alt, idx) => (
                    <div key={idx} style={styles.altItem}>
                      <div style={styles.altName}>{alt.name}</div>
                      <div style={styles.altMacros}>
                        {alt.calories} cal · P: {alt.protein}g · C: {alt.carbs}g · F: {alt.fat}g
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setAlternatives(null)}
                  style={styles.closeBtn}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <button onClick={resetPlanner} style={styles.resetBtn}>
            Generate New Plan
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#222',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    color: '#ffd700',
    fontFamily: 'Fraunces, serif',
    fontWeight: '700',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    color: '#ccc',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: 'DM Mono, monospace',
  },
  input: {
    padding: '10px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    fontFamily: 'DM Mono, monospace',
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
    marginTop: '10px',
  },
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  mealCard: {
    backgroundColor: '#2a2a2a',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #333',
  },
  dayLabel: {
    fontSize: '10px',
    color: '#999',
    textTransform: 'uppercase',
    fontFamily: 'DM Mono, monospace',
    marginBottom: '6px',
  },
  mealName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  macros: {
    fontSize: '11px',
    color: '#bbb',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px',
    fontFamily: 'DM Mono, monospace',
  },
  description: {
    fontSize: '12px',
    color: '#aaa',
    marginBottom: '10px',
    lineHeight: '1.3',
    margin: '0 0 10px 0',
  },
  altBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#333',
    color: '#ffd700',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  alternativesModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  alternativesContent: {
    backgroundColor: '#222',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  altTitle: {
    fontSize: '18px',
    color: '#ffd700',
    fontFamily: 'Fraunces, serif',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  altsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '15px',
  },
  altItem: {
    backgroundColor: '#2a2a2a',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  altName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  altMacros: {
    fontSize: '11px',
    color: '#999',
    fontFamily: 'DM Mono, monospace',
  },
  closeBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  resetBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#333',
    color: '#ffd700',
    border: '1px solid #444',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  empty: {
    fontSize: '13px',
    color: '#999',
    textAlign: 'center',
    padding: '20px',
  },
};
