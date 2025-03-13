import express, { json } from 'express';
import { initializeDiscord, handleGitHubWebhook } from './logic.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Express app
const app = express();
app.use(json());

// Initialize Discord client
const discordClient = await initializeDiscord(process.env.DISCORD_BOT_TOKEN);
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

// Set port from environment or default
const port = process.env.PORT || 3000;

// GitHub webhook endpoint
app.post('/webhook', async (req, res) => {
  const payload = req.body;
  const result = await handleGitHubWebhook(discordClient, discordChannelId, payload);

  if (result.success) {
    res.status(200).send(result.message);
  } else {
    res.status(500).send(result.message);
  }
});

// Start server only after Discord client is ready
async function startServer() {
  try {
    // Start Express server
    app.listen(port, () => {
      console.log(`Webhook server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
