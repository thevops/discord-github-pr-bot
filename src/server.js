import express, { json } from 'express';
import { initializeDiscord, handleGitHubWebhook } from './logic.js';
import dotenv from 'dotenv';
import { log } from './utils.js';
import { Config } from './config.js';

dotenv.config();

// Initialize Express app
const app = express();
app.use(json());

// Initialize Discord client
const discordClient = await initializeDiscord(process.env.DISCORD_BOT_TOKEN);
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

// In-memory cache for storing opened threads
const activePRThreads = new Map();

// Set port from environment or default
const port = Config.port || 3000;

// Health Check endpoint
app.get('/', (_, res) => {
  res.status(200).send({ "status": "ok" });
});

// GitHub webhook endpoint
app.post('/webhook', async (req, res) => {
  const payload = req.body;
  const headers = req.headers;
  const result = await handleGitHubWebhook(discordClient, discordChannelId, payload, headers, activePRThreads);

  if (result.success) {
    res.status(200).send({ "status": result.success, "message": result.message });
  } else {
    res.status(500).send({ "status": result.success, "message": result.message });
  }
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
