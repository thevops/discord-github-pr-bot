# Discord <> GitHub PR bot


## How to setup a bot in Discord?

1. Open https://discord.com/developers/applications/
2. Click `New Application`.
3. Go to `Bot` section and enable `Message Content Intent`.
4. Click `Reset token` and copy the token.
5. Go to `Installation` section.
6. Scroll down to `Guild Install`.
7. Select:
    - scopes: `applications.commands` and `bot`
    - permissions: `Create Private Threads`, `Create Public Threads`, `Manage Threads`, `Send Messages`, `Send Messages in Threads`.
8. Click `Save Changes`.
9. Copy link provided in the above section `Install Link`.
10. Open the link and add the bot to your Discord server.


## GitHub webhook events and actions

List of all events and actions:
https://docs.github.com/en/webhooks/webhook-events-and-payloads

### List of events to be subscribed for GitHub webhook

Make sure that you have subscribed to the following events:

- Pull request review comments - Pull request diff comment created, edited, or deleted.
- Pull request reviews - Pull request review submitted, edited, or dismissed.
- Pull requests - Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, synchronized, unassigned, unlabeled, or unlocked.

<!---
TODO

### Supported events and actions

The following events and actions are supported:

- pull_request
    - assigned
    - closed
    - edited - The title or body of a pull request was edited, or the base branch of a pull request was changed.
    - opened
    - ready_for_review
    - reopened
    - review_requested
- pull_request_review_comment
    - created
- pull_request_review
    - dismissed
    - edited - The body comment on a pull request review was edited.
    - submitted - A review on a pull request was submitted.
--->
