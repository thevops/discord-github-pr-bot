import express, { json } from 'express';
import { initializeDiscord, handleGitHubWebhook } from './logic.js';
import dotenv from 'dotenv';
import { log } from './utils.js';
import { Config } from './config.js';

dotenv.config();

// Initialize Express app
const app = express();
app.use(json());

// Create a mutex for webhook processing
let webhookLock = false;
let webhookQueue = [];

// Initialize Discord client
const discordClient = await initializeDiscord(process.env.DISCORD_BOT_TOKEN);
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

// Set port from environment or default
const port = Config.port || 3000;

// Function to process the next item in the queue
async function processNextWebhook() {
  if (webhookQueue.length === 0 || webhookLock) {
    return;
  }

  webhookLock = true;
  const { payload, headers, res } = webhookQueue.shift();

  try {
    const result = await handleGitHubWebhook(discordClient, discordChannelId, payload, headers);

    if (result.success) {
      res.status(200).send({ "status": result.success, "message": result.message });
    } else {
      res.status(500).send({ "status": result.success, "message": result.message });
    }
  } catch (error) {
    log(`msg="Error processing webhook" error="${error.message}"`);
    res.status(500).send({ "status": false, "message": `Error: ${error.message}` });
  } finally {
    webhookLock = false;
    // Process next webhook in queue if any
    process.nextTick(processNextWebhook);
  }
}

// Health Check endpoint
app.get('/', (_, res) => {
  res.status(200).send({ "status": "ok" });
});

// GitHub webhook endpoint
app.post('/webhook', async (req, res) => {
  const payload = req.body;
  const headers = req.headers;

  // Add request to queue
  webhookQueue.push({ payload, headers, res });
  log(`msg="Webhook request queued, current queue length: ${webhookQueue.length}"`);

  // Try to process next item in queue
  processNextWebhook();
});

// Start server only after Discord client is ready
async function startServer() {
  try {
    // Start Express server
    app.listen(port, () => {
      log(`msg="Webhook server listening on port ${port}"`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
