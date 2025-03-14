#!/bin/bash

curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "opened",
    "pull_request": {
      "number": 123,
      "title": "Test PR Title",
      "html_url": "https://github.com/user/repo/pull/123",
      "head": {
        "ref": "feature-branch"
      },
      "user": {
        "login": "pr-author"
      },
      "requested_reviewers": [
        { "login": "reviewer1" },
        { "login": "reviewer2" }
      ]
    },
    "sender": {
      "login": "pr-creator"
    },
    "repo": {
      "full_name": "user/repo"
    }
  }'
