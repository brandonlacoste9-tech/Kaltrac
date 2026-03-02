import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BillTrac API' });
});

// Receipts Routes
app.get('/api/receipts', async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      orderBy: { scanned_at: 'desc' },
    });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/receipts/scan', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  // Placeholder for AI scanning logic
  // Will integrate Gemini Flash here
  res.json({
    store_name: "Luxe Boutique",
    total_amount: 1250.50,
    currency: "USD",
    items: [
      { name: "Leather Wallet", price: 450.00 },
      { name: "Silk Scarf", price: 800.50 }
    ],
    scanned_at: new Date(),
    status: "preview",
    note: "AI scanning requires Gemini API Key"
  });
});

app.listen(PORT, () => {
  console.log(`🏛️ BillTrac Backend running on port ${PORT}`);
});
