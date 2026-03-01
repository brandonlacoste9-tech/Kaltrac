import React, { useState, useRef } from 'react';
import { fetchProductByBarcode, searchProducts } from '../services/barcodeAPI';
import { parseBarcodeInput } from '../services/barcodeDetection';

export default function BarcodeScanner({ language, t, onProductSelect }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProduct(null);
    setSearchResults([]);

    const cleanedBarcode = parseBarcodeInput(barcodeInput);

    if (!cleanedBarcode) {
      setError(t('barcodeScanError'));
      return;
    }

    setIsLoading(true);

    try {
      const productData = await fetchProductByBarcode(cleanedBarcode);
      setProduct(productData);
      setBarcodeInput('');
    } catch (err) {
      // If barcode not found, try search with the input
      if (barcodeInput.trim().length > 2) {
        try {
          const results = await searchProducts(barcodeInput);
          if (results.length > 0) {
            setSearchResults(results);
          } else {
            setError(t('noBarcodeDetected'));
          }
        } catch (searchErr) {
          setError(t('barcodeScanError'));
        }
      } else {
        setError(t('noBarcodeDetected'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      // For image-based barcode scanning, we'd normally use a library like quagga.js
      // For now, we'll show an error directing to manual entry
      setError(
        'Image barcode detection requires additional setup. Please enter the barcode manually or use the product search below.'
      );

      // Here's where you'd integrate a barcode detection library:
      // const barcode = await detectBarcodeFromImage(file);
      // Then call fetchProductByBarcode(barcode)
    } catch (err) {
      setError(err.message || t('barcodeScanError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (selectedProduct) => {
    setProduct(selectedProduct);
    setSearchResults([]);
    setBarcodeInput('');
  };

  const handleAddToLog = () => {
    if (product && onProductSelect) {
      onProductSelect({
        name: product.name,
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        mealType: 'product',
        source: 'barcode',
        productData: product
      });
      setProduct(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Barcode Input Section */}
      <div style={styles.inputSection}>
        <h3 style={styles.sectionTitle}>{t('scanBarcode')}</h3>

        <form onSubmit={handleBarcodeSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="EAN-13, UPC-A, or product name..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={styles.input}
            disabled={isLoading}
          />
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? t('analyzing') : t('scanBarcode')}
          </button>
        </form>

        <div style={styles.uploadSection}>
          <p style={styles.uploadText}>{t('uploadReceipt')}</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={styles.uploadButton}
            disabled={isLoading}
          >
            Upload Image
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={styles.resultsSection}>
          <h4 style={styles.resultsTitle}>Similar Products</h4>
          <div style={styles.resultsList}>
            {searchResults.map((result) => (
              <div
                key={result.barcode}
                style={styles.resultCard}
                onClick={() => handleSelectProduct(result)}
              >
                {result.image && (
                  <img src={result.image} alt={result.name} style={styles.productImage} />
                )}
                <div style={styles.resultInfo}>
                  <p style={styles.productName}>{result.name}</p>
                  <p style={styles.productBrand}>{result.brand}</p>
                  <p style={styles.productCalories}>{result.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Details */}
      {product && (
        <div style={styles.productCard}>
          <div style={styles.productHeader}>
            {product.image && (
              <img src={product.image} alt={product.name} style={styles.productImageLarge} />
            )}
            <div style={styles.productDetails}>
              <h3 style={styles.productNameLarge}>{product.name}</h3>
              <p style={styles.productBrandLarge}>{product.brand}</p>
              <p style={styles.barcodeDisplay}>Barcode: {product.barcode}</p>
            </div>
          </div>

          <div style={styles.nutritionGrid}>
            <div style={styles.nutritionItem}>
              <p style={styles.nutritionLabel}>{t('protein')}</p>
              <p style={styles.nutritionValue}>{product.protein}g</p>
            </div>
            <div style={styles.nutritionItem}>
              <p style={styles.nutritionLabel}>{t('carbs')}</p>
              <p style={styles.nutritionValue}>{product.carbs}g</p>
            </div>
            <div style={styles.nutritionItem}>
              <p style={styles.nutritionLabel}>{t('fat')}</p>
              <p style={styles.nutritionValue}>{product.fat}g</p>
            </div>
            <div style={styles.nutritionItem}>
              <p style={styles.nutritionLabel}>Fiber</p>
              <p style={styles.nutritionValue}>{product.fiber}g</p>
            </div>
          </div>

          <button style={styles.addButton} onClick={handleAddToLog}>
            {t('addToLog')}
          </button>

          <button style={styles.cancelButton} onClick={() => setProduct(null)}>
            {t('cancel')}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '20px auto',
    padding: '0 20px'
  },
  inputSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#ffd700',
    fontFamily: 'Fraunces, serif'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'inherit'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
    transition: 'all 0.3s ease'
  },
  uploadSection: {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: '2px dashed #333',
    textAlign: 'center'
  },
  uploadText: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '15px'
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  errorBox: {
    padding: '15px',
    backgroundColor: '#ff4444',
    color: '#fff',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  resultsSection: {
    marginBottom: '30px'
  },
  resultsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#ffd700'
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  resultCard: {
    display: 'flex',
    padding: '15px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #333',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    gap: '15px'
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '6px',
    backgroundColor: '#000'
  },
  resultInfo: {
    flex: 1
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 5px 0'
  },
  productBrand: {
    fontSize: '12px',
    color: '#999',
    margin: '0 0 8px 0'
  },
  productCalories: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffd700'
  },
  productCard: {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    border: '2px solid #ffd700'
  },
  productHeader: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    alignItems: 'flex-start'
  },
  productImageLarge: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: '#000'
  },
  productDetails: {
    flex: 1
  },
  productNameLarge: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#fff',
    fontFamily: 'Fraunces, serif'
  },
  productBrandLarge: {
    fontSize: '14px',
    color: '#999',
    margin: '0 0 10px 0'
  },
  barcodeDisplay: {
    fontSize: '12px',
    color: '#ffd700',
    margin: 0,
    fontFamily: 'DM Mono, monospace'
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '20px'
  },
  nutritionItem: {
    padding: '15px',
    backgroundColor: '#000',
    borderRadius: '8px',
    textAlign: 'center'
  },
  nutritionLabel: {
    fontSize: '12px',
    color: '#999',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  nutritionValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffd700',
    margin: 0,
    fontFamily: 'DM Mono, monospace'
  },
  addButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '10px',
    fontFamily: 'Fraunces, serif',
    transition: 'all 0.3s ease'
  },
  cancelButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'inherit'
  }
};
