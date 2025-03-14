# Discord <> GitHub PR bot


## How to setup a bot in Discord?

1. Open https://discord.com/developers/applications/
2. Click `New Application`.
3. Go to `Bot` section, enable `Message Content Intent` and disable `Public Bot`.
4. Click `Reset token` and copy the token.
5. Go to `Installation` section, and set `None` for `Install Link`.
6. Go to `OAuth2` section.
7. Select:
    - scopes: `bot`,
    - bot permissions: `Create Private Threads`, `Create Public Threads`, `Manage Threads`, `Send Messages`, `Send Messages in Threads`,
    - integration type: `Guild Install`.
8. Click `Save Changes`.
9. Copy link provided below the scopes and permissions.
10. Open the link and add the bot to your Discord server.


## GitHub webhook events and actions

List of all events and actions:
https://docs.github.com/en/webhooks/webhook-events-and-payloads

### List of events to be subscribed for GitHub webhook

The bot supports the following events:

- Pull request review comments - Pull request diff comment created, edited, or deleted.
- Pull request reviews - Pull request review submitted, edited, or dismissed.
- Pull requests - Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, synchronized, unassigned, unlabeled, or unlocked.
- Pull requests review threads

More granular filtering can be done by specifying the `supported_events_actions`
in [the configuration file](./config/config.yaml).
