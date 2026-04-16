// ═══════════════════════════════════════════════════════════════════════════
// 🔐 auth.js - ระบบยืนยันตัวตน + โปรไฟล์ผู้ใช้ (ลอยมุมขวาบน)
// ═══════════════════════════════════════════════════════════════════════════
// วิธีใช้: ใส่ <script src="auth.js"></script> ไว้ก่อน </body> ในทุกหน้า
// ที่ต้องการให้ login ก่อนเข้าได้ (ยกเว้น index.html)
// ═══════════════════════════════════════════════════════════════════════════

(function() {
    // ⭐ ต้องตรงกับใน index.html
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxz2YclGvdzi8VXzLAF1tAcUDLwsvkeSAl0c9mfMjixepDSMndyzUgHSHvXuInpyPJ_/exec";

    // ตรวจสอบว่าอยู่หน้า login หรือเปล่า
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path.endsWith('index.html') || path === '/' || path.endsWith('/') || path === '';

    if (isLoginPage) return; // หน้า login ไม่ต้องทำอะไร

    const userRaw = sessionStorage.getItem("cc_pr_user");

    // ไม่ได้ login → เด้งกลับ index.html
    if (!userRaw) {
        alert("⚠️ Access denied: โปรดลงชื่อเข้าใช้ก่อน");
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(userRaw);

    // ═══════════════════════════════════════════════════════════════════════
    // 🎨 CSS
    // ═══════════════════════════════════════════════════════════════════════
    const style = document.createElement('style');
    style.textContent = `
        .user-profile-wrap {
            position: fixed !important;
            top: 15px !important;
            right: 20px !important;
            z-index: 9998 !important;
            font-family: 'Sarabun', sans-serif;
        }
        .user-profile-btn {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            padding: 8px 14px 8px 18px;
            border-radius: 100px;
            border: 1px solid rgba(8,145,178,0.2);
            display: flex; align-items: center; gap: 10px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25,1,0.5,1);
            user-select: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        }
        .user-profile-btn:hover {
            border-color: rgba(8,145,178,0.4);
            box-shadow: 0 6px 20px rgba(8,145,178,0.15);
            transform: translateY(-1px);
        }
        .user-profile-btn .u-info { text-align: right; line-height: 1.2; }
        .user-profile-btn .u-name { font-size: 13px; font-weight: 700; color: #1e293b; }
        .user-profile-btn .u-role { font-size: 11px; color: #64748b; margin-top: 1px; }
        .user-profile-btn .u-avatar {
            width: 32px; height: 32px;
            background: linear-gradient(135deg, #0891b2, #2563eb);
            border-radius: 50%; color: white;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 14px;
            flex-shrink: 0;
        }
        .user-profile-btn .u-chevron {
            width: 14px; height: 14px; color: #94a3b8;
            transition: transform 0.25s;
        }
        .user-profile-wrap.open .u-chevron { transform: rotate(180deg); }

        .user-profile-menu {
            position: absolute; top: calc(100% + 10px); right: 0;
            background: white; border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04);
            min-width: 220px; overflow: hidden;
            opacity: 0; pointer-events: none;
            transform: translateY(-8px) scale(0.97);
            transition: 0.25s cubic-bezier(0.25,1,0.5,1);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .user-profile-menu.show {
            opacity: 1; pointer-events: auto;
            transform: translateY(0) scale(1);
        }
        .menu-header {
            padding: 16px 18px 14px;
            background: linear-gradient(135deg, rgba(8,145,178,0.06), rgba(37,99,235,0.06));
            border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .menu-header-name { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
        .menu-header-role { font-size: 11px; color: #64748b; }
        .user-profile-menu button {
            width: 100%; border: none; background: none;
            padding: 13px 18px; text-align: left;
            font-size: 14px; font-family: inherit; font-weight: 500;
            cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; gap: 12px;
            color: #334155;
        }
        .user-profile-menu button:hover { background: #f8fafc; color: #0891b2; }
        .user-profile-menu button.danger { color: #ef4444; border-top: 1px solid #f1f5f9; }
        .user-profile-menu button.danger:hover { background: #fef2f2; color: #dc2626; }

        /* === Modal เปลี่ยนรหัสผ่าน === */
        .pw-modal-bg {
            position: fixed; inset: 0; background: rgba(15,23,42,0.4);
            z-index: 9999; display: none;
            align-items: center; justify-content: center;
            backdrop-filter: blur(8px);
            animation: pwModalFadeIn 0.3s ease;
        }
        .pw-modal-bg.show { display: flex; }
        @keyframes pwModalFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .pw-modal {
            background: white; border-radius: 28px; padding: 38px;
            width: 92%; max-width: 440px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.25);
            font-family: 'Sarabun', sans-serif;
            animation: pwModalSlideIn 0.4s cubic-bezier(0.25,1,0.5,1);
        }
        @keyframes pwModalSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pw-modal h2 {
            margin: 0 0 6px; color: #1e293b; font-size: 22px; font-weight: 800;
            display: flex; align-items: center; gap: 10px;
        }
        .pw-modal p.sub { color: #64748b; font-size: 13px; margin: 0 0 28px; }
        .pw-modal label {
            display: block; font-size: 13px; font-weight: 600;
            color: #475569; margin-bottom: 7px;
        }
        .pw-modal input {
            width: 100%; padding: 13px 16px;
            border: 1.5px solid #e2e8f0; border-radius: 13px;
            font-size: 14px; margin-bottom: 16px;
            box-sizing: border-box; outline: none;
            font-family: inherit;
            transition: all 0.2s;
        }
        .pw-modal input:focus {
            border-color: #0891b2;
            box-shadow: 0 0 0 4px rgba(8,145,178,0.1);
        }
        .pw-modal .msg { margin-top: 4px; margin-bottom: 12px; font-size: 13px; font-weight: 600; min-height: 20px; }
        .pw-modal .actions { display: flex; gap: 10px; margin-top: 6px; }
        .pw-modal .btn {
            flex: 1; padding: 13px; border-radius: 13px;
            border: none; cursor: pointer; font-weight: 700;
            font-family: inherit; font-size: 14px;
            transition: all 0.25s;
        }
        .pw-modal .btn-cancel { background: #f1f5f9; color: #64748b; }
        .pw-modal .btn-cancel:hover { background: #e2e8f0; color: #334155; }
        .pw-modal .btn-save {
            background: linear-gradient(135deg, #0891b2, #2563eb);
            color: white;
            box-shadow: 0 4px 14px rgba(8,145,178,0.25);
        }
        .pw-modal .btn-save:hover:not(:disabled) {
            box-shadow: 0 8px 20px rgba(8,145,178,0.35);
            transform: translateY(-1px);
        }
        .pw-modal .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    // ═══════════════════════════════════════════════════════════════════════
    // 👤 สร้างโปรไฟล์ลอยมุมขวาบน
    // ═══════════════════════════════════════════════════════════════════════
    const profileWrap = document.createElement('div');
    profileWrap.className = 'user-profile-wrap';
    profileWrap.innerHTML = `
        <div class="user-profile-btn" id="profileBtn">
            <div class="u-info">
                <div class="u-name">${escapeHtml(user.displayName)}</div>
                <div class="u-role">${escapeHtml(user.roleLabel)}</div>
            </div>
            <div class="u-avatar">${escapeHtml(user.displayName.charAt(0))}</div>
            <svg class="u-chevron" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </div>
        <div class="user-profile-menu" id="profileMenu">
            <div class="menu-header">
                <div class="menu-header-name">${escapeHtml(user.displayName)}</div>
                <div class="menu-header-role">${escapeHtml(user.roleLabel)}</div>
            </div>
            <button id="btnChangePw">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                เปลี่ยนรหัสผ่าน
            </button>
            <button id="btnLogout" class="danger">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                ออกจากระบบ
            </button>
        </div>
    `;
    document.body.appendChild(profileWrap);

    // ═══════════════════════════════════════════════════════════════════════
    // 🪟 สร้าง Modal เปลี่ยนรหัสผ่าน
    // ═══════════════════════════════════════════════════════════════════════
    const modal = document.createElement('div');
    modal.className = 'pw-modal-bg';
    modal.id = 'pwModal';
    modal.innerHTML = `
        <div class="pw-modal" onclick="event.stopPropagation()">
            <h2>🔑 เปลี่ยนรหัสผ่าน</h2>
            <p class="sub">โปรดกรอกข้อมูลให้ครบถ้วน</p>
            <label>รหัสผ่านเดิม</label>
            <input type="password" id="pwOld" autocomplete="off">
            <label>รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <input type="password" id="pwNew" autocomplete="off">
            <label>ยืนยันรหัสผ่านใหม่</label>
            <input type="password" id="pwConfirm" autocomplete="off">
            <div class="msg" id="pwMsg"></div>
            <div class="actions">
                <button class="btn btn-cancel" id="pwCancel">ยกเลิก</button>
                <button class="btn btn-save" id="pwSave">บันทึก</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // ═══════════════════════════════════════════════════════════════════════
    // 🖱️ Event Handlers
    // ═══════════════════════════════════════════════════════════════════════
    const btn = document.getElementById('profileBtn');
    const menu = document.getElementById('profileMenu');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
        profileWrap.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!profileWrap.contains(e.target)) {
            menu.classList.remove('show');
            profileWrap.classList.remove('open');
        }
    });

    // 🚪 Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            sessionStorage.removeItem("cc_pr_user");
            window.location.href = "index.html";
        }
    });

    // 🔑 เปิด Modal เปลี่ยนรหัส
    document.getElementById('btnChangePw').addEventListener('click', () => {
        menu.classList.remove('show');
        profileWrap.classList.remove('open');
        document.getElementById('pwOld').value = '';
        document.getElementById('pwNew').value = '';
        document.getElementById('pwConfirm').value = '';
        document.getElementById('pwMsg').innerText = '';
        document.getElementById('pwModal').classList.add('show');
    });

    document.getElementById('pwCancel').addEventListener('click', () => {
        document.getElementById('pwModal').classList.remove('show');
    });

    document.getElementById('pwModal').addEventListener('click', (e) => {
        if (e.target.id === 'pwModal') {
            document.getElementById('pwModal').classList.remove('show');
        }
    });

    // 💾 บันทึกรหัสใหม่
    document.getElementById('pwSave').addEventListener('click', async () => {
        const oldPw = document.getElementById('pwOld').value.trim();
        const newPw = document.getElementById('pwNew').value.trim();
        const confirmPw = document.getElementById('pwConfirm').value.trim();
        const msg = document.getElementById('pwMsg');
        const saveBtn = document.getElementById('pwSave');

        msg.style.color = '#ef4444';
        if (!oldPw || !newPw || !confirmPw) { msg.innerText = '❌ โปรดกรอกข้อมูลให้ครบ'; return; }
        if (newPw.length < 6) { msg.innerText = '❌ รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร'; return; }
        if (newPw !== confirmPw) { msg.innerText = '❌ รหัสผ่านใหม่ไม่ตรงกัน'; return; }
        if (oldPw === newPw) { msg.innerText = '❌ รหัสผ่านใหม่ต้องไม่เหมือนเดิม'; return; }

        saveBtn.disabled = true;
        saveBtn.innerText = 'กำลังบันทึก...';
        msg.style.color = '#64748b';
        msg.innerText = 'กำลังอัปเดต...';

        try {
            let username = user.username;
            if (!username) {
                const accRes = await fetch(SCRIPT_URL + "?action=getAccounts");
                const accData = await accRes.json();
                for (const key in accData.accounts) {
                    if (accData.accounts[key].displayName === user.displayName) {
                        username = key; break;
                    }
                }
            }
            if (!username) throw new Error("ไม่พบข้อมูลผู้ใช้");

            const formData = new URLSearchParams();
            formData.append('action', 'changePassword');
            formData.append('username', username);
            formData.append('oldPassword', oldPw);
            formData.append('newPassword', newPw);

            const res = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
            const d = await res.json();

            if (d.success) {
                msg.style.color = '#059669';
                msg.innerText = '✅ ' + d.message;
                setTimeout(() => {
                    document.getElementById('pwModal').classList.remove('show');
                }, 1500);
            } else {
                msg.style.color = '#ef4444';
                msg.innerText = '❌ ' + d.message;
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.innerText = '❌ ' + err.message;
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = 'บันทึก';
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🔒 ระบบความปลอดภัย
    // ═══════════════════════════════════════════════════════════════════════
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            const uName = user.displayName || "Unknown";
            fetch(SCRIPT_URL + "?action=sendAlertEmail&user=" + encodeURIComponent(uName), {mode:'no-cors'});
            alert("🔒 ระบบความปลอดภัย: ไม่อนุญาตให้พิมพ์หรือบันทึกหน้าจอนี้\nระบบได้ส่งแจ้งเตือนไปยังผู้ดูแลเรียบร้อยแล้ว");
        }
    });

    // Helper
    function escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
})();
