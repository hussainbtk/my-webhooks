<template>
  <div class="app-wrapper">
    <div class="container">
      <header>
        <h1>My Hooks</h1>
        <div class="webhook-url">
          <p>Webhook URL: <code>{{ webhookUrl }}/webhook</code></p>
        </div>
      </header>

      <main>
        <div class="webhooks-container">
          <h2>Received Webhooks</h2>
          <div v-if="webhooks.length === 0" class="no-webhooks">
            No webhooks received yet
          </div>
          <div v-else class="webhook-list">
            <div v-for="webhook in webhooks" :key="webhook.id" class="webhook-item">
              <div class="webhook-header">
                <span class="timestamp">{{ new Date(webhook.timestamp).toLocaleString() }}</span>
              </div>
              <pre class="webhook-data">{{ JSON.stringify(webhook.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'
import axios from 'axios'

const webhooks = ref([])
const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:3050'

const socket = io(webhookUrl)

// Load existing webhooks on mount
onMounted(async () => {
  try {
    const response = await axios.get(`${webhookUrl}/webhooks`)
    webhooks.value = response.data
  } catch (error) {
    console.error('Failed to load webhooks:', error)
  }
})

// Listen for new webhooks
socket.on('newWebhook', (webhook) => {
  webhooks.value.push(webhook)
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