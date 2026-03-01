import { useState } from 'react';
import { analyzeFood } from '../services/deepseekAPI';

export function MealPlanning({ dailyGoal, dietaryRestrictions, t }) {
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState(null);

  const generateMealPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prompt = `Generate a healthy meal plan for one day with:
- Daily calorie goal: ${dailyGoal} calories
- Dietary restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'none'}
- Include 4 meals: breakfast, lunch, dinner, snack

For each meal, provide:
1. Meal name
2. Calories
3. Protein (g)
4. Carbs (g)
5. Fat (g)
6. Brief description

Format as JSON with meals array.`;

      const result = await analyzeFood(null, prompt);
      
      // Parse the meal plan from the response
      try {
        const parsed = JSON.parse(result);
        setMealPlan(parsed);
      } catch {
        // If not valid JSON, create a structured response
        setMealPlan({
          meals: [
            { name: 'Sample Meal', calories: 500, protein: 25, carbs: 50, fat: 15, description: 'Check API response' }
          ]
        });
      }
    } catch (err) {
      setError('Failed to generate meal plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>AI Meal Planner</h2>
        <button
          onClick={generateMealPlan}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {mealPlan && (
        <div style={styles.planContainer}>
          <h3 style={styles.planTitle}>Your Personalized Meal Plan</h3>
          
          <div style={styles.mealGrid}>
            {mealPlan.meals && mealPlan.meals.map((meal, idx) => (
              <div key={idx} style={styles.mealCard}>
                <div style={styles.mealName}>{meal.name}</div>
                <div style={styles.mealCalories}>{meal.calories} cal</div>
                <div style={styles.mealMacros}>
                  <div>P: {meal.protein}g</div>
                  <div>C: {meal.carbs}g</div>
                  <div>F: {meal.fat}g</div>
                </div>
                {meal.description && (
                  <div style={styles.mealDescription}>{meal.description}</div>
                )}
              </div>
            ))}
          </div>

          {mealPlan.meals && (
            <div style={styles.summary}>
              <strong>Daily Total:</strong> {mealPlan.meals.reduce((sum, m) => sum + (m.calories || 0), 0)} calories
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  error: {
    backgroundColor: '#3d1f1f',
    color: '#ff6b6b',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px'
  },
  planContainer: {
    marginTop: '20px'
  },
  planTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: '16px'
  },
  mealGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  mealCard: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '16px'
  },
  mealName: {
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: '8px',
    fontSize: '14px'
  },
  mealCalories: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#90ee90',
    marginBottom: '8px'
  },
  mealMacros: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
    fontSize: '11px',
    color: '#999',
    marginBottom: '8px'
  },
  mealDescription: {
    fontSize: '12px',
    color: '#ccc',
    fontStyle: 'italic'
  },
  summary: {
    backgroundColor: '#0a0a0a',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#ffd700',
    fontSize: '14px'
  }
};
