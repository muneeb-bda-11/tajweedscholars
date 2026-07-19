/**
 * Tajweed Scholars Trial Lead CRM webhook.
 *
 * Required Script Properties:
 * - SPREADSHEET_ID
 * - API_SECRET
 * - FOUNDER_EMAIL
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

var OPERATIONAL_HEADERS = [
  "Founder Alert Status", "Founder Alert Sent At", "User Email Status",
  "User Email Sent At", "Notification Retry Count",
  "Notification Last Attempt At", "Total Processing Time Ms", "Last Error",
  "Last Error At"
];
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

        sheet.getRange(
          sheet.getLastRow() + 1,
          1,
          1,
          TRIAL_HEADERS.length + OPERATIONAL_HEADERS.length
        ).setValues([rowFor_(leadId, normalized)]);
        queueLeadNotification_(props, hash, leadId, normalized);
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
  lead
) {
  var notifiedKey = NOTIFIED_PREFIX + hash;
  var pendingKey = PENDING_NOTIFICATION_PREFIX + hash;

  if (props.getProperty(notifiedKey) || props.getProperty(pendingKey)) {
    return;
  }

  var job = {
    hash: hash,
    leadId: leadId,
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
    founderSent: false,
    submitterSent: false,
    createdAtUtc: new Date().toISOString()
  };

  props.setProperty(pendingKey, JSON.stringify(job));
}

function processPendingLeadNotifications() {
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
    return;
  }

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

    if (!job.founderSent) {
      try {
        sendFounderLeadEmail_(job, props);
        job.founderSent = true;
        props.setProperty(pendingKey, JSON.stringify(job));
      } catch (founderError) {
        console.error("Founder notification failed for lead: " + job.leadId);
      }
    }

    if (!job.submitterSent) {
      try {
        sendSubmitterAcknowledgement_(job, props);
        job.submitterSent = true;
        props.setProperty(pendingKey, JSON.stringify(job));
      } catch (submitterError) {
        console.error("Submitter acknowledgement failed for lead: " + job.leadId);
      }
    }

    if (job.founderSent && job.submitterSent) {
      props.deleteProperty(pendingKey);
      props.setProperty(NOTIFIED_PREFIX + job.hash, "yes");
      console.log("Notifications completed for lead: " + job.leadId);
    }
  });
}

function setupLeadNotificationTrigger() {
  var triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(function (trigger) {
    if (
      trigger.getHandlerFunction() ===
      "processPendingLeadNotifications"
    ) {
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

  console.log("Spreadsheet configured: " + Boolean(spreadsheetId));
  console.log("API secret configured: " + Boolean(apiSecret));
  console.log("API secret length: " + (apiSecret ? apiSecret.length : 0));
  console.log("Founder email configured: " + Boolean(founderEmail));
  console.log("Email recipients remaining today: " + MailApp.getRemainingDailyQuota());

  if (spreadsheetId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(trialSheetName_(props));

    console.log("Trial Leads sheet found: " + Boolean(sheet));

    if (sheet) {
      assertHeaders_(sheet);
      console.log("Trial Leads headers are correct.");
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
    formStartedAt: Number(body.formStartedAt)
  };
}

function validateTrialLead_(lead) {
  var errors = {};

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

function rowFor_(leadId, lead) {
  var ageGroup = canonicalAgeGroup_(lead.ageGroup);
  var view = presentationValues_(lead);
  return [
    leadId,
    new Date().toISOString(),
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
    "Queued", "", "Queued", "", 0, "", "", "", ""
  ];
}

function setupPhase1Admissions() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  assertHeaders_(sheet);
  ensureOperationalHeaders_(sheet);
  ensureAgeGroupPlainText_(sheet);
  ensureActivitySheet_(spreadsheet, props);
  refreshNotificationTrigger_();
  SpreadsheetApp.flush();
  return verifyPhase1AdmissionsSetup();
}

function setupTrialLeadSystem() {
  var props = PropertiesService.getScriptProperties();
  requiredProperty_(props, "API_SECRET");
  requiredProperty_(props, "FOUNDER_EMAIL");
  var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
  if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
  assertHeaders_(sheet);
  ensureOperationalHeaders_(sheet);
  ensureAgeGroupPlainText_(sheet);
  ensureActivitySheet_(spreadsheet, props);
  setupLeadNotificationTrigger();
  SpreadsheetApp.flush();
  return { ready: true, notificationHandler: "processPendingLeadNotifications" };
}

function verifyPhase1AdmissionsSetup() {
  var props = PropertiesService.getScriptProperties();
  var result = { ageGroupColumnFound: false, ageGroupPlainTextFormatReady: false, operationalColumnsReady: false, activityLogReady: false, notificationTriggerReady: false };
  var spreadsheetId = props.getProperty("SPREADSHEET_ID");
  if (spreadsheetId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
    if (sheet) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      var ageIndex = headers.indexOf("Age Group");
      result.ageGroupColumnFound = ageIndex >= 0;
      result.operationalColumnsReady = OPERATIONAL_HEADERS.every(function (header) { return headers.indexOf(header) >= 0; });
      if (ageIndex >= 0 && sheet.getMaxRows() > 1) result.ageGroupPlainTextFormatReady = sheet.getRange(2, ageIndex + 1, sheet.getMaxRows() - 1, 1).getNumberFormats().every(function (row) { return row[0] === "@"; });
    }
    result.activityLogReady = Boolean(spreadsheet.getSheetByName(props.getProperty("ACTIVITY_LOG_SHEET_NAME") || ACTIVITY_SHEET_DEFAULT));
  }
  result.notificationTriggerReady = ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === "processNotificationQueue"; }).length === 1;
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

function refreshNotificationTrigger_() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) { if (trigger.getHandlerFunction() === "processNotificationQueue") ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger("processNotificationQueue").timeBased().everyMinutes(5).create();
}

function processNotificationQueue() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return { skipped: true, reason: "LOCKED" };
  try {
    var props = PropertiesService.getScriptProperties();
    var spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
    var sheet = spreadsheet.getSheetByName(trialSheetName_(props));
    if (!sheet) throw new Error("TRIAL_LEADS_SHEET_NOT_FOUND");
    var map = ensureOperationalHeaders_(sheet), lastRow = sheet.getLastRow(), maxAttempts = maxNotificationAttempts_(props), processed = 0;
    if (lastRow < 2) return { processed: 0 };
    var values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    values.forEach(function (row, offset) {
      var founderStatus = String(row[map["Founder Alert Status"]] || "Queued"), userStatus = String(row[map["User Email Status"]] || "Queued"), attempts = Number(row[map["Notification Retry Count"]] || 0);
      if (!notificationEligible_(founderStatus, userStatus, attempts, maxAttempts)) return;
      var rowNumber = offset + 2, lead = leadFromRow_(row, map), started = Date.now(), attempt = attempts + 1;
      updateCell_(sheet, rowNumber, map, "Notification Retry Count", attempt);
      updateCell_(sheet, rowNumber, map, "Notification Last Attempt At", new Date().toISOString());
      if (attempt > 1) logActivity_(spreadsheet, props, lead.leadId, "NOTIFICATION_RETRY_STARTED", "Retrying", 0, attempt, "", "");
      var errors = [];
      if (founderStatus !== "Sent" && notificationStatusEligible_(founderStatus)) {
        updateCell_(sheet, rowNumber, map, "Founder Alert Status", attempt > 1 ? "Retrying" : "Queued");
        try { sendFounderLeadEmail_(lead, props); updateCell_(sheet, rowNumber, map, "Founder Alert Status", "Sent"); updateCell_(sheet, rowNumber, map, "Founder Alert Sent At", new Date().toISOString()); logActivity_(spreadsheet, props, lead.leadId, "FOUNDER_EMAIL_SENT", "Sent", Date.now() - started, attempt, "", ""); }
        catch (error) { errors.push(error); updateCell_(sheet, rowNumber, map, "Founder Alert Status", attempt >= maxAttempts ? "Failed" : "Retrying"); logActivity_(spreadsheet, props, lead.leadId, "FOUNDER_EMAIL_FAILED", "Failed", Date.now() - started, attempt, safeErrorCode_(error), safeErrorMessage_(error)); }
      }
      if (userStatus !== "Sent" && notificationStatusEligible_(userStatus)) {
        updateCell_(sheet, rowNumber, map, "User Email Status", attempt > 1 ? "Retrying" : "Queued");
        try { sendSubmitterAcknowledgement_(lead, props); updateCell_(sheet, rowNumber, map, "User Email Status", "Sent"); updateCell_(sheet, rowNumber, map, "User Email Sent At", new Date().toISOString()); logActivity_(spreadsheet, props, lead.leadId, "USER_EMAIL_SENT", "Sent", Date.now() - started, attempt, "", ""); }
        catch (error) { errors.push(error); updateCell_(sheet, rowNumber, map, "User Email Status", attempt >= maxAttempts ? "Failed" : "Retrying"); logActivity_(spreadsheet, props, lead.leadId, "USER_EMAIL_FAILED", "Failed", Date.now() - started, attempt, safeErrorCode_(error), safeErrorMessage_(error)); }
      }
      updateCell_(sheet, rowNumber, map, "Total Processing Time Ms", Date.now() - started);
      updateCell_(sheet, rowNumber, map, "Last Error", errors.length ? safeErrorCode_(errors[0]) : "");
      updateCell_(sheet, rowNumber, map, "Last Error At", errors.length ? new Date().toISOString() : "");
      if (errors.length && attempt >= maxAttempts) logActivity_(spreadsheet, props, lead.leadId, "NOTIFICATION_RETRY_EXHAUSTED", "Failed", Date.now() - started, attempt, safeErrorCode_(errors[0]), safeErrorMessage_(errors[0]));
      processed += 1;
    });
    SpreadsheetApp.flush();
    return { processed: processed };
  } finally { lock.releaseLock(); }
}

function notificationStatusEligible_(status) { return ["Queued", "Retrying", "Failed"].indexOf(status) >= 0; }
function notificationEligible_(founderStatus, userStatus, attempts, maxAttempts) { return attempts < maxAttempts && (notificationStatusEligible_(founderStatus) || notificationStatusEligible_(userStatus)); }
function retryExhausted_(attempts, maxAttempts) { return attempts >= maxAttempts; }
function maxNotificationAttempts_(props) { var value = Number(props.getProperty("MAX_NOTIFICATION_ATTEMPTS") || 3); return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3; }
function trialSheetName_(props) { return props.getProperty("TRIAL_LEADS_SHEET_NAME") || TRIAL_SHEET; }
function updateCell_(sheet, row, map, header, value) { sheet.getRange(row, map[header] + 1).setValue(value); }

function leadFromRow_(row, map) {
  var storedAge = row[map["Age Group"]];
  return { leadId: String(row[map["Lead ID"]] || ""), receivedAt: row[map["Submitted At UTC"]], learnerType: String(row[map["Learner Type"]] || ""), ageGroup: repairedAgeGroup_(storedAge, "") || String(storedAge || ""), mainGoal: String(row[map["Main Goal"]] || ""), contactName: String(row[map["Learner or Parent Name"]] || ""), guardianName: String(row[map["Guardian Name"]] || ""), countryCode: String(row[map["Country Code"]] || ""), countryName: String(row[map["Country"]] || ""), region: String(row[map["State / Province / Region"]] || ""), timeZone: String(row[map["Time Zone"]] || ""), whatsapp: String(row[map["WhatsApp"]] || ""), email: String(row[map["Email"]] || ""), preferredDays: String(row[map["Preferred Days"]] || "").split(/,\s*/).filter(Boolean), preferredTime: String(row[map["Preferred Time"]] || ""), notes: String(row[map["Notes"]] || ""), spreadsheetUrl: "https://docs.google.com/spreadsheets/d/" + requiredProperty_(PropertiesService.getScriptProperties(), "SPREADSHEET_ID") };
}

function logActivity_(spreadsheet, props, leadId, event, status, duration, attempt, errorCode, errorMessage) {
  ensureActivitySheet_(spreadsheet, props).appendRow([Utilities.getUuid(), leadId, event, status, new Date().toISOString(), Number(duration || 0), Number(attempt || 0), String(errorCode || ""), String(errorMessage || "").slice(0, 160)]);
}

function sendFounderLeadEmail_(job, props) {
  var founderEmail = requiredProperty_(props, "FOUNDER_EMAIL");

  var regionLine = job.region
    ? "\nState / Province / Region: " + job.region
    : "";

  var guardianLine = job.guardianName
    ? "\nGuardian: " + job.guardianName
    : "";

  var body =
    "A new Tajweed Scholars trial request has been received.\n\n" +
    "Lead ID: " +
    job.leadId +
    "\nLearner type: " +
    job.learnerType +
    "\nAge group: " +
    job.ageGroup +
    "\nMain goal: " +
    job.mainGoal +
    "\nName: " +
    job.contactName +
    guardianLine +
    "\nWhatsApp: " +
    job.whatsapp +
    "\nEmail: " +
    job.email +
    "\nCountry: " +
    job.countryName +
    " (" +
    job.countryCode +
    ")" +
    regionLine +
    "\nTime zone: " +
    job.timeZone +
    "\nPreferred days: " +
    job.preferredDays.join(", ") +
    "\nPreferred time: " +
    job.preferredTime +
    "\n\nOpen CRM: " +
    job.spreadsheetUrl;

  MailApp.sendEmail({
    to: founderEmail,
    subject: "New trial request — " + job.leadId,
    body: body,
    name: "Tajweed Scholars Website",
    replyTo: founderEmail
  });
}

function sendSubmitterAcknowledgement_(job, props) {
  var founderEmail = requiredProperty_(props, "FOUNDER_EMAIL");

  var body =
    "Assalamu alaikum,\n\n" +
    "We received your request for three free trial classes.\n\n" +
    "We’ll review your preferred days and time zone, then contact you " +
    "through WhatsApp or email to arrange Trial 1.\n\n" +
    "Reference: " +
    job.leadId +
    "\n\n" +
    "No action is required.\n\n" +
    "Tajweed Scholars";

  MailApp.sendEmail({
    to: job.email,
    subject: "We received your Tajweed Scholars trial request",
    body: body,
    name: "Tajweed Scholars",
    replyTo: founderEmail
  });
}

function assertHeaders_(sheet) {
  var actual = sheet
    .getRange(1, 1, 1, TRIAL_HEADERS.length)
    .getDisplayValues()[0];

  if (actual.join("|") !== TRIAL_HEADERS.join("|")) {
    throw new Error(
      "Trial Leads headers do not match. Run migrateTrialLeadsSheet first."
    );
  }
}

function ensureOperationalHeaders_(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), TRIAL_HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  OPERATIONAL_HEADERS.forEach(function (header) {
    if (headers.indexOf(header) < 0) {
      sheet.getRange(1, headers.length + 1).setValue(header);
      headers.push(header);
    }
  });
  return headerMap_(headers);
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

// Phase 1 notification presentation overrides. Kept at the end so deployments
// upgraded from the original script retain the webhook and validation contract.
function sendFounderLeadEmail_(lead, props) {
  var founderEmail = requiredProperty_(props, "FOUNDER_EMAIL");
  var replyTo = props.getProperty("REPLY_TO_EMAIL") || "tajweedscholar@gmail.com";
  var view = presentationValues_(lead);
  var wa = buildWhatsAppUrl_(lead.whatsapp, "Assalamu alaikum, this is Muneeb from Tajweed Scholars. We received your request for three free trial classes.");
  var rows = [["Lead reference", lead.leadId], ["Learner", view.learner], ["Age group", view.ageGroup], ["Name", lead.contactName], ["Guardian", view.guardian], ["Goal", view.goal], ["Country", lead.countryName + " (" + lead.countryCode + ")"], ["Region", view.region], ["Time zone", lead.timeZone], ["Preferred days", view.preferredDays], ["Preferred time", view.preferredTime], ["Notes", view.notes], ["Received", String(lead.receivedAt || "")]];
  var plain = rows.map(function (row) { return row[0] + ": " + row[1]; }).join("\n") + "\n\nOpen CRM: " + lead.spreadsheetUrl;
  var table = rows.map(function (row) { return '<tr><td style="padding:8px;border-bottom:1px solid #e7e5e4;font-weight:700">' + htmlEscape_(row[0]) + '</td><td style="padding:8px;border-bottom:1px solid #e7e5e4">' + htmlEscape_(row[1]) + "</td></tr>"; }).join("");
  var actions = '<div style="margin-top:24px"><a style="' + buttonStyle_("#166534") + '" href="' + htmlEscape_(wa) + '">Message on WhatsApp</a><a style="' + buttonStyle_("#44403c") + '" href="mailto:' + htmlEscape_(lead.email) + '">Reply by Email</a><a style="' + buttonStyle_("#92400e") + '" href="' + htmlEscape_(lead.spreadsheetUrl) + '">Open CRM</a></div>';
  MailApp.sendEmail({ to: founderEmail, subject: founderEmailSubject_(lead.leadId), body: plain, htmlBody: emailShell_("New trial lead", '<p>A new trial request needs admissions follow-up.</p><table style="width:100%;border-collapse:collapse">' + table + "</table>" + actions), name: "Tajweed Scholars", replyTo: replyTo });
}

function sendSubmitterAcknowledgement_(lead, props) {
  var replyTo = props.getProperty("REPLY_TO_EMAIL") || "tajweedscholar@gmail.com";
  var businessNumber = props.getProperty("WHATSAPP_BUSINESS_NUMBER") || "";
  var wa = buildWhatsAppUrl_(businessNumber, "Assalamu alaikum, I have a question about my Tajweed Scholars trial request.");
  var view = presentationValues_(lead);
  var plain = "Assalamu alaikum " + lead.contactName + ",\n\nThank you for requesting three free trial classes.\n\nWhat happens next:\n1. We review your learning goal and preferred timings.\n2. We contact you through WhatsApp or email.\n3. We arrange your first trial lesson.\n\nLearner: " + view.learner + "\nAge group: " + view.ageGroup + "\nMain goal: " + view.goal + "\nPreferred days: " + view.preferredDays + "\nPreferred time: " + view.preferredTime + "\nTime zone: " + lead.timeZone + "\nReference: " + lead.leadId + "\n\nNo payment information is required.\n\nTajweed Scholars\nLive private one-to-one Quran classes\n" + replyTo + "\n" + businessNumber;
  var summary = '<table style="width:100%;border-collapse:collapse"><tr><td><strong>Learner</strong></td><td>' + htmlEscape_(view.learner) + '</td></tr><tr><td><strong>Age group</strong></td><td>' + htmlEscape_(view.ageGroup) + '</td></tr><tr><td><strong>Main goal</strong></td><td>' + htmlEscape_(view.goal) + '</td></tr><tr><td><strong>Preferred days</strong></td><td>' + htmlEscape_(view.preferredDays) + '</td></tr><tr><td><strong>Preferred time</strong></td><td>' + htmlEscape_(view.preferredTime) + '</td></tr><tr><td><strong>Time zone</strong></td><td>' + htmlEscape_(lead.timeZone) + '</td></tr><tr><td><strong>Reference</strong></td><td>' + htmlEscape_(lead.leadId) + "</td></tr></table>";
  var content = '<p>Assalamu alaikum ' + htmlEscape_(lead.contactName) + ',</p><p>Thank you for requesting three free trial classes.</p><h2 style="font-size:18px">What happens next</h2><ol><li>We review your learning goal and preferred timings.</li><li>We contact you through WhatsApp or email.</li><li>We arrange your first trial lesson.</li></ol>' + summary + '<p><strong>No payment information is required.</strong></p>' + (wa ? '<p><a style="' + buttonStyle_("#166534") + '" href="' + htmlEscape_(wa) + '">Message Tajweed Scholars</a></p>' : "");
  MailApp.sendEmail({ to: lead.email, subject: userEmailSubject_(), body: plain, htmlBody: emailShell_("Request received", content), name: "Tajweed Scholars", replyTo: replyTo });
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
function buttonStyle_(color) { return "display:inline-block;margin:4px;padding:12px 16px;border-radius:6px;background:" + color + ";color:#fff;text-decoration:none;font-weight:700"; }
function emailShell_(title, content) { return '<div style="background:#f5f1e8;padding:24px;font-family:Arial,sans-serif;color:#292524"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e7e5e4;border-radius:10px;overflow:hidden"><div style="background:#163d2b;color:#fff;padding:20px"><div style="font-family:Georgia,serif;font-size:24px">Tajweed Scholars</div><div>' + htmlEscape_(title) + '</div></div><div style="padding:24px;line-height:1.6">' + content + '</div><div style="padding:18px 24px;background:#fafaf9;color:#57534e;font-size:13px">Tajweed Scholars<br>Live private one-to-one Quran classes<br>tajweedscholar@gmail.com</div></div></div>'; }
function safeErrorCode_(error) { return String(error && (error.code || error.name) || "NOTIFICATION_ERROR").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 60); }
function safeErrorMessage_(error) { return safeErrorCode_(error); }
