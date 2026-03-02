import express from 'express';
import axios from 'axios';
import { authenticateRequest } from '../middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ===== AI Provider Configuration =====
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_VISION_MODEL = "moondream:latest";
const OLLAMA_TEXT_MODEL = "llama3:latest";

// Optional auth — works for both logged-in and trial/guest
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    authenticateRequest(req, res, (err) => {
      if (err) req.user = { id: 'guest' };
      next();
    });
  } else {
    req.user = { id: 'guest' };
    next();
  }
};

// ===== AI Provider Functions =====

/** Gemini Flash — Primary (free tier: 15 req/min) */
async function analyzeWithGemini(imageBase64) {
  if (!GEMINI_API_KEY) return null;
  
  const response = await axios.post(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    contents: [{
      parts: [
        { text: `You are a professional nutritionist AI. Analyze this food image carefully.
Return ONLY valid JSON with this exact structure:
{
  "name": "descriptive food name",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "sugar": number (grams),
  "fiber": number (grams),
  "ingredients": ["ingredient1", "ingredient2"],
  "portion_size": "estimated portion in grams or cups",
  "confidence": "high/medium/low",
  "health_score": number 1-10,
  "note": "brief nutritional insight"
}
Be accurate with portion estimation. If multiple items visible, estimate the full plate.` },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
      ]
    }],
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.2 
    }
  }, { timeout: 15000 });

  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return { ...JSON.parse(text), provider: 'gemini-flash' };
}

/** Ollama — Fallback (local, free) */
async function analyzeWithOllama(imageBase64) {
  const response = await axios.post(OLLAMA_URL, {
    model: OLLAMA_VISION_MODEL,
    messages: [{
      role: "user",
      content: "Analyze this food image. Return ONLY valid JSON: { \"name\": \"food name\", \"calories\": 450, \"protein\": 25, \"carbs\": 40, \"fat\": 15, \"sugar\": 5, \"fiber\": 3, \"ingredients\": [], \"note\": \"...\" }",
      images: [imageBase64]
    }],
    stream: false,
    format: "json"
  }, { timeout: 30000 });

  return { ...JSON.parse(response.data.message.content), provider: 'ollama' };
}

/** Gemini Text — for meal plans & suggestions */
async function textWithGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  
  const response = await axios.post(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.4 
    }
  }, { timeout: 15000 });

  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

/** Ollama Text — fallback for meal plans */
async function textWithOllama(prompt) {
  const response = await axios.post(OLLAMA_URL, {
    model: OLLAMA_TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    stream: false,
    format: "json"
  }, { timeout: 30000 });

  return JSON.parse(response.data.message.content);
}

// ===== Routes =====

/** Health Check */
router.get('/health', async (req, res) => {
  let gemini = !!GEMINI_API_KEY;
  let ollama = false;
  try {
    await axios.get(OLLAMA_URL.replace('/api/chat', ''), { timeout: 2000 });
    ollama = true;
  } catch {}
  res.json({ gemini, ollama, primary: gemini ? 'gemini-flash' : ollama ? 'ollama' : 'fallback' });
});

/** 📷 Food Photo Analysis — Cascade: Gemini → Ollama → Fallback */
router.post('/analyze', optionalAuth, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image provided" });

  // Try Gemini first
  try {
    const result = await analyzeWithGemini(imageBase64);
    if (result) return res.json(result);
  } catch (e) {
    console.warn('Gemini failed, trying Ollama:', e.message);
  }

  // Try Ollama
  try {
    const result = await analyzeWithOllama(imageBase64);
    return res.json(result);
  } catch (e) {
    console.warn('Ollama failed:', e.message);
  }

  // Fallback
  res.json({
    name: "Manual Entry Required",
    calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0,
    ingredients: [],
    note: "⚠️ AI not available. Enter nutrition manually.",
    fallback: true, provider: 'none'
  });
});

/** 🍽️ Meal Plan Generation — Cascade: Gemini → Ollama → Sample */
router.post('/meal-plan', optionalAuth, async (req, res) => {
  const { dailyGoal, proteinGoal, carbsGoal, fatGoal, restrictions } = req.body;
  const prompt = `Act as a nutritionist. Create a 1-day meal plan (4 meals).
Goals: ${dailyGoal || 2000} kcal, P:${proteinGoal || 150}g, C:${carbsGoal || 250}g, F:${fatGoal || 65}g.
Restrictions: ${restrictions || 'None'}.
Return ONLY JSON: { "meals": [{ "name": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "emoji": "🍳", "type": "breakfast" }] }`;

  try {
    const result = await textWithGemini(prompt);
    if (result) return res.json({ ...result, provider: 'gemini' });
  } catch (e) { console.warn('Gemini meal plan failed:', e.message); }

  try {
    const result = await textWithOllama(prompt);
    return res.json({ ...result, provider: 'ollama' });
  } catch (e) { console.warn('Ollama meal plan failed:', e.message); }

  res.json({
    meals: [
      { name: "Oatmeal with Berries", calories: 350, protein: 12, carbs: 55, fat: 8, emoji: "🥣", type: "breakfast" },
      { name: "Grilled Chicken Salad", calories: 450, protein: 40, carbs: 20, fat: 18, emoji: "🥗", type: "lunch" },
      { name: "Greek Yogurt & Nuts", calories: 280, protein: 18, carbs: 22, fat: 14, emoji: "🥜", type: "snack" },
      { name: "Salmon with Quinoa", calories: 520, protein: 38, carbs: 42, fat: 16, emoji: "🐟", type: "dinner" },
    ],
    fallback: true
  });
});

/** ✨ AI Meal Suggestions — Cascade */
router.post('/suggest', optionalAuth, async (req, res) => {
  const { remainingCalories } = req.body;
  const prompt = `Suggest 3 healthy snacks under ${remainingCalories || 500} calories. Return ONLY JSON: { "suggestions": [{ "name": "...", "calories": 0, "protein": 0, "emoji": "🍎" }] }`;

  try {
    const result = await textWithGemini(prompt);
    if (result) return res.json(result);
  } catch (e) { console.warn('Gemini suggest failed:', e.message); }

  try {
    const result = await textWithOllama(prompt);
    return res.json(result);
  } catch (e) { console.warn('Ollama suggest failed:', e.message); }

  res.json({
    suggestions: [
      { name: "Apple with Peanut Butter", calories: 190, protein: 7, emoji: "🍎" },
      { name: "Greek Yogurt", calories: 130, protein: 12, emoji: "🥛" },
      { name: "Trail Mix (30g)", calories: 150, protein: 5, emoji: "🥜" },
    ],
    fallback: true
  });
});

/** 🏷️ Enhanced Barcode Analysis — Safety + Additive Scoring */
router.post('/barcode-enhance', optionalAuth, async (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ error: "No product data" });

  // Extract safety signals from Open Food Facts data
  const additives = product.additives_tags || [];
  const allergens = product.allergens_tags || [];
  const nutriScore = product.nutriscore_grade || 'unknown';
  const novaGroup = product.nova_group || 0;
  const ingredients = product.ingredients_text || '';

  // Known risky additives
  const RISKY_ADDITIVES = {
    'en:e150d': { name: 'Caramel Color (E150d)', risk: 'medium', note: 'May contain 4-MEI' },
    'en:e250': { name: 'Sodium Nitrite (E250)', risk: 'high', note: 'Linked to processed meat concerns' },
    'en:e621': { name: 'MSG (E621)', risk: 'low', note: 'Generally safe but may cause sensitivity' },
    'en:e951': { name: 'Aspartame (E951)', risk: 'medium', note: 'Artificial sweetener' },
    'en:e320': { name: 'BHA (E320)', risk: 'high', note: 'Potential endocrine disruptor' },
    'en:e321': { name: 'BHT (E321)', risk: 'high', note: 'Potential endocrine disruptor' },
    'en:e171': { name: 'Titanium Dioxide (E171)', risk: 'high', note: 'Banned in EU as food additive' },
    'en:e110': { name: 'Sunset Yellow (E110)', risk: 'medium', note: 'Artificial color, may affect attention in children' },
    'en:e102': { name: 'Tartrazine (E102)', risk: 'medium', note: 'Artificial color' },
  };

  // Build safety report
  const flaggedAdditives = additives.map(a => RISKY_ADDITIVES[a]).filter(Boolean);
  const allergenList = allergens.map(a => a.replace('en:', '').replace(/-/g, ' '));

  // Health score (1-10): higher is better
  let healthScore = 7;
  if (nutriScore === 'a') healthScore = 9;
  else if (nutriScore === 'b') healthScore = 7;
  else if (nutriScore === 'c') healthScore = 5;
  else if (nutriScore === 'd') healthScore = 3;
  else if (nutriScore === 'e') healthScore = 1;
  
  // Penalize for risky additives
  healthScore -= flaggedAdditives.filter(a => a.risk === 'high').length * 2;
  healthScore -= flaggedAdditives.filter(a => a.risk === 'medium').length;
  healthScore = Math.max(1, Math.min(10, healthScore));

  // Nova penalty (ultra-processed)
  if (novaGroup === 4) healthScore = Math.max(1, healthScore - 2);

  // Women's health flags
  const womensFlags = [];
  if (flaggedAdditives.some(a => a.note?.includes('endocrine'))) {
    womensFlags.push({ icon: '⚠️', text: 'Contains potential endocrine disruptors', severity: 'high' });
  }
  if (product.nutriments?.sodium_100g > 600) {
    womensFlags.push({ icon: '🧂', text: 'High sodium — may affect water retention', severity: 'medium' });
  }
  if (product.nutriments?.sugars_100g > 20) {
    womensFlags.push({ icon: '🍬', text: 'High sugar — consider impact on energy levels', severity: 'medium' });
  }
  const ironContent = product.nutriments?.iron_100g || 0;
  if (ironContent > 3) {
    womensFlags.push({ icon: '💪', text: 'Good iron source — important for menstrual health', severity: 'positive' });
  }
  const calciumContent = product.nutriments?.calcium_100g || 0;
  if (calciumContent > 100) {
    womensFlags.push({ icon: '🦴', text: 'Good calcium source — supports bone health', severity: 'positive' });
  }

  res.json({
    healthScore,
    nutriScore,
    novaGroup,
    flaggedAdditives,
    allergens: allergenList,
    womensFlags,
    totalAdditives: additives.length,
    isUltraProcessed: novaGroup === 4,
    verdict: healthScore >= 7 ? '✅ Good Choice' : healthScore >= 4 ? '⚠️ Moderate' : '🚫 Poor Choice',
  });
});

export default router;
