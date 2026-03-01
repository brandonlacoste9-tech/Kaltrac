import { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';

export function Favorites({ t, onSelectFavorite }) {
  const [favorites, setFavorites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await favoritesAPI.getAll();
      setFavorites(res.data);
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || ''
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await favoritesAPI.add(formData);
      setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' });
      setShowForm(false);
      loadFavorites();
    } catch (error) {
      console.error('Failed to add favorite', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await favoritesAPI.delete(id);
      loadFavorites();
    } catch (error) {
      console.error('Failed to delete favorite', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Favorite Meals</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? '−' : '+'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Meal name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <div style={styles.nutritionGrid}>
            <input
              type="number"
              name="calories"
              placeholder="Calories"
              value={formData.calories}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="number"
              name="protein"
              placeholder="Protein (g)"
              value={formData.protein}
              onChange={handleChange}
              step="0.1"
              style={styles.input}
            />
            <input
              type="number"
              name="carbs"
              placeholder="Carbs (g)"
              value={formData.carbs}
              onChange={handleChange}
              step="0.1"
              style={styles.input}
            />
            <input
              type="number"
              name="fat"
              placeholder="Fat (g)"
              value={formData.fat}
              onChange={handleChange}
              step="0.1"
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Adding...' : 'Add to Favorites'}
          </button>
        </form>
      )}

      <div style={styles.favoritesList}>
        {favorites.map(fav => (
          <div key={fav.id} style={styles.favoriteItem}>
            <div style={styles.favInfo}>
              <div style={styles.favName}>{fav.name}</div>
              <div style={styles.favNutrition}>
                {fav.calories} cal | P: {fav.protein}g | C: {fav.carbs}g | F: {fav.fat}g
              </div>
              <div style={styles.favUsed}>{fav.times_used} times used</div>
            </div>
            <div style={styles.favActions}>
              <button
                onClick={() => onSelectFavorite(fav)}
                style={styles.useBtn}
                title="Quick add"
              >
                ✓
              </button>
              <button
                onClick={() => handleDelete(fav.id)}
                style={styles.deleteBtn}
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  addBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    borderRadius: '8px'
  },
  input: {
    padding: '10px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#ffd700',
    fontFamily: 'DM Mono, monospace',
    fontSize: '13px'
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  button: {
    padding: '10px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px'
  },
  favoritesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  favoriteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #222'
  },
  favInfo: {
    flex: 1
  },
  favName: {
    fontWeight: '600',
    color: '#ffd700',
    fontSize: '14px'
  },
  favNutrition: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px'
  },
  favUsed: {
    fontSize: '11px',
    color: '#666',
    marginTop: '2px'
  },
  favActions: {
    display: 'flex',
    gap: '6px'
  },
  useBtn: {
    padding: '6px 10px',
    backgroundColor: '#2d5f2d',
    color: '#90ee90',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  deleteBtn: {
    padding: '6px 10px',
    backgroundColor: '#3d1f1f',
    color: '#ff6b6b',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  }
};
