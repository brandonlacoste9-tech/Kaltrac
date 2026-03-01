import { analyzeFood } from './deepseekAPI';

export async function generateMealPlan(dailyGoal, dietaryRestrictions, preferences) {
  const prompt = `You are a nutrition expert. Generate a healthy 7-day meal plan with these constraints:
- Daily calorie goal: ${dailyGoal} calories
- Dietary restrictions: ${dietaryRestrictions || 'none'}
- Preferences: ${preferences || 'balanced nutrition'}

For each meal, provide:
1. Meal name
2. Calories
3. Protein (g)
4. Carbs (g)
5. Fat (g)
6. Brief description

Format as JSON array with structure: [{day: 1, meal_type: "breakfast/lunch/dinner", name: "", calories: 0, protein: 0, carbs: 0, fat: 0, description: ""}]

Generate the response as valid JSON only, no additional text.`;

  try {
    const response = await analyzeFood(prompt);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Meal plan generation failed:', error);
    return [];
  }
}

export async function suggestMealByMacros(protein, carbs, fat, calorieLimit) {
  const prompt = `Suggest a single meal that matches these macros (approximately):
- Protein: ${protein}g
- Carbs: ${carbs}g
- Fat: ${fat}g
- Calorie limit: ${calorieLimit}

Provide response as JSON: {name: "", calories: 0, protein: 0, carbs: 0, fat: 0, description: ""}
JSON only, no extra text.`;

  try {
    const response = await analyzeFood(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Meal suggestion failed:', error);
    return null;
  }
}

export async function getMealAlternatives(mealName, restrictedIngredients = []) {
  const prompt = `Suggest 3 healthy alternatives to "${mealName}"${
    restrictedIngredients.length > 0 
      ? ` that don't contain: ${restrictedIngredients.join(', ')}`
      : ''
  }

For each alternative, provide calories, protein, carbs, and fat.
Response format: [{name: "", calories: 0, protein: 0, carbs: 0, fat: 0}]
JSON array only.`;

  try {
    const response = await analyzeFood(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Getting meal alternatives failed:', error);
    return [];
  }
}
