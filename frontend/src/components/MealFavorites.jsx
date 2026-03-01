import { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';

export function MealFavorites({ onSelectFavorite, t }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await favoritesAPI.delete(id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete favorite:', error);
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading favorites...</div>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Quick Add</h3>
      {favorites.length === 0 ? (
        <p style={styles.empty}>No favorites yet. Save meals to add them here.</p>
      ) : (
        <div style={styles.grid}>
          {favorites.map((favorite) => (
            <div key={favorite.id} style={styles.favoriteCard}>
              <div style={styles.favName}>{favorite.name}</div>
              <div style={styles.favMacros}>
                <span>{favorite.calories} cal</span>
                <span>P: {favorite.protein}g</span>
              </div>
              <div style={styles.favActions}>
                <button
                  onClick={() => onSelectFavorite(favorite)}
                  style={styles.addBtn}
                >
                  +
                </button>
                <button
                  onClick={() => handleDelete(favorite.id)}
                  style={styles.delBtn}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#222',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '16px',
    color: '#ffd700',
    marginBottom: '15px',
    fontFamily: 'Fraunces, serif',
    fontWeight: '600',
  },
  empty: {
    fontSize: '13px',
    color: '#999',
    fontFamily: 'DM Mono, monospace',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px',
  },
  favoriteCard: {
    backgroundColor: '#2a2a2a',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #333',
    cursor: 'pointer',
  },
  favName: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '8px',
    fontFamily: 'DM Mono, monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  favMacros: {
    fontSize: '11px',
    color: '#bbb',
    marginBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  favActions: {
    display: 'flex',
    gap: '4px',
  },
  addBtn: {
    flex: 1,
    padding: '6px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
  },
  delBtn: {
    padding: '6px 8px',
    backgroundColor: '#333',
    color: '#f44',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
  },
};
