<template>
  <div class="app-wrapper">
    <div class="container">
      <header>
        <h1>My Hooks</h1>
        <div class="webhook-url">
          <p>Webhook URL: <code>{{ webhookUrl }}/webhook</code></p>
        </div>
        <div class="connection-status" :class="{ connected: isConnected }">
          Socket.IO Status: {{ isConnected ? 'Connected' : 'Disconnected' }}
        </div>
      </header>

      <main>
        <div class="webhooks-container">
          <h2>Received Webhooks</h2>
          <div v-if="webhooks.length === 0" class="no-webhooks">
            No webhooks received yet
          </div>
          <div v-else class="webhook-list">
            <div v-for="webhook in sortedWebhooks" :key="webhook.id" class="webhook-item">
              <div class="webhook-header">
                <div class="webhook-info">
                  <span class="event-type">{{ webhook.event_type || 'Webhook Event' }}</span>
                  <span class="timestamp">{{ formatDate(webhook.received_at) }}</span>
                </div>
              </div>
              <pre class="webhook-data">{{ formatWebhookData(webhook) }}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import axios from 'axios'

const webhooks = ref([])
const isConnected = ref(false)
const webhookUrl = import.meta.env.VITE_WEBHOOK_URL

// Configure Socket.IO
const socket = io(webhookUrl, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false
})

// Sort webhooks by received_at in descending order (newest first)
const sortedWebhooks = computed(() => {
  return [...webhooks.value].sort((a, b) => {
    return new Date(b.received_at) - new Date(a.received_at)
  })
})

// Format date string
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown time'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  } catch (e) {
    return 'Invalid date'
  }
}

// Format webhook data for display
const formatWebhookData = (webhook) => {
  if (!webhook) return 'No data'
  
  // Remove internal fields for display
  const { id, received_at, ...displayData } = webhook
  return JSON.stringify(displayData, null, 2)
}

// Socket.IO event handlers
socket.on('connect', () => {
  console.log('Connected to server')
  isConnected.value = true
})

socket.on('disconnect', () => {
  console.log('Disconnected from server')
  isConnected.value = false
})

socket.on('existingWebhooks', (existingWebhooks) => {
  webhooks.value = existingWebhooks
})

socket.on('newWebhook', (webhook) => {
  webhooks.value = [webhook, ...webhooks.value]
})

// Load existing webhooks and connect socket on mount
onMounted(() => {
  // Load existing webhooks
  axios.get(`${webhookUrl}/webhooks`)
    .then(response => {
      webhooks.value = response.data
    })
    .catch(error => {
      console.error('Failed to load webhooks:', error)
    })

  // Connect to Socket.IO server
  socket.connect()
})

// Cleanup on unmount
onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

<style>
/* Reset default styles and enforce light theme */
:root {
  color-scheme: light;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
</style>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #1a1a1a;
}

.container {
  min-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 40px;
  text-align: center;
}

h1 {
  color: #1a1a1a;
  margin-bottom: 20px;
  font-size: 2.5em;
}

.webhook-url {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.webhook-url code {
  background-color: #f0f2f5;
  padding: 5px 10px;
  border-radius: 4px;
  color: #2563eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.connection-status {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  background-color: #fee2e2;
  color: #991b1b;
  font-weight: 500;
}

.connection-status.connected {
  background-color: #dcfce7;
  color: #166534;
}

.webhooks-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

h2 {
  color: #1a1a1a;
  margin-bottom: 24px;
  font-size: 1.8em;
}

.no-webhooks {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-style: italic;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.webhook-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.webhook-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.webhook-header {
  background-color: #f8fafc;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.webhook-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-type {
  color: #2563eb;
  font-weight: 500;
}

.timestamp {
  color: #64748b;
  font-size: 0.9em;
}

.webhook-data {
  margin: 0;
  padding: 16px;
  background-color: #ffffff;
  overflow-x: auto;
  font-size: 0.9em;
  color: #1a1a1a;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  line-height: 1.5;
  text-align: left;
}

/* Add a subtle border to the pre element for better readability */
.webhook-data {
  border: 1px solid #f1f5f9;
  border-radius: 4px;
  margin: 12px;
}
</style>