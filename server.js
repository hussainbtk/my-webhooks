import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5174", // Updated to match Vite's port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
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

const PORT = process.env.PORT || 3050;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});