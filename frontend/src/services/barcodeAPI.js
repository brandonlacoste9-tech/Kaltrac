/**
 * Open Food Facts API Service
 * Free API for nutritional product lookup by barcode
 * No authentication required
 */

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Fetch product information by barcode
 * @param {string} barcode - Product barcode/UPC
 * @returns {Promise<Object>} Product data with nutrition info
 */
export const fetchProductByBarcode = async (barcode) => {
  try {
    if (!barcode || barcode.trim().length === 0) {
      throw new Error('Invalid barcode');
    }

    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error('Product not found');
    }

    const data = await response.json();

    if (data.status === 0) {
      throw new Error('Product not found in database');
    }

    // Extract nutrition data from Open Food Facts
    const product = data.product;
    const nutrition = product.nutriments || {};

    return {
      id: barcode,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      image: product.image_front_small_url || null,
      barcode: barcode,
      
      // Nutrition per 100g (standard Open Food Facts format)
      calories: Math.round(nutrition['energy-kcal_100g'] || nutrition['energy_100g'] / 4.184 || 0),
      protein: Math.round((nutrition['proteins_100g'] || 0) * 10) / 10,
      carbs: Math.round((nutrition['carbohydrates_100g'] || 0) * 10) / 10,
      fat: Math.round((nutrition['fat_100g'] || 0) * 10) / 10,
      fiber: Math.round((nutrition['fiber_100g'] || 0) * 10) / 10,
      sugar: Math.round((nutrition['sugars_100g'] || 0) * 10) / 10,
      salt: Math.round((nutrition['salt_100g'] || 0) * 10) / 10,
      
      // Additional info
      ingredients: product.ingredients_text || null,
      allergens: product.allergens || null,
      servingSize: product.serving_size || '100g',
      quantity: product.quantity || null,
      
      source: 'Open Food Facts'
    };
  } catch (error) {
    console.error('[v0] Barcode lookup error:', error);
    throw error;
  }
};

/**
 * Search products by name
 * @param {string} query - Product name to search
 * @returns {Promise<Array>} Array of matching products
 */
export const searchProducts = async (query) => {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Invalid search query');
    }

    const response = await fetch(
      `https://world.openfoodfacts.org/search?query=${encodeURIComponent(query)}&json=1`
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    const products = data.products || [];

    return products.slice(0, 5).map(product => ({
      id: product.code,
      name: product.product_name || 'Unknown',
      brand: product.brands || 'Unknown',
      image: product.image_small_url || null,
      barcode: product.code,
      calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
      protein: Math.round((product.nutriments?.['proteins_100g'] || 0) * 10) / 10,
      carbs: Math.round((product.nutriments?.['carbohydrates_100g'] || 0) * 10) / 10,
      fat: Math.round((product.nutriments?.['fat_100g'] || 0) * 10) / 10,
    }));
  } catch (error) {
    console.error('[v0] Product search error:', error);
    throw error;
  }
};
