import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/translations';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { groceryCacheAPI, shoppingAPI, aiAPI } from '../../services/api';
import { ShoppingList } from './ShoppingList';

export function GroceryScannerPage({ language, userSettings }) {
  const { t } = useTranslation(language);
  const [scannerOpen, setScannerOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [safetyReport, setSafetyReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareProduct, setCompareProduct] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('kaltrac_grocery_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleScan = async (barcode) => {
    setLoading(true);
    setError(null);
    setSafetyReport(null);
    try {
      let data;
      try {
        const cached = await groceryCacheAPI.get(barcode);
        data = cached.data.product_data;
      } catch (e) {
        const res = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        if (res.data.status === 1) {
          data = res.data.product;
          try { await groceryCacheAPI.set(barcode, data); } catch {}
        } else {
          setError("Product not found");
        }
      }
      
      if (data) {
        if (compareMode) {
          setCompareProduct(data);
          setScannerOpen(false);
        } else {
          setProduct(data);
          addToHistory(data);
          setScannerOpen(false);
          // Fetch safety analysis
          fetchSafetyReport(data);
        }
      }
    } catch (err) {
      setError(t('errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSafetyReport = async (productData) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/ai/barcode-enhance`, { product: productData });
      setSafetyReport(res.data);
    } catch (e) {
      console.warn('Safety report unavailable:', e.message);
    }
  };

  const addToHistory = (p) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item._id !== p._id);
      const updated = [p, ...filtered].slice(0, 10);
      localStorage.setItem('kaltrac_grocery_history', JSON.stringify(updated));
      return updated;
    });
  };

  const renderIngredientPill = (ing) => {
    let color = '';
    const text = ing.text.toLowerCase();
    const restrictions = userSettings.dietary_restrictions || [];
    const isAllergen = restrictions.some(r => text.includes(r.toLowerCase()));
    if (isAllergen) color = 'red';
    else if (text.includes('sugar') || text.includes('syrup')) color = 'gold';
    else if (text.includes('organic') || text.includes('bio')) color = 'green';
    return (
      <span key={ing.text} className={`tag-pill ingredient-pill ${color}`}>
        {ing.text}
      </span>
    );
  };

  return (
    <div className="grocery-page animate-in">
       {scannerOpen && (
         <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
            <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
              <span className="fleur" style={{ marginLeft: '12px' }}>🔎</span>
              <span className="strap-text" style={{ fontSize: '13px' }}>{t('scanner')}</span>
            </div>
            <div className="scanner-viewport" style={{ position: 'relative', minHeight: '300px' }}>
              <Scanner
                onScan={(res) => res && res[0] && handleScan(res[0].rawValue)}
                styles={{ container: { height: 350, width: '100%' } }}
                components={{ torch: true, finder: true }}
              />
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                 <button className="btn btn-ghost" style={{ background: 'rgba(0,0,0,0.5)', border: 'none' }} onClick={() => setScannerOpen(false)}>✕</button>
              </div>
            </div>
         </div>
       )}

       {product && !compareMode && (
         <div className="product-result animate-in">
            <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
               <div className="strap" style={{ borderTopLeftRadius: "14px", borderTopRightRadius: "14px", borderTop: "none" }}>
                 <span className="fleur" style={{ marginLeft: '12px' }}>🥑</span>
                 <span className="strap-text" style={{ fontSize: '13px' }}>{t('productDetails', 'Product Details')}</span>
               </div>
               
               <div style={{ padding: '32px' }}>
                 <div className="product-header" style={{ display: 'flex', gap: '20px' }}>
                    <img src={product.image_url} alt="" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '12px', background: 'var(--raised)', padding: '8px', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }} />
                    <div style={{ flex: 1 }}>
                       <small style={{ color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', fontWeight: 600 }}>{product.brands}</small>
                       <h2 className="serif" style={{ fontSize: '24px', color: 'var(--text)', marginTop: '4px' }}>{product.product_name}</h2>
                    </div>
                 </div>
                 
                 <div className="scores-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '24px 0' }}>
                    <ScoreBadge type="nutriscore" value={product.nutriscore_grade} label={t('nutriscore')} />
                    <ScoreBadge type="nova" value={product.nova_group} label={t('novaGroup')} />
                 </div>

                 {/* Safety Report */}
                 {safetyReport && <SafetyPanel report={safetyReport} t={t} />}

                 <div className="ingredients" style={{ marginTop: '24px' }}>
                    <h4 className="serif" style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--gold)' }}>{t('ingredientsDeepDive')}</h4>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                       {product.ingredients?.slice(0, 15).map(renderIngredientPill)}
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '16px' }} onClick={() => shoppingAPI.addItem(product)}>
                      {t('addToCart')}
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: '16px' }} onClick={() => setCompareMode(true)}>⚖️ {t('compare')}</button>
                 </div>
               </div>
            </div>
         </div>
       )}


       {compareMode && (
         <div className="compare-view card animate-in">
            <h3 className="serif" style={{ marginBottom: '20px' }}>{t('productComparison')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <CompareColumn product={product} label={t('itemA')} t={t} />
               <CompareColumn product={compareProduct} label={t('itemB')} onScan={() => setScannerOpen(true)} t={t} />
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: '20px' }} onClick={() => {setCompareMode(false); setCompareProduct(null);}}>{t('clearComparison')}</button>
         </div>
       )}

       <div style={{ marginTop: '24px' }}>
          <ShoppingList language={language} />
       </div>

       <div style={{ marginTop: '24px' }}>
          <h3 className="serif" style={{ marginBottom: '16px' }}>{t('recentScans')}</h3>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
             {history.map(item => (
                <div key={item._id} className="card" style={{ minWidth: '120px', padding: '12px', textAlign: 'center' }} onClick={() => setProduct(item)}>
                   <img src={item.image_url} alt="" style={{ height: '50px', objectFit: 'contain' }} />
                   <p style={{ fontSize: '10px', marginTop: '8px' }}>{item.product_name?.substring(0, 20)}</p>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function CompareColumn({ product, label, onScan, t }) {
  if (!product) return (
     <div style={{ textAlign: 'center', border: '1px dashed var(--dim)', borderRadius: '12px', padding: '40px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '11px', marginBottom: '12px' }}>{label} {t('empty')}</p>
        <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={onScan}>{t('scanItemB')}</button>
     </div>
  );
  return (
    <div style={{ textAlign: 'center' }}>
       <h4 style={{ fontSize: '12px', color: 'var(--gold)', marginBottom: '12px' }}>{label}</h4>
       <img src={product.image_url} style={{ height: '80px', objectFit: 'contain', marginBottom: '12px' }} />
       <p style={{ fontWeight: 'bold', fontSize: '13px' }}>{product.product_name}</p>
       <div style={{ marginTop: '16px', fontSize: '12px' }}>
          <div style={{ marginBottom: '8px' }}>{t('nutriscoreGrade')} <span style={{ fontWeight: 'bold' }}>{product.nutriscore_grade?.toUpperCase()}</span></div>
          <div>{t('novaGroupGrade')} <span style={{ fontWeight: 'bold' }}>{product.nova_group}</span></div>
       </div>
    </div>
  );
}

function ScoreBadge({ type, value, label }) {
  const getNutriColor = (v) => {
    switch(v?.toLowerCase()) {
      case 'a': return '#038141';
      case 'b': return '#85bb2f';
      case 'c': return '#fecb02';
      case 'd': return '#ee8100';
      case 'e': return '#e63e11';
      default: return 'var(--dim)';
    }
  };
  const getNovaColor = (v) => {
    switch(v) {
      case 1: return 'var(--green)';
      case 2: return 'var(--blue)';
      case 3: return 'var(--amber)';
      case 4: return 'var(--red)';
      default: return 'var(--dim)';
    }
  };
  return (
    <div style={{ background: 'var(--raised)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '8px' }}>{label}</p>
      <div style={{ 
          display: 'inline-flex', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '18px', fontWeight: 'bold',
          background: type === 'nutriscore' ? getNutriColor(value) : 'transparent', color: type === 'nutriscore' ? 'white' : getNovaColor(value),
          border: type === 'nova' ? `3px solid ${getNovaColor(value)}` : 'none'
      }}>
        {value ? value.toString().toUpperCase() : '?'}
      </div>
    </div>
  );
}

/** Safety & Health Intelligence Panel */
function SafetyPanel({ report, t }) {
  if (!report) return null;
  
  const scoreColor = report.healthScore >= 7 ? 'var(--green)' : report.healthScore >= 4 ? '#fecb02' : 'var(--red)';
  
  return (
    <div style={{ margin: '20px 0', padding: '20px', background: 'var(--raised)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      {/* Health Score + Verdict */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          border: `4px solid ${scoreColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 'bold', color: scoreColor,
          flexShrink: 0,
        }}>
          {report.healthScore}
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{report.verdict}</p>
          {report.isUltraProcessed && (
            <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>⚠️ Ultra-processed (NOVA 4)</p>
          )}
        </div>
      </div>

      {/* Flagged Additives */}
      {report.flaggedAdditives?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            ⚠️ Flagged Additives ({report.flaggedAdditives.length})
          </h5>
          {report.flaggedAdditives.map((a, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', marginBottom: '4px', borderRadius: '8px',
              background: a.risk === 'high' ? 'rgba(230, 62, 17, 0.1)' : 'rgba(254, 203, 2, 0.1)',
              border: `1px solid ${a.risk === 'high' ? 'rgba(230, 62, 17, 0.3)' : 'rgba(254, 203, 2, 0.3)'}`,
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600 }}>{a.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{a.note}</p>
              </div>
              <span className={`tag-pill ${a.risk === 'high' ? 'red' : 'gold'}`}>{a.risk}</span>
            </div>
          ))}
        </div>
      )}

      {/* Allergens */}
      {report.allergens?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            🏷️ Allergens
          </h5>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {report.allergens.map((a, i) => (
              <span key={i} className="tag-pill red" style={{ textTransform: 'capitalize' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Women's Health Flags */}
      {report.womensFlags?.length > 0 && (
        <div>
          <h5 style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            ⚜ Women's Health Insights
          </h5>
          {report.womensFlags.map((flag, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', marginBottom: '4px', borderRadius: '8px',
              background: flag.severity === 'positive' ? 'rgba(126, 201, 138, 0.1)' : 'rgba(254, 203, 2, 0.1)',
              border: `1px solid ${flag.severity === 'positive' ? 'rgba(126, 201, 138, 0.3)' : 'rgba(254, 203, 2, 0.3)'}`,
            }}>
              <span style={{ fontSize: '18px' }}>{flag.icon}</span>
              <p style={{ fontSize: '12px' }}>{flag.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
