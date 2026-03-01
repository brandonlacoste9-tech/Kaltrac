/**
 * DeepSeek API service for food image analysis
 * Uses DeepSeek's vision model to analyze food pictures and extract nutrition info
 */

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export async function analyzeFood(imageBase64) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error(
      "VITE_DEEPSEEK_API_KEY is not configured. Please add it to your .env file."
    );
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-vision",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and provide nutritional information in JSON format. Return ONLY valid JSON with this structure:
{
  "name": "food name",
  "calories": number (estimated per serving),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "note": "optional tip or observation about the food"
}

Be accurate with calorie estimates and macros based on typical portions.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "DeepSeek API error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse nutrition data from response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !parsed.name ||
      !parsed.calories ||
      parsed.protein === undefined ||
      parsed.carbs === undefined ||
      parsed.fat === undefined
    ) {
      throw new Error("Invalid nutrition data structure");
    }

    return {
      name: parsed.name,
      calories: Math.round(parsed.calories),
      protein: Math.round(parsed.protein),
      carbs: Math.round(parsed.carbs),
      fat: Math.round(parsed.fat),
      note: parsed.note || null,
    };
  } catch (error) {
    console.error("Food analysis error:", error);
    throw error;
  }
}
