# Tajweed Scholars Admissions Operations Phase 1

The production Apps Script source is `TrialLeads.gs`. It preserves the existing webhook contract and first 20 Trial Leads columns, adds nine marketing-attribution columns after them, and retains the operational notification columns non-destructively.

## Required Script Properties

In Apps Script, open **Project Settings → Script Properties** and add:

| Property | Recommended value |
| --- | --- |
| `SPREADSHEET_ID` | ID of the official CRM spreadsheet |
| `API_SECRET` | A long, randomly generated secret shared only with Vercel |
| `FOUNDER_EMAIL` | `muneeb@tajweedscholars.com` |
| `REPLY_TO_EMAIL` | `admissions@tajweedscholars.com` |
| `WEBSITE_URL` | Official HTTPS website URL |
| `WHATSAPP_BUSINESS_NUMBER` | Official international number, including country code |
| `TRIAL_LEADS_SHEET_NAME` | `Trial Leads` |
| `ACTIVITY_LOG_SHEET_NAME` | `Lead Activity Log` |
| `MAX_NOTIFICATION_ATTEMPTS` | `3` |
| `BUSINESS_TIME_ZONE` | Optional; defaults to `Asia/Karachi` |
| `EMAIL_LOGO_URL` | Optional; `https://tajweedscholars.com/brand/logo-horizontal.png` |

Never place property values, deployment URLs, passwords, lead data, or API secrets in source control.

## One-time official-account setup

1. Sign in to the official Tajweed Scholars Google account.
2. In Google Drive, make a copy of the approved CRM spreadsheet and confirm that the first 20 `Trial Leads` columns remain unchanged.
3. Open **Extensions → Apps Script** from that copy.
4. Replace the editor source with `TrialLeads.gs` from this directory and save.
5. Add every Script Property listed above. Use the copied spreadsheet's ID for `SPREADSHEET_ID`.
6. Before enabling notifications, reconcile any production rows whose emails were already delivered but whose operational statuses still say `Queued` (see **Safe production reconciliation** below).
7. Select and run `migrateMarketingAttributionColumns()` once. Confirm it inserts the nine approved attribution headers after `Follow-up Due`; Sheets shifts the existing operational/display cells without rewriting historical row values.
8. Select and run `setupPhase1Admissions()` once.
9. Review and approve only the requested Spreadsheet, Gmail send/read-alias, properties, locking, and trigger permissions.
10. Run `verifyPhase1AdmissionsSetup()`. Confirm the Trial Leads sheet, attribution columns, nine operational columns, appended `Submitted At PKT` display column, activity log, and exactly one notification trigger are reported ready. The diagnostic contains no lead data or secrets.
11. Run `refreshAdmissionsReports()` to create or refresh `Admissions Action Queue`, `Marketing Performance`, and `Admissions Data Quality`. This reads `Trial Leads` in one batch and replaces only the three derived sheets.

`setupPhase1Admissions()` is idempotent. It appends missing operational headers and the `Submitted At PKT` display column, configures the spreadsheet business time zone, creates the activity sheet and headers if absent, and replaces notification triggers with exactly one one-minute `processPendingLeadNotifications` trigger. It does not process leads itself and never deletes or moves existing business columns or rows. Run `backfillSubmittedAtPktDisplay()` manually once to populate only blank PKT display cells from canonical UTC values.

## Safe production reconciliation

Do this before running either setup function after deploying the canonical queue code:

1. Disable and delete all existing `processPendingLeadNotifications` and `processNotificationQueue` triggers in **Apps Script -> Triggers**.
2. In Gmail, verify delivery of both messages for each affected Lead ID: the founder notification and the student acknowledgement. Do not infer delivery from the Sheet's current `Queued` value.
3. For each message that is verified delivered, set only its matching Sheet status to `Sent` and set its matching sent-at field to the verified Gmail delivery time in UTC ISO 8601 format. Leave an unverified side as `Queued`.
4. Set `Notification Retry Count` to `0` for fully reconciled rows. Leave `Notification Last Attempt At`, `Total Processing Time Ms`, `Last Error`, and `Last Error At` blank unless reliable historical values are available.
5. In **Project Settings -> Script Properties**, inspect `pending_notification_` entries. For a reconciled delivered side, make its `founderSent` or `submitterSent` boolean agree with the Sheet. Do not create new pending jobs for old rows. Fully delivered old jobs may be removed only after both Sheet statuses are `Sent`; retain partially delivered jobs so the canonical processor can send only the missing side.
6. Review the affected Lead IDs a second time, then run `setupPhase1Admissions()` to create the single canonical trigger.

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
3. Confirm one new row appears in `Trial Leads`, with internal admissions and user statuses initially `Queued`.
4. Run `processPendingLeadNotifications()` manually once, or wait for the one-minute trigger.
5. Confirm sent timestamps/statuses and processing duration update. If one email fails, confirm the lead remains saved and that notification becomes `Retrying` or `Failed`.
6. Check `Lead Activity Log` for safe lifecycle events without names, emails, phone numbers, notes, payloads, or secrets.
7. Check **Apps Script → Executions** for trigger runs and sanitized errors.
8. Run `verifyPhase1AdmissionsSetup()` again.

Automated repository tests do not call Google, write a Sheet, or send email.

## Admissions reports

`refreshAdmissionsReports()` is the recommended manual refresh. It safely reruns, resolves source columns by header name, reuses each derived sheet instead of creating duplicates, and never edits a source lead row. The three convenience functions `refreshAdmissionsActionQueue()`, `refreshMarketingPerformance()`, and `refreshAdmissionsDataQuality()` return the matching result; each performs the same full, consistent report refresh.

The action queue uses only the existing `Lead Status` and `Follow-up Due` fields, in this priority order: overdue, due today, due in the next three calendar days, `New`, then `Trial 1 Completed`/`Trial 2 Completed`/`Trial 3 Completed`. `Enrolled` and `Not Proceeding` are terminal. The current source does not contain separate Program, Trial Status, Last Contact Date, or approved No Response fields, so the queue does not infer them. `Main Goal` and `Age Group` are shown under their real names.

Marketing rows are grouped by stored UTM source, medium, and campaign. Blank report dimensions display as `Direct / Unknown`; the source sheet remains blank. Contacted means any recognized status after `New`. Trials booked includes `Trial 1 Booked` and later trial/enrollment states. Trials attended includes completed-trial and `Enrolled` states. Paid enrollment means `Enrolled`. Lead-to-trial is booked divided by total leads; trial-to-paid is enrolled divided by attended. Both return zero for a zero denominator. No revenue or ROI is calculated.

The data-quality sheet reports warnings only. It checks contact gaps, invalid/incomplete follow-up dates, unknown statuses, missing operational values, attribution lengths, paths, and first-touch timestamps. Duplicate submission IDs are checked if a `Submission ID` header exists. The current production schema does not store that ID in rows, so the report explicitly records that historical duplicate scanning is unavailable; webhook duplicate protection in Script Properties is unchanged.

## Optional daily founder summary

`previewDailyFounderAdmissionsSummary()` is the non-production/manual test: it returns aggregate summary data and a plain-text preview without sending email, writing Sheets, or exposing individual lead details. It covers the preceding 24 hours, current overdue/today counts, `Trial 1 Booked` count, completed-trial leads awaiting decision, new-lead source/campaign totals, and warning count.

To enable the founder-only email, manually run `setupDailyFounderSummaryTrigger()` once from the official Apps Script account. It removes duplicate summary triggers and creates one daily trigger at approximately 08:00 in the Apps Script project's configured time zone. It is deliberately not called by `setupPhase1Admissions()`. The sender uses the existing verified `REPLY_TO_EMAIL` alias, the recipient is only `FOUNDER_EMAIL`, and the daily date key prevents a second send for that business date. It never calls the prospect acknowledgement or WhatsApp functions.

Run `removeDailyFounderSummaryTrigger()` to disable the optional summary. Removing the trigger does not alter leads or reports. The setup and removal functions are safe to rerun.

## Permissions and safe testing

The executing official account must own or have edit access to the configured spreadsheet, permission to create the three derived sheets, permission to manage Apps Script triggers, and Gmail permission to send from the verified alias. For a non-production test, point `SPREADSHEET_ID` at an approved copy, run `refreshAdmissionsReports()`, inspect the three derived sheets, then run `previewDailyFounderAdmissionsSummary()`. Do not run `sendDailyFounderAdmissionsSummary()` in a test project unless its `FOUNDER_EMAIL` is an approved internal test recipient.

The website repository does not control Google Apps Script properties. Confirm
`FOUNDER_EMAIL` and `REPLY_TO_EMAIL` in the deployed Apps Script project's
**Project Settings → Script Properties** before publishing the revised script.
The founder address receives internal lead alerts; the Reply-To address is the
public admissions contact and must be a verified Gmail **Send mail as** alias in
the trigger owner's account. Both automated messages use that alias as `from`
and `replyTo`.

## Rollback

1. In **Deploy → Manage deployments**, record the current Phase 1 deployment/version.
2. Repoint the Web App deployment to the previously approved script version, or reactivate the previous deployment URL.
3. Restore the previous `APPS_SCRIPT_WEB_APP_URL` in local/Vercel environments if its URL changed, then redeploy Vercel.
4. Do not delete operational columns, activity rows, trigger history, or lead data during rollback.
5. Disable the `processPendingLeadNotifications` trigger if the old version cannot use it, and confirm no legacy `processNotificationQueue` trigger remains.
6. Submit a designated test lead and verify the original response contract before reopening admissions.
7. Run `removeDailyFounderSummaryTrigger()` before reverting if the prior script version does not contain the summary handler. The derived report sheets may be retained as snapshots or manually deleted after confirming they are not the source `Trial Leads` sheet; rollback never requires changing historical lead rows.
