import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/translations';
import { shoppingAPI } from '../../services/api';

export function ShoppingList({ language }) {
  const { t } = useTranslation(language);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await shoppingAPI.getList();
      setItems(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id, currentChecked) => {
    try {
      await shoppingAPI.toggleItem(id, !currentChecked);
      setItems(prev => prev.map(i => i.id === id ? { ...i, is_checked: !currentChecked } : i));
    } catch (err) { console.error(err); }
  };

  const removeItem = async (id) => {
    try {
      await shoppingAPI.removeItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  const clearCompleted = async () => {
    try {
      await shoppingAPI.clearCompleted();
      setItems(prev => prev.filter(i => !i.is_checked));
    } catch (err) { console.error(err); }
  };

  const totalCalories = items.filter(i => !i.is_checked).reduce((sum, i) => sum + (i.calories_per_serving || 0), 0);

  return (
    <div className="shopping-list card animate-in">
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="serif">{t('shoppingList')}</h3>
          <button className="btn btn-ghost" style={{ fontSize: '10px' }} onClick={clearCompleted}>{t('clearCompleted')}</button>
       </div>

       {loading ? (
         <div className="loading"></div>
       ) : items.length === 0 ? (
         <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px' }}>{t('emptyList')}</p>
       ) : (
         <div className="items-list">
            {items.map(item => (
               <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <input type="checkbox" checked={item.is_checked} onChange={() => handleToggle(item.id, item.is_checked)} />
                  {item.image_url && <img src={item.image_url} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />}
                  <div style={{ flex: 1, opacity: item.is_checked ? 0.3 : 1 }}>
                     <h4 style={{ fontSize: '14px', textDecoration: item.is_checked ? 'line-through' : 'none' }}>{item.product_name}</h4>
                     <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{item.brand}</p>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gold)' }}>{item.calories_per_serving} {t('kcal')}</div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>✕</button>
               </div>
            ))}
         </div>
       )}

       <div style={{ marginTop: '24px', textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{t('totalEstimated')} </span>
          <span className="serif" style={{ fontSize: '18px', color: 'var(--gold)' }}>{totalCalories} {t('kcal')}</span>
       </div>
    </div>
  );
}
