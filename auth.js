(function() {
    // ============================================
    // ⭐ แก้ตรงนี้: วาง URL ที่ได้จาก Apps Script Deploy
    // (ต้องเป็น URL เดียวกับใน index.html และ dashboard.html)
    // ============================================
    const SCRIPT_URL = ""https://script.google.com/macros/s/AKfycbzmzYhYYfJoshKHGW5U-APtmvTQMqlf9L3lzTlXfgDSE2WbU7-Oa9ZiI2nCrti6E60h/exec"
 // ============================================================
// 🎯 Apps Script สำหรับ CMUL PR Dashboard
// สร้างขึ้นใหม่ - พร้อมใช้งานทันที
//
// 📋 โครงสร้าง Google Sheet ที่รองรับ:
// ต้องมี Tab ชื่อ "accounts" โครงสร้างดังนี้:
//
// ┌──────────┬──────────┬───────┬──────────┐
// │    A     │    B     │   C   │    D     │
// ├──────────┼──────────┼───────┼──────────┤
// │ Username │ Password │ Name  │ Position │  ← แถว 1 (หัวตาราง)
// │ thian    │ 1234     │ คุณ..│ ผู้ดูแล  │  ← แถว 2+
// └──────────┴──────────┴───────┴──────────┘
// ============================================================

const SHEET_NAME = "accounts"; 
const DEFAULT_PASSWORD = "password123";
const ALERT_EMAIL = "thianrawich.ph@gmail.com";

// ตำแหน่งคอลัมน์ (นับจาก 0)
const COL_USERNAME = 0;  // A
const COL_PASSWORD = 1;  // B
const COL_NAME     = 2;  // C
const COL_POSITION = 3;  // D


// ============================================================
// 🧪 ฟังก์ชันทดสอบ - Run ตัวนี้ก่อน Deploy
// ============================================================
function TEST_checkSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log("════════════════════════════════════════");
  Logger.log("📁 ชื่อไฟล์: " + ss.getName());
  Logger.log("🔗 URL: " + ss.getUrl());
  Logger.log("📑 Tab ทั้งหมด: " + ss.getSheets().map(s => s.getName()).join(" | "));
  Logger.log("════════════════════════════════════════");
  
  const sheet = findSheetByName(ss, SHEET_NAME);
  if (!sheet) {
    Logger.log("❌ ไม่พบ Tab ชื่อ '" + SHEET_NAME + "'");
    Logger.log("→ แก้ไข: สร้าง/เปลี่ยนชื่อ Tab เป็น 'accounts'");
    return;
  }
  
  Logger.log("✅ พบ Tab 'accounts'");
  const headers = sheet.getRange(1, 1, 1, 4).getValues()[0];
  Logger.log("📋 หัวตาราง: A=" + headers[0] + " | B=" + headers[1] + " | C=" + headers[2] + " | D=" + headers[3]);
  
  const accounts = getAccountsFromSheet(sheet);
  const count = Object.keys(accounts).length;
  Logger.log("👥 พบผู้ใช้ " + count + " คน:");
  Logger.log(JSON.stringify(accounts, null, 2));
  
  if (count > 0) {
    Logger.log("════════════════════════════════════════");
    Logger.log("🎉 ระบบพร้อม Deploy แล้ว!");
  }
}


// ============================================================
// 📡 Main Endpoints
// ============================================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = findSheetByName(ss, SHEET_NAME);
    
    if (!sheet) {
      const existingSheets = ss.getSheets().map(s => s.getName()).join(", ");
      return createJsonResponse({ 
        success: false, 
        message: "ไม่พบ Sheet '" + SHEET_NAME + "' | มีอยู่: " + existingSheets 
      });
    }

    // 1. ดึงข้อมูลบัญชี
    if (action === "getAccounts") {
      return createJsonResponse({ 
        success: true, 
        accounts: getAccountsFromSheet(sheet) 
      });
    }
    
    // 2. รีเซ็ตรหัสผ่าน
    if (action === "resetPassword") {
      const user = (e.parameter.username || "").trim().toLowerCase();
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][COL_USERNAME].toString().trim().toLowerCase() === user) {
          sheet.getRange(i + 1, COL_PASSWORD + 1).setValue(DEFAULT_PASSWORD); 
          return createJsonResponse({ 
            success: true, 
            message: "รีเซ็ตรหัสผ่านเป็น " + DEFAULT_PASSWORD + " เรียบร้อยแล้ว" 
          });
        }
      }
      return createJsonResponse({ success: false, message: "ไม่พบชื่อผู้ใช้งานในระบบ" });
    }

    // 3. ดึงรายงาน HTML
    if (action === 'getReportContent') {
      const reportSheet = findSheetByName(ss, "2026-SEO MAR-html-embed"); 
      if (!reportSheet) {
        return ContentService.createTextOutput("ไม่พบหน้าข้อมูลรายงาน")
          .setMimeType(ContentService.MimeType.TEXT);
      }
      const htmlContent = reportSheet.getRange("A1").getValue(); 
      return ContentService.createTextOutput(htmlContent)
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 4. ส่งเมลแจ้งเตือน
    if (action === "sendAlertEmail") {
      const user = e.parameter.user || "ไม่ระบุตัวตน";
      const time = new Date().toLocaleString("th-TH", {timeZone: "Asia/Bangkok"});
      MailApp.sendEmail(ALERT_EMAIL, 
        "🚨 แจ้งเตือนความปลอดภัย: พยายามสั่งพิมพ์/บันทึกหน้าจอ", 
        "ผู้ใช้งาน: " + user + "\nเวลา: " + time + "\nระบบ: PR CMUL Dashboard");
      return createJsonResponse({ success: true });
    }

    return createJsonResponse({ success: false, message: "ไม่รู้จัก action: " + action });
    
  } catch (err) {
    return createJsonResponse({ success: false, message: "Server Error: " + err.message });
  }
}

function doPost(e) {
  try {
    if (e.parameter.action === "changePassword") {
      const user = (e.parameter.username || "").trim().toLowerCase();
      const oldPass = (e.parameter.oldPassword || "").trim();
      const newPass = (e.parameter.newPassword || "").trim();
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = findSheetByName(ss, SHEET_NAME);
      
      if (!sheet) return createJsonResponse({ success: false, message: "ไม่พบ Sheet" });
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][COL_USERNAME].toString().trim().toLowerCase() === user) {
          if (data[i][COL_PASSWORD].toString().trim() === oldPass) {
            sheet.getRange(i + 1, COL_PASSWORD + 1).setValue(newPass);
            return createJsonResponse({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
          }
          return createJsonResponse({ success: false, message: "รหัสผ่านเดิมไม่ถูกต้อง" });
        }
      }
      return createJsonResponse({ success: false, message: "ไม่พบผู้ใช้" });
    }
    return createJsonResponse({ success: false, message: "ไม่รู้จัก action" });
  } catch (err) {
    return createJsonResponse({ success: false, message: "Server Error: " + err.message });
  }
}


// ============================================================
// 🛠️ Helper Functions
// ============================================================
function getAccountsFromSheet(sheet) {
  const data = sheet.getDataRange().getValues();
  const accounts = {};
  
  for (let i = 1; i < data.length; i++) {
    const user = (data[i][COL_USERNAME] || "").toString().trim().toLowerCase();
    if (user) {
      accounts[user] = {
        password:    (data[i][COL_PASSWORD] || "").toString().trim(),
        displayName: (data[i][COL_NAME]     || "").toString().trim(),
        role:        "admin",
        roleLabel:   (data[i][COL_POSITION] || "").toString().trim()
      };
    }
  }
  return accounts;
}

function findSheetByName(ss, name) {
  const targetName = name.trim().toLowerCase();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === targetName) {
      return sheets[i];
    }
  }
  return null;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
}
";
    // ============================================

    // 1. ตรวจสอบการเข้าถึง
    const userRaw = sessionStorage.getItem("cc_pr_user");
    if (!userRaw && !window.location.pathname.endsWith("index.html") && window.location.pathname !== "/" && !window.location.pathname.endsWith("/")) {
        alert("Access denied: ไม่อนุญาตให้เข้าถึงข้อมูลโดยตรง โปรดลงชื่อเข้าใช้");
        window.location.href = "index.html";
        return;
    }

    if (userRaw) {
        const user = JSON.parse(userRaw);
        const profile = document.createElement('div');
        profile.style.cssText = "position:fixed; top:15px; right:20px; z-index:1000; background:rgba(255,255,255,0.9); backdrop-filter:blur(10px); padding:8px 15px; border-radius:100px; border:1px solid rgba(8,145,178,0.2); display:flex; align-items:center; gap:10px; font-family:'Sarabun',sans-serif; box-shadow:0 4px 15px rgba(0,0,0,0.05);";
        profile.innerHTML = `
            <div style="text-align:right;">
                <div style="font-size:13px; font-weight:700; color:#1e293b;">${user.displayName}</div>
                <div style="font-size:11px; color:#64748b;">${user.roleLabel}</div>
            </div>
            <div style="width:32px; height:32px; background:linear-gradient(135deg,#0891b2,#2563eb); border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;">${user.displayName.charAt(0)}</div>
        `;
        document.body.appendChild(profile);
    }

    // 2. ระบบรักษาความปลอดภัย
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            const user = userRaw ? JSON.parse(userRaw).displayName : "Unknown";
            if (SCRIPT_URL.indexOf("วาง_URL") === -1) {
                fetch(`${SCRIPT_URL}?action=sendAlertEmail&user=${encodeURIComponent(user)}`, {mode:'no-cors'});
            }
            alert("🔒 ระบบความปลอดภัย: ไม่อนุญาตให้พิมพ์หรือบันทึกหน้าจอนี้\nระบบได้ส่งแจ้งเตือนไปยังผู้ดูแลเรียบร้อยแล้ว");
        }
    });
})();
