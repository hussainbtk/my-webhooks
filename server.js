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

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: process.env.VITE_WEBHOOK_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Store webhooks in memory (for demo purposes)
const webhooks = [];

// Endpoint to receive webhooks from Wise
app.post('/webhook', (req, res) => {
  const webhookData = req.body;
  console.log('Received webhook:', webhookData);
  
  // Store the webhook with all its original data
  const webhook = {
    id: Date.now(),
    ...webhookData,
    received_at: new Date().toISOString()
  };
  webhooks.push(webhook);

  // Emit the webhook to all connected clients
  io.emit('newWebhook', webhook);
  
  res.status(200).json({ message: 'Webhook received successfully' });
});

// Endpoint to get all webhooks
app.get('/webhooks', (req, res) => {
  res.json(webhooks);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send existing webhooks to newly connected client
  socket.emit('existingWebhooks', webhooks);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3050;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});