import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WEBHOOK_URL = process.env.VITE_WEBHOOK_URL || 'http://localhost:3050';
const PORT = process.env.VITE_SERVER_PORT || 3050;
const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? WEBHOOK_URL
  : 'http://localhost:5174';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_URL, WEBHOOK_URL],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: [FRONTEND_URL, WEBHOOK_URL],
  credentials: true
}));
app.use(express.json());

// Store webhooks in memory (for demo purposes)
const webhooks = [];

// Endpoint to receive webhooks from Wise
app.post('/webhook', (req, res) => {
  const webhookData = req.body;
  console.log('Received webhook:', webhookData);
  
  // Store the webhook
  webhooks.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    data: webhookData
  });

  // Emit the webhook to all connected clients
  io.emit('newWebhook', webhooks[webhooks.length - 1]);
  
  res.status(200).json({ message: 'Webhook received successfully' });
});

// Endpoint to get all webhooks
app.get('/webhooks', (req, res) => {
  res.json(webhooks);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});