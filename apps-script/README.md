# Tajweed Scholars Admissions Operations Phase 1

The production Apps Script source is `TrialLeads.gs`. It preserves the existing webhook contract and the first 20 Trial Leads columns, then appends operational notification columns non-destructively.

## Required Script Properties

In Apps Script, open **Project Settings → Script Properties** and add:

| Property | Recommended value |
| --- | --- |
| `SPREADSHEET_ID` | ID of the official CRM spreadsheet |
| `API_SECRET` | A long, randomly generated secret shared only with Vercel |
| `FOUNDER_EMAIL` | Founder admissions inbox |
| `REPLY_TO_EMAIL` | `tajweedscholar@gmail.com` |
| `WEBSITE_URL` | Official HTTPS website URL |
| `WHATSAPP_BUSINESS_NUMBER` | Official international number, including country code |
| `TRIAL_LEADS_SHEET_NAME` | `Trial Leads` |
| `ACTIVITY_LOG_SHEET_NAME` | `Lead Activity Log` |
| `MAX_NOTIFICATION_ATTEMPTS` | `3` |

Never place property values, deployment URLs, passwords, lead data, or API secrets in source control.

## One-time official-account setup

1. Sign in to the official Tajweed Scholars Google account.
2. In Google Drive, make a copy of the approved CRM spreadsheet and confirm that the first 20 `Trial Leads` columns remain unchanged.
3. Open **Extensions → Apps Script** from that copy.
4. Replace the editor source with `TrialLeads.gs` from this directory and save.
5. Add every Script Property listed above. Use the copied spreadsheet's ID for `SPREADSHEET_ID`.
6. Select and run `setupPhase1Admissions()` once.
7. Review and approve only the requested Spreadsheet, email, properties, locking, and trigger permissions.
8. Run `verifyPhase1AdmissionsSetup()`. Confirm the Trial Leads sheet, nine operational columns, activity log, and exactly one notification trigger are reported ready. The diagnostic contains no lead data or secrets.

`setupPhase1Admissions()` is idempotent. It appends missing operational headers, creates the activity sheet and headers if absent, and refreshes one five-minute `processNotificationQueue` trigger. It never deletes or moves existing business columns or rows.

## Deploy the Web App

1. Select **Deploy → New deployment → Web app**.
2. Set **Execute as** to **Me**.
3. Select the access level required for the Vercel server-to-server call (normally **Anyone** for the web endpoint; the shared `API_SECRET` remains mandatory).
4. Deploy, approve permissions, and copy the `/exec` Web App URL.
5. Locally, set `APPS_SCRIPT_WEB_APP_URL` to that URL and `APPS_SCRIPT_API_SECRET` to the same value as the `API_SECRET` Script Property.
6. Add or update the same two environment variables in the Vercel project, then redeploy the website. Do not rename either variable.

## Testing and operational verification

1. Use a designated test email and phone number to submit one real Free Trial request.
2. Confirm the website receives the existing successful response and lead ID.
3. Confirm one new row appears in `Trial Leads`, with founder and user statuses initially `Queued`.
4. Run `processNotificationQueue()` manually once, or wait for the five-minute trigger.
5. Confirm sent timestamps/statuses and processing duration update. If one email fails, confirm the lead remains saved and that notification becomes `Retrying` or `Failed`.
6. Check `Lead Activity Log` for safe lifecycle events without names, emails, phone numbers, notes, payloads, or secrets.
7. Check **Apps Script → Executions** for trigger runs and sanitized errors.
8. Run `verifyPhase1AdmissionsSetup()` again.

Automated repository tests do not call Google, write a Sheet, or send email.

## Rollback

1. In **Deploy → Manage deployments**, record the current Phase 1 deployment/version.
2. Repoint the Web App deployment to the previously approved script version, or reactivate the previous deployment URL.
3. Restore the previous `APPS_SCRIPT_WEB_APP_URL` in local/Vercel environments if its URL changed, then redeploy Vercel.
4. Do not delete operational columns, activity rows, trigger history, or lead data during rollback.
5. Disable only the `processNotificationQueue` trigger if the old version cannot use it.
6. Submit a designated test lead and verify the original response contract before reopening admissions.
