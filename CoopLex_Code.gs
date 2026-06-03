// ============================================================
//  CoopLex — ศูนย์กฎหมายสหกรณ์ | Cooperative Law Center
//  Google Apps Script — Code.gs
//
//  © Copyright 2025 Ruangchai Phonput (เรืองชัย โพนพุฒ)
//  All rights reserved. Unauthorized copying, modification,
//  distribution, or use of this software, in whole or in part,
//  without the prior written permission of the copyright owner
//  is strictly prohibited.
// ============================================================

const SHEET_ID = '1YnH6H3-hMy99OTGizX09fP9FAGnhXYuh0BjO7Od13vc';
const SHEET_NAME = 'รวมข้อมูล'; // ← เปลี่ยนถ้า sheet มีชื่อต่างกัน
const ADMIN_PASSWORD = 'admin1234'; // ← เปลี่ยนรหัสผ่านก่อนใช้งานจริง

// ── Entry point ──────────────────────────────────────────────
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CoopLex · ศูนย์กฎหมายสหกรณ์')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ── Data helpers ─────────────────────────────────────────────
function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
      || SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
}

function getAllData() {
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();
  const data  = [];
  for (let i = 1; i < rows.length; i++) {
    const [category, date, title, url] = rows[i];
    if (!title) continue;
    data.push({ id: i, category: String(category).trim(),
                date: String(date).trim(), title: String(title).trim(),
                url: String(url).trim() });
  }
  return data;
}

function searchData(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return getAllData();
  return getAllData().filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q) ||
    r.date.includes(q)
  );
}

function getCategories() {
  const cats = [...new Set(getAllData().map(r => r.category).filter(Boolean))];
  return cats.sort();
}

// ── Admin CRUD ────────────────────────────────────────────────
function verifyAdmin(password) {
  return password === ADMIN_PASSWORD;
}

function addRow(password, category, date, title, url) {
  if (!verifyAdmin(password)) return { ok: false, msg: 'รหัสผ่านไม่ถูกต้อง' };
  const sheet = getSheet();
  sheet.appendRow([category, date, title, url]);
  return { ok: true };
}

function updateRow(password, rowIndex, category, date, title, url) {
  if (!verifyAdmin(password)) return { ok: false, msg: 'รหัสผ่านไม่ถูกต้อง' };
  const sheet = getSheet();
  const sheetRow = Number(rowIndex) + 1; // header offset
  sheet.getRange(sheetRow, 1, 1, 4).setValues([[category, date, title, url]]);
  return { ok: true };
}

function deleteRow(password, rowIndex) {
  if (!verifyAdmin(password)) return { ok: false, msg: 'รหัสผ่านไม่ถูกต้อง' };
  const sheet = getSheet();
  sheet.deleteRow(Number(rowIndex) + 1);
  return { ok: true };
}
