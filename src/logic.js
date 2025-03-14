import { Client, GatewayIntentBits, ChannelType, EmbedBuilder } from 'discord.js';
import { log } from './utils.js';

// Initialize the Discord client
export async function initializeDiscord(discordBotToken) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });

  client.once('ready', () => {
    log(`Logged in as ${client.user.tag}`);
    // Log all servers (guilds) the bot is connected to
    client.guilds.cache.forEach(guild => {
      log(`Connected to server: ${guild.name} (ID: ${guild.id})`);
    });
  });

  await client.login(discordBotToken);

  return client
}

// Helper function to find thread by PR number
async function findThreadByPR(channel, prNumber) {
  const activeThreads = await channel.threads.fetchActive();
  const archivedThreads = await channel.threads.fetchArchived();

  const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

  return allThreads.find(thread => thread.name.startsWith(`${prNumber}:`));
}

// Handle GitHub webhook payload
export async function handleGitHubWebhook(discordClient, discordChannelId, payload, headers) {
  const event = headers['x-github-event'];
  const action = payload.action;

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
  const repository = payload.repo.full_name;
  const prReviewers = payload.pull_request.requested_reviewers.map(reviewer => reviewer.login);
  const eventSender = payload.sender.login;

  try {
    // Fetch Discord channel
    const discordChannel = await discordClient.channels.fetch(discordChannelId);
    if (!discordChannel || discordChannel.type !== ChannelType.GuildText) {
      console.error('Invalid Discord channel ID');
      return { success: false, message: 'Invalid Discord channel ID' };
    }

    // Find existing thread (stateless approach)
    let thread = await findThreadByPR(discordChannel, prNumber);

    // Create thread if doesn't exist
    if (!thread) {
      const message = await discordChannel.send(`🚀 New thread for PR ${prNumber}: [${prTitle}](${prUrl})`);
      thread = await message.startThread({
        name: `${prNumber}: ${prTitle}`,
        autoArchiveDuration: 1440*3, // 3 days
      });
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

    return { success: true, message: 'Ok' };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}
