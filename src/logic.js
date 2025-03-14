import { Client, GatewayIntentBits, ChannelType, EmbedBuilder } from 'discord.js';
import { log } from './utils.js';
import { Config, InMemoryCache } from './config.js';

// Initialize the Discord client
export async function initializeDiscord(discordBotToken) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });

  client.once('ready', () => {
    log(`msg="Logged in as ${client.user.tag}"`);
    // Log all servers (guilds) the bot is connected to
    client.guilds.cache.forEach(guild => {
      log(`msg="Connected to server: ${guild.name} (ID: ${guild.id})"`);
    });
  });

  await client.login(discordBotToken);

  return client
}

// Helper function to find thread by PR number
async function findThreadByPR(channel, prNumber, cacheKey) {
  const activeThreads = await channel.threads.fetchActive();
  const archivedThreads = await channel.threads.fetchArchived();

  const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

  const thread = allThreads.find(thread => thread.name.startsWith(`${prNumber}:`));
  if (thread) {
    log(`pull_request=${prNumber} msg="Found existing thread for ${cacheKey} (stateless)"`);
    return thread;
  } else {
    return null;
  }
}

async function findThreadInCache(cacheKey) {
  if (InMemoryCache.has(cacheKey)) {
    const threadId = InMemoryCache.get(cacheKey);
    log(`msg="Found existing thread for ${cacheKey} (cache)"`);
    return threadId;
  }

  return null;
}

async function filterEventsAndActions(event, action) {
  // Check if the event exists in supported_events_actions
  if (event in Config.supported_events_actions) {
    const supportedActions = Config.supported_events_actions[event];

    // If supportedActions is empty array, accept all actions for this event
    if (Array.isArray(supportedActions) && supportedActions.length === 0) {
      return true;
    }

    // If supportedAction is null, ignore this event
    if (supportedActions === null) {
      return false;
    }

    // Otherwise check if the specific action is in the list
    if (Array.isArray(supportedActions) && supportedActions.includes(action)) {
      return true;
    }
  }

  // If we get here, either the event isn't supported or the action isn't supported for this event
  return false;
}

// Handle GitHub webhook payload
export async function handleGitHubWebhook(discordClient, discordChannelId, payload, headers) {
  const event = headers['x-github-event'];
  const action = payload.action;

  // Filter supported events and actions
  if (!await filterEventsAndActions(event, action)) {
    log(`event="${event}" action="${action}" msg="Ignoring unsupported event/action"`);
    return { success: true, message: 'Ignored unsupported event/action' };
  }

  if (!payload.pull_request) {
    log(`event="${event}" action="${action}" msg="Ignoring non-PR event"`);
    return { success: true, message: 'Ignored non-PR event' };
  } else {
    log(`event="${event}" action="${action}" pull_request=${payload.pull_request.number} msg="Processing event"`);
  }

  const prNumber = payload.pull_request.number;
  const prTitle = payload.pull_request.title;
  const prUrl = payload.pull_request.html_url;
  const prBranch = payload.pull_request.head.ref;
  const prAuthor = payload.pull_request.user.login;
  const repository = payload.repository.full_name;
  const prReviewers = payload.pull_request.requested_reviewers.map(reviewer => reviewer.login);
  const eventSender = payload.sender.login;

  try {
    // Fetch Discord channel
    const discordChannel = await discordClient.channels.fetch(discordChannelId);
    if (!discordChannel || discordChannel.type !== ChannelType.GuildText) {
      console.error('Invalid Discord channel ID');
      return { success: false, message: 'Invalid Discord channel ID' };
    }

    // Find thread
    let thread = null;
    const cacheKey = `${repository}:${prNumber}`;

    // Try to find thread ID in cache first
    const threadId = await findThreadInCache(cacheKey);
    if (threadId) {
      thread = await discordChannel.threads.fetch(threadId).catch(() => null);
    }

    // If not found in cache or fetching failed, search through threads
    if (!thread) {
      thread = await findThreadByPR(discordChannel, prNumber, cacheKey);
      // Update the cache if thread was found by searching through threads
      if (thread) {
        InMemoryCache.set(cacheKey, thread.id);
      }
    }

    // Create thread if doesn't exist
    if (!thread) {
      const message = await discordChannel.send(`🚀 New thread for ${repository} [#${prNumber}: ${prTitle}](${prUrl})`);
      thread = await message.startThread({
        name: `${prNumber}: ${prTitle}`,
        autoArchiveDuration: 1440 * 3, // 3 days
      });
      InMemoryCache.set(cacheKey, thread.id);
      log(`pull_request=${prNumber} msg="Created new thread for ${cacheKey}"`);
    }

    // Send message to thread
    const embed = new EmbedBuilder()
      .setTitle(`${event}(${action}) by ${eventSender}`)
      .setURL(prUrl)
      .setColor(9807270)
      .addFields(
        { name: 'Pull Request', value: `${prUrl}` },
        { name: 'Repository', value: `${repository}`, inline: true },
        { name: 'Branch', value: `${prBranch}`, inline: true },
        { name: 'Author', value: `${prAuthor}`, inline: true },
        { name: 'Reviewers', value: `${prReviewers.join(', ')}`, inline: true }
      );

    await thread.send({ embeds: [embed] });
    log(`pull_request=${prNumber} msg="Sent message to thread for ${cacheKey}"`);

    return { success: true, message: 'Ok' };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}
