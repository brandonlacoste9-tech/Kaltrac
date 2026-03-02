import React, { useState, useEffect } from 'react';
import { Camera, Receipt, FileText, PieChart, Trash2, Plus, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const App = () => {
  const [receipts, setReceipts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await axios.get('/api/receipts');
      setReceipts(res.data);
    } catch (err) {
      console.error('Failed to fetch receipts');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result);
      setIsScanning(true);
      
      try {
        const res = await axios.post('/api/receipts/scan', { imageBase64: reader.result.split(',')[1] });
        setReceipts([res.data, ...receipts]);
        // Note: In real app, we'd save to DB
      } catch (error) {
        console.error('Scan failed');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold gold-text">LuxeBill</h1>
          <p className="text-text-dim">AI-Powered Receipt Intelligence</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-gold flex items-center gap-2">
            <Plus size={18} /> New Expense
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="luxury-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Camera size={20} className="text-gold" /> Scan Receipt
            </h2>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="receipt-upload" 
                onChange={handleFileUpload}
              />
              <label htmlFor="receipt-upload" className="file-input">
                <div className="text-center">
                  <Plus size={48} className="mx-auto mb-2 text-gold opacity-50" />
                  <p className="text-sm text-text-dim">Drop receipt or click to scan</p>
                </div>
              </label>
            </div>
          </div>

          <div className="luxury-card">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-text-dim">Monthly Spent</span>
                <span className="text-2xl font-bold font-mono">$4,285.00</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold w-2/3 shadow-[0_0_10px_#d4af37]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Intelligence Feed</h2>
            <div className="text-text-dim text-sm">Recent Activity</div>
          </div>

          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="luxury-card border-gold animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-xl">
                    <PieChart className="text-gold animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI is analyzing...</h3>
                    <p className="text-sm text-text-dim">Extracting totals, taxes, and items</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {receipts.length === 0 ? (
              <div className="luxury-card text-center py-12">
                <Receipt size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-text-dim">No receipts scanned yet.</p>
              </div>
            ) : (
              receipts.map((r, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="luxury-card flex items-center justify-between hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-gold">
                      <FileText />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{r.store_name}</h3>
                      <p className="text-sm text-text-dim">
                        {new Date(r.scanned_at).toLocaleDateString()} • {r.items?.length} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-bold text-gold">
                      {new Intl.NumberFormat('en-CA', { style: 'currency', currency: r.currency || 'CAD' }).format(r.total_amount)}
                    </div>
                    <ChevronRight size={16} className="ml-auto mt-1 opacity-20" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
