/**
 * RSVP collector for the invitation.
 *
 * Paste this into the Google Sheet that your RSVP Google Form is linked to
 * (Extensions → Apps Script), then run `setup` once. Every RSVP — accepted
 * via the form, declined via the invitation page — lands as one row in the
 * "RSVPs" tab, with a Status column.
 */

// Optional: email(s) to notify on every RSVP, comma-separated.
const NOTIFY = "";

const TAB = "RSVPs";
const HEADERS = ["Submitted at", "Status", "Name", "Email", "Phone", "Dietary preference", "Members"];

/** Run once from the editor: creates the RSVPs tab and the form trigger. */
function setup() {
  rsvpSheet_();
  const ss = SpreadsheetApp.getActive();
  const exists = ScriptApp.getProjectTriggers()
    .some(t => t.getHandlerFunction() === "recordAcceptance");
  if (!exists) {
    ScriptApp.newTrigger("recordAcceptance").forSpreadsheet(ss).onFormSubmit().create();
  }
}

/** Google Form submission → "Accepted" row. The form collects email
 *  ("Responder input"), then asks, in order: Name, Phone, Dietary
 *  preference, Members. */
function recordAcceptance(e) {
  const [, email, name, phone, diet, members] = e.values;
  addRow_("Accepted", name, email, phone, diet, members);
}

/** Decline from the invitation page → "Declined" row (name, optional email). */
function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.status === "Declined" && String(p.name || "").trim()) {
    addRow_("Declined", p.name, p.email, "", "", "");
  }
  return ContentService.createTextOutput("ok");
}

function addRow_(status, name, email, phone, diet, members) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // a leading = + - @ would make the sheet treat guest text as a formula
    const clean = v => String(v || "").trim().slice(0, 200).replace(/^[=+\-@]/, "'$&");
    const row = [new Date(), status, clean(name), clean(email), clean(phone), clean(diet), clean(members)];
    rsvpSheet_().appendRow(row);
  } finally {
    lock.releaseLock();
  }
  if (NOTIFY) {
    MailApp.sendEmail(NOTIFY, `RSVP: ${name} — ${status}`,
      [`Status: ${status}`, `Name: ${name}`, email && `Email: ${email}`, phone && `Phone: ${phone}`,
       diet && `Dietary preference: ${diet}`, members && `Members: ${members}`]
        .filter(Boolean).join("\n"));
  }
}

function rsvpSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TAB, 0);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}
