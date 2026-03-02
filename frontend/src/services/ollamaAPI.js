import api from './api';

/**
 * KalTrac 2.0 AI Service - Ollama First
 * Using local Ollama through our backend proxy.
 */

export const analyzeFood = async (imageBase64) => {
  try {
    const response = await api.post('/ai/analyze', { imageBase64 });
    
    // Validate and clean up result
    const result = response.data;
    return {
      name: result.name || "Unknown Dish",
      calories: result.calories || 0,
      protein: result.protein || 0,
      carbs: result.carbs || 0,
      fat: result.fat || 0,
      sugar: result.sugar || 0,
      fiber: result.fiber || 0,
      ingredients: result.ingredients || [],
      note: result.note || "Analysis provided by local AI (Ollama)."
    };
  } catch (error) {
    console.error("Local AI Vision Error:", error);
    throw new Error("Could not reach Ollama. Ensure Ollama is running and models are installed.");
  }
};

export const generateMealPlan = async (targets) => {
  try {
    const response = await api.post('/ai/meal-plan', targets);
    return response.data;
  } catch (error) {
    console.error("Local AI Planning Error:", error);
    throw error;
  }
};

export const getMealSuggestions = async (budget) => {
  try {
    const response = await api.post('/ai/suggest', budget);
    return response.data;
  } catch (error) {
    console.error("Local AI Suggestion Error:", error);
    throw error;
  }
};
