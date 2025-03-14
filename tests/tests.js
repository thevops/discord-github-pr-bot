function createTestData(actionArg) {
  return {
    action: actionArg,
    pull_request: {
      number: 131,
      title: 'Test PR Title',
      html_url: 'https://github.com/user/repo/pull/127',
      head: {
        ref: 'feature-branch'
      },
      user: {
        login: 'pr-author'
      },
      requested_reviewers: [
        { login: 'reviewer1' },
        { login: 'reviewer2' }
      ]
    },
    sender: {
      login: 'pr-creator'
    },
    repository: {
      full_name: 'user/repo'
    }
  };
}

async function sendTestRequest(event, requestBody) {
  try {
    const response = await fetch('http://localhost:3000/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': event
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function runTests() {
  const events_actions_map = {
    "pull_request": ["opened", "ready_for_review", "unsupported"],
    // "pull_request_review": ["submitted", "unsupported"],
    // "pull_request_review_comment": ["created", "unsupported"],
    // "pull_request_review_thread": ["created", "unsupported"]
  };

  for (const event in events_actions_map) {
    for (const action of events_actions_map[event]) {
      // console.log(`Event: ${event}, action: ${action}`);
      await sendTestRequest(event, createTestData(action));
      // await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      // console.log('---');
    }
  }
}

await runTests();
