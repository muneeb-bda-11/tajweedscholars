/**
 * Tajweed Scholars Trial Lead CRM webhook.
 *
 * Required Script Properties:
 * - SPREADSHEET_ID
 * - API_SECRET
 * - FOUNDER_EMAIL
 * - REPLY_TO_EMAIL
 *
 * Deployment:
 * - Web app
 * - Execute as: Me
 * - Access: Anyone
 */

var TRIAL_SHEET = "Trial Leads";
var ACTIVITY_SHEET_DEFAULT = "Lead Activity Log";

var TRIAL_HEADERS = [
  "Lead ID",
  "Submitted At UTC",
  "Lead Status",
  "Source",
  "Learner Type",
  "Age Group",
  "Main Goal",
  "Learner or Parent Name",
  "Guardian Name",
  "Country Code",
  "Country",
  "State / Province / Region",
  "Time Zone",
  "WhatsApp",
  "Email",
  "Preferred Days",
  "Preferred Time",
  "Notes",
  "Consent",
  "Follow-up Due"
];

var ATTRIBUTION_HEADERS = [
  "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "UTM Term",
  "Referrer Host", "Landing Path", "Submission Path", "First Touch At"
];

var OPERATIONAL_HEADERS = [
  "Founder Alert Status", "Founder Alert Sent At", "User Email Status",
  "User Email Sent At", "Notification Retry Count",
  "Notification Last Attempt At", "Total Processing Time Ms", "Last Error",
  "Last Error At"
];
var DISPLAY_HEADERS = ["Submitted At PKT"];
var ACTIVITY_HEADERS = [
  "Event ID", "Lead ID", "Event", "Status", "Timestamp UTC",
  "Duration Ms", "Attempt", "Error Code", "Error Message"
];
var NOTIFICATION_STATES = ["Queued", "Sent", "Failed", "Retrying", "Not applicable"];

var LEAD_STATUSES = [
  "New",
  "Contacted",
  "Trial 1 Booked",
  "Trial 1 Completed",
  "Trial 2 Completed",
  "Trial 3 Completed",
  "Enrolled",
  "Not Proceeding"
];
var ACTION_QUEUE_SHEET_DEFAULT = "Admissions Action Queue";
var MARKETING_PERFORMANCE_SHEET_DEFAULT = "Marketing Performance";
var DATA_QUALITY_SHEET_DEFAULT = "Admissions Data Quality";
var DAILY_SUMMARY_HANDLER = "sendDailyFounderAdmissionsSummary";
var REPORT_UNKNOWN = "Direct / Unknown";
var ACTION_QUEUE_HEADERS = ["Action Group", "Priority", "Original Row", "Lead ID", "Learner / Contact", "Parent / Guardian", "WhatsApp", "Email", "Country", "Main Goal", "Age Group", "Lead Status", "Follow-up Due", "Source", "UTM Source", "UTM Medium", "UTM Campaign"];
var MARKETING_PERFORMANCE_HEADERS = ["Source", "Medium", "Campaign", "Total Leads", "Contacted Leads", "Trials Booked", "Trials Attended", "Paid Enrollments", "Lead to Trial %", "Trial to Paid %"];
var DATA_QUALITY_HEADERS = ["Original Row", "Lead ID", "Field", "Warning"];

var ENUMS = {
  learnerType: ["child", "self"],
  ageGroup: ["4-6", "7-9", "10-12", "13-15", "16-17", "adult"],
  mainGoal: ["qaida", "quran-reading", "tajweed", "hifz", "unsure"],
  preferredDays: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ],
  preferredTime: ["morning", "afternoon", "evening"]
};

var PENDING_NOTIFICATION_PREFIX = "pending_notification_";
var NOTIFIED_PREFIX = "notified_";
var SUBMISSION_PREFIX = "submission_";
var NOTIFICATION_BATCH_SIZE = 10;
var EMAIL_LOGO_CACHE_ = null;
var EMAIL_LOGO_ATTEMPTED_ = false;

function doGet() {
  return json_(
    200,
    true,
    null,
    "Tajweed Scholars Trial Lead Webhook is running."
  );
}

function doPost(e) {
  try {
    console.log("doPost received a request.");

    var body = parseRequestBody_(e);
    var props = PropertiesService.getScriptProperties();

    var expectedSecret = requiredProperty_(props, "API_SECRET");
    if (!body.apiSecret || !secretsMatch_(String(body.apiSecret), expectedSecret)) {
      return json_(
        401,
        false,
        "UNAUTHORIZED",
        "The request could not be authorized."
      );
    }

    delete body.apiSecret;

    var normalized = normalizeTrialLead_(body);
    var errors = validateTrialLead_(normalized);

    if (Object.keys(errors).length > 0) {
      console.log("Validation failed for fields: " + Object.keys(errors).join(", "));
      return json_(
        400,
        false,
        "VALIDATION_ERROR",
        "Please correct the highlighted fields.",
        errors
      );
    }

    var hash = digest_(normalized.submissionId);
    var duplicateKey = SUBMISSION_PREFIX + hash;
    var leadId;
    var isNewLead = false;

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(2000)) {
      return json_(503, false, "TEMPORARILY_BUSY", "The request is busy. Please try again.");
    }

    try {
      var spreadsheet = SpreadsheetApp.openById(
        requiredProperty_(props, "SPREADSHEET_ID")
      );

      var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
      if (!sheet) {
        throw new Error("The existing Trial Leads sheet was not found.");
      }

      var existingLeadId = props.getProperty(duplicateKey);

      if (existingLeadId) {
        leadId = existingLeadId;
      } else {
        leadId = createLeadId_();
        var submittedAtUtc = new Date().toISOString();

        sheet.getRange(
          sheet.getLastRow() + 1,
          1,
          1,
          TRIAL_HEADERS.length + ATTRIBUTION_HEADERS.length + OPERATIONAL_HEADERS.length + DISPLAY_HEADERS.length
        ).setValues([rowFor_(leadId, normalized, submittedAtUtc)]);
        queueLeadNotification_(props, hash, leadId, normalized, submittedAtUtc);
        props.setProperty(duplicateKey, leadId);
        isNewLead = true;
        console.log("Lead row saved: " + leadId);
      }
    } finally {
      lock.releaseLock();
    }

    if (isNewLead) console.log("Notifications queued for lead: " + leadId);

    return json_(
      200,
      true,
      null,
      "Your trial request has been received.",
      null,
      leadId
    );
  } catch (error) {
    console.error("Trial lead submission failed: " + safeErrorName_(error));

    return json_(
      500,
      false,
      "SUBMISSION_FAILED",
      "The request could not be saved safely. Please try again."
    );
  }
}

function queueLeadNotification_(
  props,
  hash,
  leadId,
  lead,
  submittedAtUtc
) {
  var notifiedKey = NOTIFIED_PREFIX + hash;
  var pendingKey = PENDING_NOTIFICATION_PREFIX + hash;

  if (props.getProperty(notifiedKey) || props.getProperty(pendingKey)) {
    return;
  }

  var job = {
    hash: hash,
    leadId: leadId,
    submittedAtUtc: submittedAtUtc,
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/" + requiredProperty_(props, "SPREADSHEET_ID"),
    learnerType: lead.learnerType,
    ageGroup: lead.ageGroup,
    mainGoal: lead.mainGoal,
    contactName: lead.contactName,
    guardianName: lead.guardianName,
    whatsapp: lead.whatsapp,
    email: lead.email,
    countryCode: lead.countryCode,
    countryName: lead.countryName,
    region: lead.region,
    timeZone: lead.timeZone,
    preferredDays: lead.preferredDays,
    preferredTime: lead.preferredTime,
    attribution: lead.attribution,
    founderSent: false,
    submitterSent: false,
    createdAtUtc: new Date().toISOString()
  };

  props.setProperty(pendingKey, JSON.stringify(job));
}

function processPendingLeadNotifications() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return { skipped: true, reason: "LOCKED" };
  try {
    return processPendingLeadNotificationsUnlocked_();
  } finally {
    lock.releaseLock();
  }
}

function processPendingLeadNotificationsUnlocked_() {
  var props = PropertiesService.getScriptProperties();
  var allProperties = props.getProperties();

  var pendingKeys = Object.keys(allProperties)
    .filter(function (key) {
      return key.indexOf(PENDING_NOTIFICATION_PREFIX) === 0;
    })
    .sort()
    .slice(0, NOTIFICATION_BATCH_SIZE);

  if (!pendingKeys.length) {
    console.log("No pending lead notifications.");
    return { processed: 0 };
  }

  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  var map = canonicalNotificationHeaderMap_(sheet);
  var lastRow = sheet.getLastRow();
  var rows = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues()
    : [];
  var rowsByLeadId = {};
  rows.forEach(function (row, index) {
    var leadId = String(row[map["Lead ID"]] || "");
    if (leadId) rowsByLeadId[leadId] = { row: row, rowNumber: index + 2 };
  });
  var processed = 0;
  var maxAttempts = maxNotificationAttempts_(props);

  pendingKeys.forEach(function (pendingKey) {
    var job;

    try {
      job = JSON.parse(props.getProperty(pendingKey) || "{}");
    } catch (parseError) {
      console.error("Invalid notification job. Queue key retained.");
      return;
    }

    if (!job.leadId || !job.hash) {
      console.error("Incomplete notification job. Queue key retained.");
      return;
    }
    var match = rowsByLeadId[job.leadId];
    if (!match) throw new Error("PENDING_NOTIFICATION_LEAD_NOT_FOUND: " + job.leadId);
    if (!job.submittedAtUtc) {
      job.submittedAtUtc = utcIsoTimestamp_(match.row[map["Submitted At UTC"]]);
      props.setProperty(pendingKey, JSON.stringify(job));
    }

    var existingAttempts = Number(match.row[map["Notification Retry Count"]] || 0);
    var founderAlreadySent = String(match.row[map["Founder Alert Status"]]) === "Sent" || job.founderSent === true;
    var userAlreadySent = String(match.row[map["User Email Status"]]) === "Sent" || job.submitterSent === true;
    if (existingAttempts >= maxAttempts && !(founderAlreadySent && userAlreadySent)) {
      console.error("Notification retry limit reached for lead: " + job.leadId);
      return;
    }

    var result = processNotificationJob_(job, match.row, map, props, pendingKey, maxAttempts);
    writeOperationalFields_(sheet, match.rowNumber, map, result.operationalValues);
    processed += 1;

    if (result.complete) {
      props.deleteProperty(pendingKey);
      props.setProperty(NOTIFIED_PREFIX + job.hash, "yes");
      console.log("Notifications completed for lead: " + job.leadId);
    }
  });

  return { processed: processed };
}

function processNotificationJob_(job, row, map, props, pendingKey, maxAttempts) {
  var started = Date.now();
  var attemptedAt = new Date().toISOString();
  var attempt = Number(row[map["Notification Retry Count"]] || 0) + 1;
  var founderStatus = String(row[map["Founder Alert Status"]] || "Queued");
  var userStatus = String(row[map["User Email Status"]] || "Queued");
  var founderSentAt = row[map["Founder Alert Sent At"]] || "";
  var userSentAt = row[map["User Email Sent At"]] || "";
  var founderSent = founderStatus === "Sent" || job.founderSent === true;
  var submitterSent = userStatus === "Sent" || job.submitterSent === true;
  var errors = [];

  if (!founderSent && attempt <= maxAttempts) {
    try {
      sendFounderLeadEmail_(job, props);
      founderSent = job.founderSent = true;
      founderStatus = "Sent";
      founderSentAt = new Date().toISOString();
      props.setProperty(pendingKey, JSON.stringify(job));
    } catch (error) {
      founderStatus = attempt >= maxAttempts ? "Failed" : "Retrying";
      errors.push("Founder email: " + safeErrorMessage_(error));
    }
  }

  if (!submitterSent && attempt <= maxAttempts) {
    try {
      sendSubmitterAcknowledgement_(job, props);
      submitterSent = job.submitterSent = true;
      userStatus = "Sent";
      userSentAt = new Date().toISOString();
      props.setProperty(pendingKey, JSON.stringify(job));
    } catch (error) {
      userStatus = attempt >= maxAttempts ? "Failed" : "Retrying";
      errors.push("User email: " + safeErrorMessage_(error));
    }
  }

  job.founderSent = founderSent;
  job.submitterSent = submitterSent;
  props.setProperty(pendingKey, JSON.stringify(job));
  var complete = founderSent && submitterSent;
  var previousDuration = Number(row[map["Total Processing Time Ms"]] || 0);
  return {
    complete: complete,
    operationalValues: [
      founderSent ? "Sent" : founderStatus,
      founderSentAt,
      submitterSent ? "Sent" : userStatus,
      userSentAt,
      attempt,
      attemptedAt,
      previousDuration + Math.max(Date.now() - started, 0),
      complete ? "" : errors.join("; "),
      complete ? "" : new Date().toISOString()
    ]
  };
}

function canonicalNotificationHeaderMap_(sheet) {
  var expected = TRIAL_HEADERS.concat(ATTRIBUTION_HEADERS, OPERATIONAL_HEADERS);
  if (sheet.getLastColumn() < expected.length) throw new Error("TRIAL_LEADS_OPERATIONAL_HEADERS_MISSING");
  var headers = sheet.getRange(1, 1, 1, expected.length).getDisplayValues()[0];
  if (headers.join("|") !== expected.join("|")) {
    throw new Error("TRIAL_LEADS_HEADERS_MISMATCH: expected canonical Trial Leads and operational columns");
  }
  return headerMap_(headers);
}

function writeOperationalFields_(sheet, rowNumber, map, values) {
  if (values.length !== OPERATIONAL_HEADERS.length) throw new Error("OPERATIONAL_VALUES_WIDTH_MISMATCH");
  sheet.getRange(rowNumber, map[OPERATIONAL_HEADERS[0]] + 1, 1, OPERATIONAL_HEADERS.length).setValues([values]);
}

function setupLeadNotificationTrigger() {
  var triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "processPendingLeadNotifications" ||
        trigger.getHandlerFunction() === "processNotificationQueue") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("processPendingLeadNotifications")
    .timeBased()
    .everyMinutes(1)
    .create();

  console.log("Lead notification trigger configured.");
}

function checkCRMConfiguration() {
  var props = PropertiesService.getScriptProperties();

  var spreadsheetId = props.getProperty("SPREADSHEET_ID");
  var apiSecret = props.getProperty("API_SECRET");
  var founderEmail = props.getProperty("FOUNDER_EMAIL");
  var replyToEmail = props.getProperty("REPLY_TO_EMAIL");
  var logoUrl = props.getProperty("EMAIL_LOGO_URL");

  console.log("Spreadsheet configured: " + Boolean(spreadsheetId));
  console.log("API secret configured: " + Boolean(apiSecret));
  console.log("Founder email configured: " + Boolean(founderEmail));
  console.log("Reply-To email configured: " + Boolean(replyToEmail));
  var aliases = GmailApp.getAliases();
  var matchingAlias = replyToEmail
    ? aliases.filter(function (alias) {
        return String(alias).toLowerCase() === String(replyToEmail).toLowerCase();
      })[0] || ""
    : "";
  console.log("Gmail sender alias available: " + Boolean(matchingAlias));
  console.log("Available Gmail sender aliases: " + (aliases.length ? aliases.join(", ") : "(none)"));
  console.log("Business time zone: " + businessTimeZone_(props));
  console.log("Email logo URL configured: " + Boolean(logoUrl));
  console.log("Email logo URL reachable: " + Boolean(emailLogoBlob_(props)));
  console.log("Remaining daily email quota: " + MailApp.getRemainingDailyQuota());

  if (spreadsheetId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
    console.log("Spreadsheet time zone: " + spreadsheet.getSpreadsheetTimeZone());

    console.log("Trial Leads sheet found: " + Boolean(sheet));

    if (sheet) {
      assertHeaders_(sheet);
      canonicalNotificationHeaderMap_(sheet);
      console.log("Headers valid: true");
      var allHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      console.log("Submitted At PKT display column ready: " + (allHeaders.indexOf(DISPLAY_HEADERS[0]) === TRIAL_HEADERS.length + ATTRIBUTION_HEADERS.length + OPERATIONAL_HEADERS.length));
    }
  }
}

function migrateTrialLeadsSheet() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(
    requiredProperty_(props, "SPREADSHEET_ID")
  );

  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) {
    throw new Error(
      "The existing Trial Leads sheet was not found; migration will not create one."
    );
  }

  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var lastRow = Math.max(sheet.getLastRow(), 1);

  var oldHeaders = sheet
    .getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0];

  var aliases = {
    "Lead ID": ["Lead ID"],
    "Submitted At UTC": ["Submitted At UTC", "Submitted At", "Timestamp"],
    "Lead Status": ["Lead Status", "Status"],
    "Source": ["Source"],
    "Learner Type": ["Learner Type"],
    "Age Group": ["Age Group"],
    "Main Goal": ["Main Goal"],
    "Learner or Parent Name": [
      "Learner or Parent Name",
      "Contact Name",
      "Name"
    ],
    "Guardian Name": ["Guardian Name", "Parent/Guardian Name"],
    "Country Code": ["Country Code"],
    "Country": ["Country", "Country Name"],
    "State / Province / Region": [
      "State / Province / Region",
      "Region",
      "State",
      "Province"
    ],
    "Time Zone": ["Time Zone", "Timezone"],
    "WhatsApp": ["WhatsApp", "WhatsApp Number", "Phone"],
    "Email": ["Email"],
    "Preferred Days": ["Preferred Days"],
    "Preferred Time": ["Preferred Time"],
    "Notes": ["Notes", "Note"],
    "Consent": ["Consent"],
    "Follow-up Due": ["Follow-up Due", "Follow Up Due"]
  };

  var data =
    lastRow > 1
      ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues()
      : [];

  var usedIndexes = {};
  var unmapped = [];

  var indexes = TRIAL_HEADERS.map(function (targetHeader) {
    var foundIndex = -1;

    aliases[targetHeader].some(function (candidate) {
      var index = oldHeaders.indexOf(candidate);

      if (index >= 0) {
        foundIndex = index;
        usedIndexes[index] = true;
        return true;
      }

      return false;
    });

    return foundIndex;
  });

  oldHeaders.forEach(function (header, index) {
    if (header && !usedIndexes[index]) {
      unmapped.push(header);
    }
  });

  var migrated = data.map(function (oldRow) {
    return indexes.map(function (oldIndex, newColumnIndex) {
      if (oldIndex >= 0) {
        return oldRow[oldIndex];
      }

      if (TRIAL_HEADERS[newColumnIndex] === "Lead Status") {
        return "New";
      }

      if (TRIAL_HEADERS[newColumnIndex] === "Source") {
        return "Website / Free Trial Form";
      }

      return "";
    });
  });

  var existingFilter = sheet.getFilter();
  if (existingFilter) {
    existingFilter.remove();
  }

  sheet
    .getRange(
      1,
      1,
      Math.max(lastRow, 2),
      Math.max(lastColumn, TRIAL_HEADERS.length)
    )
    .clearContent();

  sheet
    .getRange(1, 1, 1, TRIAL_HEADERS.length)
    .setValues([TRIAL_HEADERS])
    .setBackground("#277F68")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  if (migrated.length) {
    sheet
      .getRange(2, 1, migrated.length, TRIAL_HEADERS.length)
      .setValues(migrated);
  }

  sheet.setFrozenRows(1);

  var statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(LEAD_STATUSES, true)
    .setAllowInvalid(false)
    .build();

  if (sheet.getMaxRows() > 1) {
    sheet
      .getRange(2, 3, sheet.getMaxRows() - 1, 1)
      .setDataValidation(statusValidation);
  }

  sheet
    .getRange(1, 1, sheet.getMaxRows(), TRIAL_HEADERS.length)
    .createFilter();

  sheet
    .getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), TRIAL_HEADERS.length)
    .setWrap(true)
    .setVerticalAlignment("middle");

  SpreadsheetApp.flush();

  var report =
    "Migrated " +
    migrated.length +
    " existing row(s). Unmapped old columns: " +
    (unmapped.length ? unmapped.join(", ") : "none");

  console.log(report);
  return report;
}

function migrateMarketingAttributionColumns() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var existing = ATTRIBUTION_HEADERS.map(function (header) { return headers.indexOf(header); });
  if (existing.every(function (index, offset) { return index === TRIAL_HEADERS.length + offset; })) return "Marketing attribution columns already ready.";
  if (existing.some(function (index) { return index >= 0; })) throw new Error("ATTRIBUTION_HEADERS_PARTIALLY_PRESENT");
  var core = headers.slice(0, TRIAL_HEADERS.length);
  if (core.join("|") !== TRIAL_HEADERS.join("|")) throw new Error("TRIAL_LEADS_HEADERS_MISMATCH");
  sheet.insertColumnsAfter(TRIAL_HEADERS.length, ATTRIBUTION_HEADERS.length);
  sheet.getRange(1, TRIAL_HEADERS.length + 1, 1, ATTRIBUTION_HEADERS.length).setValues([ATTRIBUTION_HEADERS]).setBackground("#277F68").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  SpreadsheetApp.flush();
  return "Added " + ATTRIBUTION_HEADERS.length + " marketing attribution columns without changing historical rows.";
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("EMPTY_REQUEST");
  }

  if (Number(e.contentLength || e.postData.length || 0) > 20480) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("INVALID_JSON");
  }
}

function normalizeTrialLead_(body) {
  var learnerTypeMap = {
    child: "child",
    self: "self",
    "My child": "child",
    Myself: "self"
  };

  var ageGroupMap = {
    "4-6": "4-6",
    "4–6": "4-6",
    "7-9": "7-9",
    "7–9": "7-9",
    "10-12": "10-12",
    "10–12": "10-12",
    "13-15": "13-15",
    "13–15": "13-15",
    "16-17": "16-17",
    "16–17": "16-17",
    adult: "adult",
    Adult: "adult"
  };

  var mainGoalMap = {
    qaida: "qaida",
    "Learn Qaida": "qaida",
    "quran-reading": "quran-reading",
    "Improve Quran reading": "quran-reading",
    tajweed: "tajweed",
    "Tajweed correction": "tajweed",
    hifz: "hifz",
    Hifz: "hifz",
    unsure: "unsure",
    "Not sure yet": "unsure"
  };

  var dayMap = {
    monday: "monday",
    Monday: "monday",
    tuesday: "tuesday",
    Tuesday: "tuesday",
    wednesday: "wednesday",
    Wednesday: "wednesday",
    thursday: "thursday",
    Thursday: "thursday",
    friday: "friday",
    Friday: "friday",
    saturday: "saturday",
    Saturday: "saturday",
    sunday: "sunday",
    Sunday: "sunday"
  };

  var preferredTimeMap = {
    morning: "morning",
    Morning: "morning",
    afternoon: "afternoon",
    Afternoon: "afternoon",
    evening: "evening",
    Evening: "evening"
  };

  var preferredDays = Array.isArray(body.preferredDays)
    ? body.preferredDays.map(function (day) {
        return dayMap[day] || day;
      })
    : body.preferredDays;

  var attributionInput = body.attribution;
  var attributionInvalid = attributionInput !== undefined && (!attributionInput || typeof attributionInput !== "object" || Array.isArray(attributionInput));
  var attribution = {};
  var attributionLimits = { utm_source: 100, utm_medium: 100, utm_campaign: 160, utm_content: 160, utm_term: 160, referrer_host: 253, landing_path: 300, submission_path: 300, first_touch_at: 30 };
  if (!attributionInvalid && attributionInput) Object.keys(attributionLimits).forEach(function (field) {
    if (attributionInput[field] === undefined) return;
    if (typeof attributionInput[field] !== "string") { attributionInvalid = true; return; }
    attribution[field] = cleanText_(attributionInput[field], attributionLimits[field]);
  });

  return {
    learnerType: learnerTypeMap[body.learnerType] || body.learnerType,
    ageGroup: ageGroupMap[body.ageGroup] || body.ageGroup,
    mainGoal: mainGoalMap[body.mainGoal] || body.mainGoal,
    contactName: cleanText_(body.contactName, 120),
    guardianName: cleanText_(body.guardianName, 120),
    countryCode: cleanText_(body.countryCode, 2).toUpperCase(),
    countryName: cleanText_(body.countryName || body.country, 100),
    region: cleanText_(body.region, 100),
    timeZone: cleanText_(body.timeZone, 100),
    whatsapp: cleanText_(body.whatsapp, 30),
    email: cleanText_(body.email, 254).toLowerCase(),
    preferredDays: preferredDays,
    preferredTime:
      preferredTimeMap[body.preferredTime] || body.preferredTime,
    notes: cleanText_(body.notes, 1000),
    consent: body.consent === true,
    submissionId: cleanText_(body.submissionId, 100),
    honeypot:
      typeof body.honeypot === "string" ? body.honeypot.trim() : "",
    formStartedAt: Number(body.formStartedAt),
    attribution: attribution,
    attributionInvalid: attributionInvalid
  };
}

function validateTrialLead_(lead) {
  var errors = {};
  if (lead.attributionInvalid) errors.attribution = "Invalid attribution data.";
  var attribution = lead.attribution || {};
  if (attribution.referrer_host && (!/^[a-z0-9.-]+$/i.test(attribution.referrer_host) || /[\/:?#]/.test(attribution.referrer_host))) errors.attribution = "Invalid attribution data.";
  ["landing_path", "submission_path"].forEach(function (field) { if (attribution[field] && (attribution[field].charAt(0) !== "/" || attribution[field].indexOf("//") === 0 || /[?#]/.test(attribution[field]))) errors.attribution = "Invalid attribution data."; });
  if (attribution.first_touch_at && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(attribution.first_touch_at) || isNaN(new Date(attribution.first_touch_at).getTime()))) errors.attribution = "Invalid attribution data.";

  if (ENUMS.learnerType.indexOf(lead.learnerType) < 0) {
    errors.learnerType = "Choose a valid learner type.";
  }

  if (ENUMS.ageGroup.indexOf(lead.ageGroup) < 0) {
    errors.ageGroup = "Choose a valid age group.";
  }

  if (ENUMS.mainGoal.indexOf(lead.mainGoal) < 0) {
    errors.mainGoal = "Choose a valid main goal.";
  }

  if (!lead.contactName) {
    errors.contactName = "Enter the parent or learner name.";
  }

  if (lead.ageGroup !== "adult" && !lead.guardianName) {
    errors.guardianName =
      "Enter the parent or guardian name for a learner under 18.";
  }

  if (!/^[A-Z]{2}$/.test(lead.countryCode)) {
    errors.countryCode = "Choose a valid country.";
  }

  if (!lead.countryName) {
    errors.countryName = "Choose a country.";
  }

  if (!validTimeZone_(lead.timeZone)) {
    errors.timeZone = "Choose a valid time zone.";
  }

  if (!/^\+[1-9]\d{6,14}$/.test(lead.whatsapp)) {
    errors.whatsapp = "Enter a valid international WhatsApp number.";
  }

  if (!isValidEmail_(lead.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (
    !Array.isArray(lead.preferredDays) ||
    lead.preferredDays.length < 1 ||
    lead.preferredDays.length > 7 ||
    lead.preferredDays.some(function (day) {
      return ENUMS.preferredDays.indexOf(day) < 0;
    })
  ) {
    errors.preferredDays = "Choose valid preferred days.";
  }

  if (ENUMS.preferredTime.indexOf(lead.preferredTime) < 0) {
    errors.preferredTime = "Choose a valid preferred time.";
  }

  if (lead.consent !== true) {
    errors.consent = "Consent is required.";
  }

  if (!isValidUuid_(lead.submissionId)) {
    errors.submissionId = "Invalid submission identifier.";
  }

  if (lead.honeypot !== "") {
    errors.honeypot = "Invalid submission.";
  }

  if (
    !Number.isFinite(lead.formStartedAt) ||
    lead.formStartedAt <= 0 ||
    lead.formStartedAt > Date.now() ||
    Date.now() - lead.formStartedAt < 2500
  ) {
    errors.formStartedAt = "Invalid form start time.";
  }

  return errors;
}

function rowFor_(leadId, lead, submittedAtUtc) {
  var ageGroup = canonicalAgeGroup_(lead.ageGroup);
  var view = presentationValues_(lead);
  var attribution = lead.attribution || {};
  return [
    leadId,
    submittedAtUtc || new Date().toISOString(),
    "New",
    "Website / Free Trial Form",
    safe_(lead.learnerType),
    ageGroup,
    safe_(lead.mainGoal),
    safe_(lead.contactName),
    view.guardian,
    safe_(lead.countryCode),
    safe_(lead.countryName),
    view.region,
    safe_(lead.timeZone),
    safe_(lead.whatsapp),
    safe_(lead.email),
    safe_(lead.preferredDays.join(", ")),
    safe_(lead.preferredTime),
    view.notes,
    "Yes",
    "",
    safe_(attribution.utm_source || ""),
    safe_(attribution.utm_medium || ""),
    safe_(attribution.utm_campaign || ""),
    safe_(attribution.utm_content || ""),
    safe_(attribution.utm_term || ""),
    safe_(attribution.referrer_host || ""),
    safe_(attribution.landing_path || ""),
    safe_(attribution.submission_path || ""),
    safe_(attribution.first_touch_at || ""),
    "Queued", "", "Queued", "", 0, "", "", "", "",
    new Date(submittedAtUtc || new Date().toISOString())
  ];
}

function setupPhase1Admissions() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  assertHeaders_(sheet);
  ensureOperationalHeaders_(sheet);
  ensureSubmittedAtPktDisplay_(spreadsheet, sheet, props);
  ensureAgeGroupPlainText_(sheet);
  ensureActivitySheet_(spreadsheet, props);
  setupLeadNotificationTrigger();
  SpreadsheetApp.flush();
  return verifyPhase1AdmissionsSetup();
}

function setupTrialLeadSystem() {
  var props = PropertiesService.getScriptProperties();
  requiredProperty_(props, "API_SECRET");
  var spreadsheetId = requiredProperty_(props, "SPREADSHEET_ID");
  requiredProperty_(props, "FOUNDER_EMAIL");
  requiredProperty_(props, "REPLY_TO_EMAIL");
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  assertHeaders_(sheet);
  ensureOperationalHeaders_(sheet);
  ensureSubmittedAtPktDisplay_(spreadsheet, sheet, props);
  ensureAgeGroupPlainText_(sheet);
  ensureActivitySheet_(spreadsheet, props);
  setupLeadNotificationTrigger();
  SpreadsheetApp.flush();
  return { ready: true, notificationHandler: "processPendingLeadNotifications" };
}

function verifyPhase1AdmissionsSetup() {
  var props = PropertiesService.getScriptProperties();
  var result = { ageGroupColumnFound: false, ageGroupPlainTextFormatReady: false, attributionColumnsReady: false, operationalColumnsReady: false, submittedAtPktReady: false, activityLogReady: false, notificationTriggerReady: false };
  var spreadsheetId = props.getProperty("SPREADSHEET_ID");
  if (spreadsheetId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
    if (sheet) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      var ageIndex = headers.indexOf("Age Group");
      result.ageGroupColumnFound = ageIndex >= 0;
      result.attributionColumnsReady = ATTRIBUTION_HEADERS.every(function (header, offset) { return headers.indexOf(header) === TRIAL_HEADERS.length + offset; });
      result.operationalColumnsReady = OPERATIONAL_HEADERS.every(function (header) { return headers.indexOf(header) >= 0; });
      result.submittedAtPktReady = headers.indexOf(DISPLAY_HEADERS[0]) === TRIAL_HEADERS.length + ATTRIBUTION_HEADERS.length + OPERATIONAL_HEADERS.length;
      if (ageIndex >= 0 && sheet.getMaxRows() > 1) result.ageGroupPlainTextFormatReady = sheet.getRange(2, ageIndex + 1, sheet.getMaxRows() - 1, 1).getNumberFormats().every(function (row) { return row[0] === "@"; });
    }
    result.activityLogReady = Boolean(spreadsheet.getSheetByName(props.getProperty("ACTIVITY_LOG_SHEET_NAME") || ACTIVITY_SHEET_DEFAULT));
  }
  var notificationTriggers = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === "processPendingLeadNotifications" ||
      trigger.getHandlerFunction() === "processNotificationQueue";
  });
  result.notificationTriggerReady = notificationTriggers.length === 1 &&
    notificationTriggers[0].getHandlerFunction() === "processPendingLeadNotifications";
  return result;
}

function canonicalAgeGroup_(value) {
  var ageGroup = String(value == null ? "" : value);
  if (ENUMS.ageGroup.indexOf(ageGroup) < 0) throw new Error("INVALID_AGE_GROUP");
  return ageGroup;
}

function ensureAgeGroupPlainText_(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var ageIndex = headers.indexOf("Age Group");
  if (ageIndex < 0) throw new Error("AGE_GROUP_COLUMN_NOT_FOUND");
  if (sheet.getMaxRows() > 1) sheet.getRange(2, ageIndex + 1, sheet.getMaxRows() - 1, 1).setNumberFormat("@");
  return ageIndex;
}

function repairedAgeGroup_(value, displayValue) {
  if (typeof value === "string" && ENUMS.ageGroup.indexOf(value) >= 0) return value;
  var date = value instanceof Date && !isNaN(value.getTime()) ? value : null;
  if (!date && typeof value === "number" && isFinite(value)) date = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000);
  if (!date && typeof displayValue === "string") {
    var match = displayValue.match(/^(4[\/-]6|7[\/-]9|10[\/-]12)(?:[\/-]\d{2,4})?$/);
    if (match) return match[1].replace(/\//g, "-");
  }
  if (!date) return null;
  var key = (date.getMonth() + 1) + "-" + date.getDate();
  return ["4-6", "7-9", "10-12"].indexOf(key) >= 0 ? key : null;
}

function repairPhase1AdmissionsDisplayData() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  assertHeaders_(sheet);
  var backupName = trialSheetName_(props) + " - Pre Display Repair";
  if (!spreadsheet.getSheetByName(backupName)) sheet.copyTo(spreadsheet).setName(backupName);
  var ageIndex = ensureAgeGroupPlainText_(sheet);
  var summary = { rowsChecked: 0, ageGroupsRepaired: 0, optionalDisplayValuesUpdated: 0, rowsSkipped: 0 };
  var rowCount = Math.max(sheet.getLastRow() - 1, 0);
  if (!rowCount) return summary;
  var range = sheet.getRange(2, ageIndex + 1, rowCount, 1);
  var values = range.getValues(), displayValues = range.getDisplayValues();
  values.forEach(function (row, index) {
    summary.rowsChecked += 1;
    var original = row[0], repaired = repairedAgeGroup_(original, displayValues[index][0]);
    if (repaired && String(original) !== repaired) { sheet.getRange(index + 2, ageIndex + 1).setValue(repaired); summary.ageGroupsRepaired += 1; }
    else if (!repaired && ENUMS.ageGroup.indexOf(String(original)) < 0) summary.rowsSkipped += 1;
  });
  SpreadsheetApp.flush();
  return summary;
}

function notificationStatusEligible_(status) { return ["Queued", "Retrying", "Failed"].indexOf(status) >= 0; }
function notificationEligible_(founderStatus, userStatus, attempts, maxAttempts) { return attempts < maxAttempts && (notificationStatusEligible_(founderStatus) || notificationStatusEligible_(userStatus)); }
function retryExhausted_(attempts, maxAttempts) { return attempts >= maxAttempts; }
function maxNotificationAttempts_(props) { var value = Number(props.getProperty("MAX_NOTIFICATION_ATTEMPTS") || 3); return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3; }
function trialSheetName_(props) { return props.getProperty("TRIAL_LEADS_SHEET_NAME") || TRIAL_SHEET; }
function updateCell_(sheet, row, map, header, value) { sheet.getRange(row, map[header] + 1).setValue(value); }

function leadFromRow_(row, map) {
  var storedAge = row[map["Age Group"]];
  return { leadId: String(row[map["Lead ID"]] || ""), receivedAt: row[map["Submitted At UTC"]], learnerType: String(row[map["Learner Type"]] || ""), ageGroup: repairedAgeGroup_(storedAge, "") || String(storedAge || ""), mainGoal: String(row[map["Main Goal"]] || ""), contactName: String(row[map["Learner or Parent Name"]] || ""), guardianName: String(row[map["Guardian Name"]] || ""), countryCode: String(row[map["Country Code"]] || ""), countryName: String(row[map["Country"]] || ""), region: String(row[map["State / Province / Region"]] || ""), timeZone: String(row[map["Time Zone"]] || ""), whatsapp: String(row[map["WhatsApp"]] || ""), email: String(row[map["Email"]] || ""), preferredDays: String(row[map["Preferred Days"]] || "").split(/,\s*/).filter(Boolean), preferredTime: String(row[map["Preferred Time"]] || ""), notes: String(row[map["Notes"]] || ""), attribution: { utm_source: String(row[map["UTM Source"]] || ""), utm_medium: String(row[map["UTM Medium"]] || ""), utm_campaign: String(row[map["UTM Campaign"]] || ""), utm_content: String(row[map["UTM Content"]] || ""), utm_term: String(row[map["UTM Term"]] || ""), referrer_host: String(row[map["Referrer Host"]] || ""), landing_path: String(row[map["Landing Path"]] || ""), submission_path: String(row[map["Submission Path"]] || ""), first_touch_at: String(row[map["First Touch At"]] || "") }, spreadsheetUrl: "https://docs.google.com/spreadsheets/d/" + requiredProperty_(PropertiesService.getScriptProperties(), "SPREADSHEET_ID") };
}

function logActivity_(spreadsheet, props, leadId, event, status, duration, attempt, errorCode, errorMessage) {
  ensureActivitySheet_(spreadsheet, props).appendRow([Utilities.getUuid(), leadId, event, status, new Date().toISOString(), Number(duration || 0), Number(attempt || 0), String(errorCode || ""), String(errorMessage || "").slice(0, 160)]);
}

function assertHeaders_(sheet) {
  var expected = TRIAL_HEADERS.concat(ATTRIBUTION_HEADERS);
  var actual = sheet
    .getRange(1, 1, 1, expected.length)
    .getDisplayValues()[0];

  if (actual.join("|") !== expected.join("|")) {
    throw new Error(
      "Trial Leads headers do not match. Run migrateMarketingAttributionColumns first."
    );
  }
}

function ensureOperationalHeaders_(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), TRIAL_HEADERS.length + ATTRIBUTION_HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  OPERATIONAL_HEADERS.forEach(function (header) {
    if (headers.indexOf(header) < 0) {
      sheet.getRange(1, headers.length + 1).setValue(header);
      headers.push(header);
    }
  });
  return headerMap_(headers);
}

function ensureSubmittedAtPktDisplay_(spreadsheet, sheet, props) {
  var expectedColumn = TRIAL_HEADERS.length + ATTRIBUTION_HEADERS.length + OPERATIONAL_HEADERS.length + 1;
  var lastColumn = Math.max(sheet.getLastColumn(), expectedColumn - 1);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  var existingIndex = headers.indexOf(DISPLAY_HEADERS[0]);
  if (existingIndex < 0) {
    sheet.getRange(1, expectedColumn).setValue(DISPLAY_HEADERS[0]);
  } else if (existingIndex + 1 !== expectedColumn) {
    throw new Error("SUBMITTED_AT_PKT_COLUMN_POSITION_INVALID");
  }
  spreadsheet.setSpreadsheetTimeZone(businessTimeZone_(props));
  if (sheet.getMaxRows() > 1) {
    sheet.getRange(2, expectedColumn, sheet.getMaxRows() - 1, 1).setNumberFormat("dd mmm yyyy, hh:mm AM/PM");
  }
  return expectedColumn;
}

function backfillSubmittedAtPktDisplay() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  assertHeaders_(sheet);
  ensureOperationalHeaders_(sheet);
  var pktColumn = ensureSubmittedAtPktDisplay_(spreadsheet, sheet, props);
  var result = { updated: 0, skipped: 0, invalid: 0 };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return result;
  var utcValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  var pktRange = sheet.getRange(2, pktColumn, lastRow - 1, 1);
  var pktValues = pktRange.getValues();
  result = backfillPktValues_(utcValues, pktValues);
  pktRange.setValues(pktValues);
  pktRange.setNumberFormat("dd mmm yyyy, hh:mm AM/PM");
  SpreadsheetApp.flush();
  return result;
}

function backfillPktValues_(utcValues, pktValues) {
  var result = { updated: 0, skipped: 0, invalid: 0 };
  pktValues.forEach(function (row, index) {
    if (row[0] !== "" && row[0] != null) {
      result.skipped += 1;
      return;
    }
    var parsed = parseUtcDate_(utcValues[index][0]);
    if (!parsed) {
      result.invalid += 1;
      return;
    }
    row[0] = parsed;
    result.updated += 1;
  });
  return result;
}

function ensureActivitySheet_(spreadsheet, props) {
  var name = props.getProperty("ACTIVITY_LOG_SHEET_NAME") || ACTIVITY_SHEET_DEFAULT;
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, ACTIVITY_HEADERS.length).setValues([ACTIVITY_HEADERS]);
  var current = sheet.getRange(1, 1, 1, ACTIVITY_HEADERS.length).getDisplayValues()[0];
  if (current.join("|") !== ACTIVITY_HEADERS.join("|")) throw new Error("ACTIVITY_LOG_HEADERS_INVALID");
  sheet.setFrozenRows(1);
  return sheet;
}

function headerMap_(headers) {
  var map = {};
  headers.forEach(function (header, index) { if (header) map[header] = index; });
  return map;
}

function requiredProperty_(props, key) {
  var value = props.getProperty(key);

  if (!value) {
    throw new Error("Missing Script Property: " + key);
  }

  return value;
}

function createLeadId_() {
  return (
    "TS-" +
    Utilities.formatDate(new Date(), "UTC", "yyyyMMdd") +
    "-" +
    Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase()
  );
}

function digest_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(value)
    )
  ).slice(0, 40);
}

function cleanText_(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function safe_(value) {
  var text = String(value == null ? "" : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function validTimeZone_(zone) {
  if (!zone) {
    return false;
  }

  try {
    Utilities.formatDate(new Date(), zone, "yyyy-MM-dd HH:mm");
    return zone.indexOf("/") > 0 || zone === "UTC";
  } catch (error) {
    return false;
  }
}

function isValidEmail_(email) {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isValidUuid_(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function secretsMatch_(provided, expected) {
  if (!provided || !expected || provided.length !== expected.length) {
    return false;
  }

  var difference = 0;

  for (var index = 0; index < provided.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}

function safeErrorName_(error) {
  if (!error) {
    return "UnknownError";
  }

  return error.name || "Error";
}

function json_(status, ok, code, message, fieldErrors, leadId) {
  var response = {
    ok: ok,
    status: status,
    message: message
  };

  if (code) {
    response.code = code;
  }

  if (fieldErrors) {
    response.fieldErrors = fieldErrors;
  }

  if (leadId) {
    response.leadId = leadId;
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function reportValue_(row, map, header) {
  return map[header] == null ? "" : row[map[header]];
}

function reportText_(row, map, header) {
  return String(reportValue_(row, map, header) == null ? "" : reportValue_(row, map, header)).trim();
}

function reportDimension_(value) {
  var text = String(value == null ? "" : value).trim();
  return text || REPORT_UNKNOWN;
}

function dateKey_(value, timeZone) {
  if (!value) return "";
  if (value instanceof Date && !isNaN(value.getTime())) return Utilities.formatDate(value, timeZone || "UTC", "yyyy-MM-dd");
  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    var exact = new Date(text + "T00:00:00Z");
    return !isNaN(exact.getTime()) && exact.toISOString().slice(0, 10) === text ? text : "";
  }
  var parsed = new Date(text);
  return isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function addUtcDays_(dateKey, days) {
  var parsed = new Date(dateKey + "T00:00:00Z");
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function actionClassification_(status, followUpValue, todayKey, timeZone) {
  var followUp = dateKey_(followUpValue, timeZone);
  var terminal = status === "Enrolled" || status === "Not Proceeding";
  if (!terminal && followUp && followUp < todayKey) return { group: "Overdue follow-ups", priority: 1, due: followUp };
  if (!terminal && followUp === todayKey) return { group: "Due today", priority: 2, due: followUp };
  if (!terminal && followUp > todayKey && followUp <= addUtcDays_(todayKey, 3)) return { group: "Due within next 3 days", priority: 3, due: followUp };
  if (status === "New") return { group: "New leads not yet contacted", priority: 4, due: followUp };
  if (["Trial 1 Completed", "Trial 2 Completed", "Trial 3 Completed"].indexOf(status) >= 0) return { group: "Trial completed, not enrolled", priority: 5, due: followUp };
  return null;
}

function actionQueueRows_(rows, map, todayKey, firstRowNumber, timeZone) {
  var output = [];
  rows.forEach(function (row, index) {
    var action = actionClassification_(reportText_(row, map, "Lead Status"), reportValue_(row, map, "Follow-up Due"), todayKey, timeZone);
    if (!action) return;
    output.push([
      action.group, action.priority, (firstRowNumber || 2) + index, reportText_(row, map, "Lead ID"),
      reportText_(row, map, "Learner or Parent Name"), reportText_(row, map, "Guardian Name"),
      reportText_(row, map, "WhatsApp"), reportText_(row, map, "Email"), reportText_(row, map, "Country"),
      reportText_(row, map, "Main Goal"), reportText_(row, map, "Age Group"), reportText_(row, map, "Lead Status"),
      reportValue_(row, map, "Follow-up Due"), reportText_(row, map, "Source"), reportText_(row, map, "UTM Source"),
      reportText_(row, map, "UTM Medium"), reportText_(row, map, "UTM Campaign")
    ]);
  });
  output.sort(function (left, right) {
    return left[1] - right[1] || String(dateKey_(left[12], timeZone) || "9999-12-31").localeCompare(String(dateKey_(right[12], timeZone) || "9999-12-31")) || left[2] - right[2];
  });
  return output;
}

function safePercent_(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 10000) / 100 : 0;
}

function marketingPerformanceRows_(rows, map) {
  var groups = {};
  rows.forEach(function (row) {
    var source = reportDimension_(reportText_(row, map, "UTM Source"));
    var medium = reportDimension_(reportText_(row, map, "UTM Medium"));
    var campaign = reportDimension_(reportText_(row, map, "UTM Campaign"));
    var key = [source, medium, campaign].join("\u001f");
    var metric = groups[key] || { source: source, medium: medium, campaign: campaign, total: 0, contacted: 0, booked: 0, attended: 0, enrolled: 0 };
    var status = reportText_(row, map, "Lead Status");
    metric.total += 1;
    if (LEAD_STATUSES.indexOf(status) > 0) metric.contacted += 1;
    if (["Trial 1 Booked", "Trial 1 Completed", "Trial 2 Completed", "Trial 3 Completed", "Enrolled"].indexOf(status) >= 0) metric.booked += 1;
    if (["Trial 1 Completed", "Trial 2 Completed", "Trial 3 Completed", "Enrolled"].indexOf(status) >= 0) metric.attended += 1;
    if (status === "Enrolled") metric.enrolled += 1;
    groups[key] = metric;
  });
  return Object.keys(groups).sort().map(function (key) {
    var metric = groups[key];
    return [metric.source, metric.medium, metric.campaign, metric.total, metric.contacted, metric.booked, metric.attended, metric.enrolled, safePercent_(metric.booked, metric.total), safePercent_(metric.enrolled, metric.attended)];
  });
}

function attributionLimits_() {
  return { "UTM Source": 100, "UTM Medium": 100, "UTM Campaign": 160, "UTM Content": 160, "UTM Term": 160, "Referrer Host": 253, "Landing Path": 300, "Submission Path": 300, "First Touch At": 30 };
}

function dataQualityWarnings_(rows, map, firstRowNumber) {
  var warnings = [], seenSubmissionIds = {}, limits = attributionLimits_();
  function warn(rowNumber, leadId, field, message) { warnings.push([rowNumber, leadId, field, message]); }
  rows.forEach(function (row, index) {
    var rowNumber = (firstRowNumber || 2) + index, leadId = reportText_(row, map, "Lead ID"), status = reportText_(row, map, "Lead Status");
    if (!reportText_(row, map, "WhatsApp")) warn(rowNumber, leadId, "WhatsApp", "Missing WhatsApp number");
    if (!reportText_(row, map, "Email")) warn(rowNumber, leadId, "Email", "Missing email address");
    var followUpRaw = reportValue_(row, map, "Follow-up Due");
    if (followUpRaw && !dateKey_(followUpRaw)) warn(rowNumber, leadId, "Follow-up Due", "Invalid follow-up date");
    if (!followUpRaw && status && status !== "Enrolled" && status !== "Not Proceeding") warn(rowNumber, leadId, "Follow-up Due", "Follow-up date is incomplete");
    if (status && LEAD_STATUSES.indexOf(status) < 0) warn(rowNumber, leadId, "Lead Status", "Unknown lead status");
    ["Lead ID", "Founder Alert Status", "User Email Status"].forEach(function (header) { if (map[header] != null && !reportText_(row, map, header)) warn(rowNumber, leadId, header, "Missing important operational value"); });
    Object.keys(limits).forEach(function (header) { var text = reportText_(row, map, header); if (text.length > limits[header]) warn(rowNumber, leadId, header, "Value exceeds expected limit of " + limits[header]); });
    ["Landing Path", "Submission Path"].forEach(function (header) { var path = reportText_(row, map, header); if (path && (path.charAt(0) !== "/" || path.indexOf("//") === 0 || /[?#]/.test(path))) warn(rowNumber, leadId, header, "Malformed path"); });
    var firstTouch = reportText_(row, map, "First Touch At");
    if (firstTouch && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(firstTouch) || !parseUtcDate_(firstTouch))) warn(rowNumber, leadId, "First Touch At", "Malformed UTC timestamp");
    if (map["Submission ID"] != null) {
      var submissionId = reportText_(row, map, "Submission ID");
      if (submissionId && seenSubmissionIds[submissionId]) warn(rowNumber, leadId, "Submission ID", "Duplicate submission ID; first seen at row " + seenSubmissionIds[submissionId]);
      else if (submissionId) seenSubmissionIds[submissionId] = rowNumber;
    }
  });
  if (map["Submission ID"] == null) warn("Sheet", "", "Submission ID", "Column is not stored; historical duplicate submission IDs cannot be scanned. Webhook duplicate protection remains active in Script Properties.");
  return warnings;
}

function admissionsSourceTable_(spreadsheet, props) {
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  var lastColumn = sheet.getLastColumn(), lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0], map = headerMap_(headers);
  ["Lead ID", "Lead Status", "Follow-up Due"].forEach(function (header) { if (map[header] == null) throw new Error("REPORT_REQUIRED_HEADER_MISSING: " + header); });
  return { sheet: sheet, headers: headers, map: map, rows: lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues() : [] };
}

function replaceDerivedSheet_(spreadsheet, name, headers, rows) {
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.setFrozenRows(1);
  return { sheet: name, rows: rows.length };
}

function refreshAdmissionsReports() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties(), spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
    var source = admissionsSourceTable_(spreadsheet, props);
    var zone = businessTimeZone_(props), today = Utilities.formatDate(new Date(), zone, "yyyy-MM-dd");
    var result = {
      actionQueue: replaceDerivedSheet_(spreadsheet, ACTION_QUEUE_SHEET_DEFAULT, ACTION_QUEUE_HEADERS, actionQueueRows_(source.rows, source.map, today, 2, zone)),
      marketingPerformance: replaceDerivedSheet_(spreadsheet, MARKETING_PERFORMANCE_SHEET_DEFAULT, MARKETING_PERFORMANCE_HEADERS, marketingPerformanceRows_(source.rows, source.map)),
      dataQuality: replaceDerivedSheet_(spreadsheet, DATA_QUALITY_SHEET_DEFAULT, DATA_QUALITY_HEADERS, dataQualityWarnings_(source.rows, source.map, 2))
    };
    SpreadsheetApp.flush();
    return result;
  } finally { lock.releaseLock(); }
}

function refreshAdmissionsActionQueue() { return refreshAdmissionsReports().actionQueue; }
function refreshMarketingPerformance() { return refreshAdmissionsReports().marketingPerformance; }
function refreshAdmissionsDataQuality() { return refreshAdmissionsReports().dataQuality; }

function dailyFounderSummaryData_(rows, map, now, todayKey, timeZone) {
  var cutoff = now.getTime() - 24 * 60 * 60 * 1000, fresh = [], sourceCounts = {};
  rows.forEach(function (row) {
    var submitted = parseUtcDate_(reportValue_(row, map, "Submitted At UTC"));
    if (submitted && submitted.getTime() >= cutoff && submitted.getTime() <= now.getTime()) {
      fresh.push(row);
      var source = reportDimension_(reportText_(row, map, "UTM Source"));
      var campaign = reportDimension_(reportText_(row, map, "UTM Campaign"));
      var label = source + " / " + campaign;
      sourceCounts[label] = (sourceCounts[label] || 0) + 1;
    }
  });
  var actions = actionQueueRows_(rows, map, todayKey, 2, timeZone);
  return {
    newLeads: fresh.length,
    overdue: actions.filter(function (row) { return row[0] === "Overdue follow-ups"; }).length,
    dueToday: actions.filter(function (row) { return row[0] === "Due today"; }).length,
    upcomingTrials: rows.filter(function (row) { return reportText_(row, map, "Lead Status") === "Trial 1 Booked"; }).length,
    awaitingDecision: actions.filter(function (row) { return row[0] === "Trial completed, not enrolled"; }).length,
    sources: sourceCounts,
    dataQualityWarnings: dataQualityWarnings_(rows, map, 2).length
  };
}

function founderSummaryPlain_(summary) {
  var sources = Object.keys(summary.sources).sort().map(function (key) { return "- " + key + ": " + summary.sources[key]; });
  return ["TAJWEED SCHOLARS ADMISSIONS SUMMARY", "Period: previous 24 hours", "", "New leads: " + summary.newLeads, "Overdue follow-ups: " + summary.overdue, "Follow-ups due today: " + summary.dueToday, "Upcoming trials (Trial 1 Booked): " + summary.upcomingTrials, "Trial completed, awaiting decision: " + summary.awaitingDecision, "Data-quality warnings: " + summary.dataQualityWarnings, "", "New lead source / campaign breakdown:", sources.length ? sources.join("\n") : "- None"].join("\n");
}

function buildDailyFounderAdmissionsSummary_() {
  var props = PropertiesService.getScriptProperties(), spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var source = admissionsSourceTable_(spreadsheet, props), now = new Date();
  var zone = businessTimeZone_(props), today = Utilities.formatDate(now, zone, "yyyy-MM-dd");
  var summary = dailyFounderSummaryData_(source.rows, source.map, now, today, zone);
  return { dateKey: today, summary: summary, plain: founderSummaryPlain_(summary) };
}

function previewDailyFounderAdmissionsSummary() {
  return buildDailyFounderAdmissionsSummary_();
}

function sendDailyFounderAdmissionsSummary() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties(), built = buildDailyFounderAdmissionsSummary_();
    var key = "daily_founder_summary_" + built.dateKey;
    if (props.getProperty(key)) return { sent: false, reason: "Already sent for " + built.dateKey };
    var founder = requiredProperty_(props, "FOUNDER_EMAIL"), sender = verifiedSenderAlias_(props);
    GmailApp.sendEmail(founder, "Tajweed Scholars admissions summary — " + built.dateKey, built.plain, emailSendOptions_("<pre style=\"white-space:pre-wrap;font-family:Arial,sans-serif\">" + htmlEscape_(built.plain) + "</pre>", sender, requiredProperty_(props, "REPLY_TO_EMAIL"), props));
    props.setProperty(key, new Date().toISOString());
    return { sent: true, dateKey: built.dateKey };
  } finally { lock.releaseLock(); }
}

function setupDailyFounderSummaryTrigger() {
  removeDailyFounderSummaryTrigger();
  ScriptApp.newTrigger(DAILY_SUMMARY_HANDLER).timeBased().atHour(8).everyDays(1).create();
  return { handler: DAILY_SUMMARY_HANDLER, triggers: 1 };
}

function removeDailyFounderSummaryTrigger() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === DAILY_SUMMARY_HANDLER) { ScriptApp.deleteTrigger(trigger); removed += 1; }
  });
  return { removed: removed };
}

// Phase 1 notification presentation overrides. Kept at the end so deployments
// upgraded from the original script retain the webhook and validation contract.
function marketingAttributionRows_(lead) {
  var attribution = lead.attribution || {};
  var candidates = [
    ["UTM source", attribution.utm_source], ["UTM medium", attribution.utm_medium],
    ["UTM campaign", attribution.utm_campaign], ["UTM content", attribution.utm_content],
    ["UTM term", attribution.utm_term], ["Referrer host", attribution.referrer_host],
    ["Landing path", attribution.landing_path], ["Submission path", attribution.submission_path],
    ["First touch", attribution.first_touch_at]
  ].filter(function (row) { return Boolean(row[1]); });
  return candidates.length ? candidates : [["Source", "Direct / Unknown"]];
}

function sendFounderLeadEmail_(lead, props) {
  var founderEmail = requiredProperty_(props, "FOUNDER_EMAIL");
  var replyToEmail = requiredProperty_(props, "REPLY_TO_EMAIL");
  var senderAlias = verifiedSenderAlias_(props);
  var view = presentationValues_(lead);
  var received = formatBusinessDateTime_(lead.submittedAtUtc || lead.receivedAt, props, true);
  var wa = buildWhatsAppUrl_(lead.whatsapp, "Assalamu alaikum, this is Muneeb from Tajweed Scholars. We received your request for three free trial classes.");
  var summaryRows = [["Lead reference", lead.leadId], ["Learner type", view.learner], ["Age group", view.ageGroup], ["Main goal", view.goal], ["Received", received]];
  var detailRows = [["Name", lead.contactName], ["Guardian", view.guardian], ["WhatsApp", lead.whatsapp], ["Email", lead.email], ["Country", lead.countryName + " (" + lead.countryCode + ")"], ["Region", view.region], ["Time zone", lead.timeZone], ["Preferred days", view.preferredDays], ["Preferred time", view.preferredTime], ["Notes", view.notes]];
  var attributionRows = marketingAttributionRows_(lead);
  var plain = "ADMISSIONS ALERT\nNew Trial Request\n\n" + summaryRows.concat(detailRows).map(function (row) { return row[0] + ": " + row[1]; }).join("\n") + "\n\nMARKETING ATTRIBUTION\n" + attributionRows.map(function (row) { return row[0] + ": " + row[1]; }).join("\n") + "\n\nMessage on WhatsApp: " + wa + "\nReply by Email: mailto:" + lead.email + "\nOpen CRM: " + lead.spreadsheetUrl;
  var actions = '<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;margin-top:24px"><tr><td style="padding:0 6px 8px 0"><a href="' + htmlEscape_(wa) + '" style="' + emailButtonStyle_("#277F68", "#FFFFFF", "#277F68") + '">Message on WhatsApp</a></td><td style="padding:0 6px 8px"><a href="mailto:' + htmlEscape_(lead.email) + '" style="' + emailButtonStyle_("#FFFFFF", "#277F68", "#277F68") + '">Reply by Email</a></td><td style="padding:0 0 8px 6px"><a href="' + htmlEscape_(lead.spreadsheetUrl) + '" style="' + emailButtonStyle_("#AE8F6D", "#FFFFFF", "#AE8F6D") + '">Open CRM</a></td></tr></table>';
  var content = '<p style="margin:0 0 18px;color:#1F2937">A new trial request needs admissions follow-up.</p>' + emailDataTable_(summaryRows, true) + '<h2 style="margin:26px 0 10px;font-size:18px;color:#277F68">Full information</h2>' + emailDataTable_(detailRows, false) + '<h2 style="margin:26px 0 10px;font-size:18px;color:#277F68">Marketing Attribution</h2>' + emailDataTable_(attributionRows, false) + actions;
  var html = emailShell_("ADMISSIONS ALERT", "New Trial Request", content, replyToEmail, props);
  GmailApp.sendEmail(founderEmail, founderEmailSubject_(lead.leadId), plain, emailSendOptions_(html, senderAlias, replyToEmail, props));
}

function sendSubmitterAcknowledgement_(lead, props) {
  var replyToEmail = requiredProperty_(props, "REPLY_TO_EMAIL");
  var senderAlias = verifiedSenderAlias_(props);
  var businessNumber = props.getProperty("WHATSAPP_BUSINESS_NUMBER") || "";
  var wa = buildWhatsAppUrl_(businessNumber, "Assalamu alaikum, I have a question about my Tajweed Scholars trial request.");
  var view = presentationValues_(lead);
  var received = formatBusinessDateTime_(lead.submittedAtUtc || lead.receivedAt, props, false);
  var summaryRows = [["Learner", view.learner], ["Age group", view.ageGroup], ["Main goal", view.goal], ["Preferred days", view.preferredDays], ["Preferred time", view.preferredTime], ["Time zone", lead.timeZone], ["Request received", received], ["Reference", lead.leadId]];
  var plain = "Assalamu Alaikum " + lead.contactName + ",\n\nThank you for requesting three complimentary trial classes with Tajweed Scholars.\n\nWhat happens next:\n1. We review the learner's current level and goal.\n2. We check the preferred days and time zone.\n3. Our admissions team contacts the family through WhatsApp or email.\n4. We arrange Trial 1 — the placement assessment.\n\n" + summaryRows.map(function (row) { return row[0] + ": " + row[1]; }).join("\n") + "\n\nNo payment information is required for the complimentary trial classes.\n\nMessage Admissions on WhatsApp: " + wa + "\nVisit Tajweed Scholars: https://tajweedscholars.com\n\nTajweed Scholars\nLive private one-to-one Quran classes\n" + replyToEmail + "\nhttps://tajweedscholars.com";
  var content = '<p style="margin:0 0 14px">Assalamu Alaikum ' + htmlEscape_(lead.contactName) + ',</p><p style="margin:0 0 20px">Thank you for requesting three complimentary trial classes with Tajweed Scholars.</p><h2 style="margin:0 0 10px;font-size:18px;color:#277F68">What happens next</h2><ol style="margin:0 0 22px;padding-left:22px;line-height:1.7"><li>We review the learner&#39;s current level and goal.</li><li>We check the preferred days and time zone.</li><li>Our admissions team contacts the family through WhatsApp or email.</li><li>We arrange Trial 1 &mdash; the placement assessment.</li></ol><div style="background:#FAF8F5;border:1px solid #E5E7EB;border-left:4px solid #AE8F6D;padding:16px">' + emailDataTable_(summaryRows, false) + '</div><p style="margin:20px 0"><strong>No payment information is required for the complimentary trial classes.</strong></p>' + (wa ? '<p style="margin:22px 0"><a href="' + htmlEscape_(wa) + '" style="' + emailButtonStyle_("#277F68", "#FFFFFF", "#277F68") + '">Message Admissions on WhatsApp</a></p>' : "") + '<p style="margin:0"><a href="https://tajweedscholars.com" style="color:#277F68;text-decoration:underline">Visit Tajweed Scholars</a></p>';
  var html = emailShell_("", "Your Trial Request Has Been Received", content, replyToEmail, props);
  GmailApp.sendEmail(lead.email, userEmailSubject_(), plain, emailSendOptions_(html, senderAlias, replyToEmail, props));
}

function verifiedSenderAlias_(props) {
  var replyToEmail = requiredProperty_(props, "REPLY_TO_EMAIL");
  var aliases = GmailApp.getAliases();
  var expected = String(replyToEmail).toLowerCase();
  for (var index = 0; index < aliases.length; index += 1) {
    if (String(aliases[index]).toLowerCase() === expected) return aliases[index];
  }
  throw new Error("Verified Gmail sender alias is unavailable: " + replyToEmail);
}

function utcIsoTimestamp_(value) {
  if (!value) return "Unavailable (legacy queued job)";
  var parsed = value instanceof Date ? value : new Date(value);
  return isNaN(parsed.getTime()) ? "Unavailable (legacy queued job)" : parsed.toISOString();
}

function parseUtcDate_(value) {
  if (!value) return null;
  var parsed = value instanceof Date ? value : new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function businessTimeZone_(props) {
  return props.getProperty("BUSINESS_TIME_ZONE") || "Asia/Karachi";
}

function formatBusinessDateTime_(utcValue, props, includeOffset) {
  var parsed = parseUtcDate_(utcValue);
  if (!parsed) return "Unavailable";
  var zone = businessTimeZone_(props);
  var formatted = Utilities.formatDate(parsed, zone, "dd MMM yyyy, hh:mm a");
  var label = zone === "Asia/Karachi" ? "PKT" : zone;
  if (!includeOffset) return formatted + " " + label;
  var rawOffset = Utilities.formatDate(parsed, zone, "Z");
  var hours = Number(rawOffset.slice(0, 3));
  var minutes = rawOffset.slice(3);
  var offset = "UTC" + (hours >= 0 ? "+" : "") + hours + (minutes === "00" ? "" : ":" + minutes);
  return formatted + " " + label + " (" + offset + ")";
}

function emailLogoBlob_(props) {
  if (EMAIL_LOGO_ATTEMPTED_) return EMAIL_LOGO_CACHE_;
  EMAIL_LOGO_ATTEMPTED_ = true;
  var url = props.getProperty("EMAIL_LOGO_URL");
  if (!url) return null;
  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    var code = response.getResponseCode();
    var contentType = String(response.getHeaders()["Content-Type"] || response.getHeaders()["content-type"] || "");
    if (code < 200 || code >= 300 || contentType.indexOf("image/") !== 0) throw new Error("INVALID_LOGO_RESPONSE");
    EMAIL_LOGO_CACHE_ = response.getBlob().setName("tajweed-scholars-email-logo.png");
  } catch (error) {
    console.log("Email logo unavailable; using text wordmark.");
    EMAIL_LOGO_CACHE_ = null;
  }
  return EMAIL_LOGO_CACHE_;
}

function emailSendOptions_(htmlBody, senderAlias, replyTo, props) {
  var options = { htmlBody: htmlBody, name: "Tajweed Scholars", from: senderAlias, replyTo: replyTo };
  var logoBlob = emailLogoBlob_(props);
  if (logoBlob) options.inlineImages = { tsLogo: logoBlob };
  return options;
}

function emailDataTable_(rows, highlighted) {
  return '<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;' + (highlighted ? "background:#FAF8F5;border:1px solid #E5E7EB" : "") + '">' + rows.map(function (row) { return '<tr><td style="width:38%;padding:9px 10px;border-bottom:1px solid #E5E7EB;color:#1F2937;font-weight:700;vertical-align:top">' + htmlEscape_(row[0]) + '</td><td style="padding:9px 10px;border-bottom:1px solid #E5E7EB;color:#1F2937;vertical-align:top">' + htmlEscape_(row[1]) + "</td></tr>"; }).join("") + "</table>";
}

function htmlEscape_(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function presentationValues_(lead) {
  var age = canonicalAgeGroup_(lead.ageGroup);
  var goals = { qaida: "Start with Qaida", "quran-reading": "Improve Quran reading", tajweed: "Improve Tajweed & pronunciation", hifz: "Hifz / Quran memorization", unsure: "Not sure \u2014 help me choose" };
  var times = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };
  var ages = { "4-6": "4\u20136", "7-9": "7\u20139", "10-12": "10\u201312", "13-15": "13\u201315", "16-17": "16\u201317", adult: "Adult" };
  var learner = lead.learnerType === "child" ? "Child learner" : age === "adult" ? "Adult learner" : "Learner";
  return { region: lead.region || "Not provided", notes: lead.notes || "Not provided", guardian: age === "adult" ? "Not applicable \u2014 adult learner" : lead.guardianName, learner: learner, ageGroup: ages[age], goal: goals[lead.mainGoal] || String(lead.mainGoal || ""), preferredDays: (lead.preferredDays || []).map(function (day) { return String(day).charAt(0).toUpperCase() + String(day).slice(1); }).join(", "), preferredTime: times[lead.preferredTime] || String(lead.preferredTime || ""), error: null };
}
function buildWhatsAppUrl_(number, message) { var digits = String(number || "").replace(/\D/g, ""); return digits ? "https://wa.me/" + digits + "?text=" + encodeURIComponent(String(message || "")) : ""; }
function founderEmailSubject_(leadId) { return "[ACTION REQUIRED] New Trial Lead \u2014 " + String(leadId); }
function userEmailSubject_() { return "We received your Tajweed Scholars trial request"; }
function emailButtonStyle_(background, color, border) { return "display:inline-block;padding:13px 16px;border-radius:6px;background:" + background + ";color:" + color + ";border:1px solid " + border + ";text-decoration:none;font-weight:700;text-align:center;white-space:nowrap"; }
function emailShell_(label, title, content, contactEmail, props) {
  var logo = emailLogoBlob_(props) ? '<img src="cid:tsLogo" alt="Tajweed Scholars" width="225" style="display:block;width:225px;max-width:100%;height:auto;border:0">' : '<div style="font-size:24px;font-weight:700;color:#277F68">Tajweed Scholars</div>';
  return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF8F5;font-family:Arial,Helvetica,sans-serif;color:#1F2937"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#FFFFFF;border:1px solid #E5E7EB"><tr><td style="padding:24px 28px;border-top:5px solid #277F68">' + logo + (label ? '<div style="margin-top:20px;font-size:12px;font-weight:700;letter-spacing:1.2px;color:#AE8F6D">' + htmlEscape_(label) + "</div>" : "") + '<h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;color:#277F68">' + htmlEscape_(title) + '</h1></td></tr><tr><td style="padding:8px 28px 28px;line-height:1.6">' + content + '</td></tr><tr><td style="padding:20px 28px;background:#FAF8F5;border-top:1px solid #E5E7EB;color:#1F2937;font-size:13px;line-height:1.6"><strong style="color:#277F68">Tajweed Scholars</strong><br>Live private one-to-one Quran classes<br><a href="mailto:' + htmlEscape_(contactEmail) + '" style="color:#277F68">' + htmlEscape_(contactEmail) + '</a><br><a href="https://tajweedscholars.com" style="color:#277F68">https://tajweedscholars.com</a></td></tr></table></td></tr></table>';
}
function safeErrorCode_(error) { return String(error && (error.code || error.name) || "NOTIFICATION_ERROR").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 60); }
function safeErrorMessage_(error) {
  var message = String(error && error.message || safeErrorCode_(error));
  return message
    .replace(/https?:\/\/\S+/gi, "[redacted URL]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, "[redacted value]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 160);
}
