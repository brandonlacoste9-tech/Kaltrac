import { useState } from 'react';
import { mealsAPI, workoutsAPI, waterAPI } from '../services/api';
import { exportToCSV, generateSimplePDF, exportWeeklyStats } from '../utils/exportUtils';

export function ExportData({ weekData, dailyGoal, t }) {
  const [exporting, setExporting] = useState(false);

  const handleExportWeeklyCSV = async () => {
    setExporting(true);
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const [mealsRes, workoutsRes, waterRes] = await Promise.all([
        mealsAPI.getMealsByRange(startDate, endDate),
        workoutsAPI.getWorkoutsByRange(startDate, endDate),
        waterAPI.getWaterByRange(startDate, endDate),
      ]);

      const allData = [
        ...mealsRes.data,
        ...workoutsRes.data,
        ...waterRes.data,
      ];

      exportToCSV(allData, `kaltrac-week-${endDate}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportWeeklyStats = () => {
    exportWeeklyStats(weekData, dailyGoal);
  };

  const handleGeneratePDF = () => {
    setExporting(true);
    try {
      generateSimplePDF(weekData, [], dailyGoal);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Export Data</h3>
      <p style={styles.description}>Download your nutrition and workout data in various formats</p>

      <div style={styles.buttonGroup}>
        <button
          onClick={handleExportWeeklyCSV}
          disabled={exporting}
          style={styles.button}
        >
          CSV (Week)
        </button>
        <button
          onClick={handleExportWeeklyStats}
          disabled={exporting}
          style={styles.button}
        >
          JSON (Stats)
        </button>
        <button
          onClick={handleGeneratePDF}
          disabled={exporting}
          style={styles.button}
        >
          {exporting ? 'Exporting...' : 'Image (Report)'}
        </button>
      </div>

      <div style={styles.info}>
        <p style={styles.infoText}>
          Your data is securely stored on our servers and only you can access it. Export anytime to back up or analyze your progress.
        </p>
      </div>
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
    fontFamily: 'Fraunces, serif',
    fontWeight: '600',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  description: {
    fontSize: '12px',
    color: '#999',
    fontFamily: 'DM Mono, monospace',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    marginBottom: '15px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'Fraunces, serif',
    transition: 'all 0.3s ease',
  },
  info: {
    backgroundColor: '#2a2a2a',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  infoText: {
    fontSize: '11px',
    color: '#bbb',
    fontFamily: 'DM Mono, monospace',
    margin: 0,
    lineHeight: '1.4',
  },
};
