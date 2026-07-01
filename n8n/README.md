# n8n Cloud Setup Guide

## Prerequisites
- n8n Cloud account: https://app.n8n.cloud
- Backend deployed on Railway (get your URL from Railway dashboard)
- Gmail account with App Password enabled
- Groq Cloud API key: https://console.groq.com
- Slack Incoming Webhook URL

---

## Step 1 — Environment Variables in n8n Cloud

In your n8n Cloud instance, go to **Settings → Variables** and add:

| Variable | Value |
|---|---|
| `BACKEND_URL` | `https://your-service.railway.app` |
| `N8N_API_KEY` | Same UUID you set in Railway env |
| `SLACK_WEBHOOK_URL` | Your Slack Incoming Webhook URL |
| `GMAIL_FROM` | `your-email@gmail.com` |
| `DIGEST_EMAIL_TO` | `recipient@example.com` |

---

## Step 2 — Configure Credentials

### Gmail IMAP (for Email → Task workflow)
1. In Gmail → Settings → Security → Enable 2-Factor Authentication
2. Go to Google Account → Security → App Passwords → Generate one for "Mail"
3. In n8n: **Credentials → New → IMAP**
   - Host: `imap.gmail.com`
   - Port: `993`
   - TLS: `true`
   - User: `your-email@gmail.com`
   - Password: `<16-char App Password>`

### Gmail SMTP (for Weekly Digest)
1. Use the same App Password from above
2. In n8n: **Credentials → New → SMTP**
   - Host: `smtp.gmail.com`
   - Port: `465`
   - SSL: `true`
   - User: `your-email@gmail.com`
   - Password: `<App Password>`

### Groq API Key
1. Get key from https://console.groq.com/keys
2. In n8n: **Credentials → New → Header Auth**
   - Name: `Groq API Key`
   - Header Name: `Authorization`
   - Header Value: `Bearer gsk_your_groq_api_key`

### Slack
1. Go to https://api.slack.com/apps → Create App → Incoming Webhooks
2. Enable Incoming Webhooks → Add to Workspace → Copy URL
3. Set `SLACK_WEBHOOK_URL` variable in n8n (used directly in the workflow node)
4. OR: **Credentials → New → Slack API** if using Slack node auth

---

## Step 3 — Import Workflows

1. In n8n Cloud: go to **Workflows → Import**
2. Import each JSON file from `n8n/workflows/`:
   - `email-to-task.json`
   - `daily-reminders.json`
   - `weekly-digest.json`
3. After importing each workflow:
   - Open it and assign the correct credentials to each node
   - Update node variables (`GMAIL_IMAP_CRED_ID`, etc.) to match your credential IDs

---

## Step 4 — Activate Workflows

1. Open each workflow
2. Toggle the **Active** switch in the top-right corner
3. Verify by checking **Executions** tab after triggering manually

---

## Step 5 — Test Each Workflow

### Test Email → Task
1. Send an email to your Gmail account with a task-like subject (e.g., "Fix the login bug by Friday - URGENT")
2. Wait up to 2 minutes for the IMAP trigger to poll
3. Check your backend: `GET /api/tasks` should show the new task with `source: "email"`
4. Check Slack for the confirmation notification

### Test Daily Reminder
1. Open the `daily-reminders` workflow
2. Click **Test Workflow** (top right)
3. Verify the Slack message arrives in your channel

### Test Weekly Digest
1. Open the `weekly-digest` workflow
2. Click **Test Workflow**
3. Check your inbox for the HTML digest email

---

## Troubleshooting

| Issue | Solution |
|---|---|
| IMAP not triggering | Check App Password, ensure "Less secure app access" or App Passwords are used |
| Groq API error | Verify API key header format: `Bearer gsk_...` |
| Backend 401 | Ensure `N8N_API_KEY` matches `N8N_API_KEY` in Railway env vars |
| Slack not posting | Re-check webhook URL, ensure it hasn't been revoked |
| No user found for email | The sender must be a registered user in your Supabase Auth |
