(function() {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmzYhYYfJoshKHGW5U-APtmvTQMqlf9L3lzTlXfgDSE2WbU7-Oa9ZiI2nCrti6E60h/exec";

    // เช็คว่าอยู่หน้าไหน
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path.endsWith("index.html") || path === "/" || path.endsWith("/") || path === "";
    
    const userRaw = sessionStorage.getItem("cc_pr_user");
    
    // ถ้าไม่ได้ login แล้วเข้าหน้าอื่นที่ไม่ใช่ index → เด้งกลับ
    if (!userRaw && !isLoginPage) {
        alert("Access denied: ไม่อนุญาตให้เข้าถึงข้อมูลโดยตรง โปรดลงชื่อเข้าใช้");
        window.location.href = "index.html";
        return;
    }

    // แสดงโปรไฟล์ "เฉพาะ" หน้าที่ไม่ใช่ login
    if (userRaw && !isLoginPage) {
        const user = JSON.parse(userRaw);
        
        // สร้าง CSS
        const style = document.createElement('style');
        style.textContent = `
            .user-profile-wrap {
                position: fixed; top: 15px; right: 20px; z-index: 1000;
                font-family: 'Sarabun', sans-serif;
            }
            .user-profile-btn {
                background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
                padding: 8px 15px; border-radius: 100px;
                border: 1px solid rgba(8,145,178,0.2);
                display: flex; align-items: center; gap: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                cursor: pointer; transition: 0.3s;
                user-select: none;
            }
            .user-profile-btn:hover {
                box-shadow: 0 6px 20px rgba(8,145,178,0.15);
                transform: translateY(-1px);
            }
            .user-profile-menu {
                position: absolute; top: 55px; right: 0;
                background: white; border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                min-width: 200px; overflow: hidden;
                opacity: 0; pointer-events: none;
                transform: translateY(-10px);
                transition: 0.25s;
                border: 1px solid rgba(0,0,0,0.05);
            }
            .user-profile-menu.show {
                opacity: 1; pointer-events: auto;
                transform: translateY(0);
            }
            .user-profile-menu button {
                width: 100%; border: none; background: none;
                padding: 14px 18px; text-align: left;
                font-size: 14px; font-family: inherit;
                cursor: pointer; transition: 0.2s;
                display: flex; align-items: center; gap: 10px;
                color: #1e293b;
            }
            .user-profile-menu button:hover { background: #f1f5f9; }
            .user-profile-menu button.danger { color: #ef4444; border-top: 1px solid #f1f5f9; }
            .user-profile-menu button.danger:hover { background: #fef2f2; }

            /* Modal เปลี่ยนรหัส */
            .pw-modal-bg {
                position: fixed; inset: 0; background: rgba(0,0,0,0.4);
                z-index: 9999; display: none; align-items: center; justify-content: center;
                backdrop-filter: blur(5px);
            }
            .pw-modal-bg.show { display: flex; }
            .pw-modal {
                background: white; border-radius: 25px; padding: 35px;
                width: 90%; max-width: 420px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                font-family: 'Sarabun', sans-serif;
            }
            .pw-modal h2 { margin: 0 0 8px; color: #1e293b; font-size: 22px; }
            .pw-modal p.sub { color: #64748b; font-size: 13px; margin: 0 0 25px; }
            .pw-modal label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
            .pw-modal input { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 14px; margin-bottom: 15px; box-sizing: border-box; outline: none; font-family: inherit; }
            .pw-modal input:focus { border-color: #0891b2; }
            .pw-modal .actions { display: flex; gap: 10px; margin-top: 10px; }
            .pw-modal .btn { flex: 1; padding: 12px; border-radius: 12px; border: none; cursor: pointer; font-weight: 600; font-family: inherit; font-size: 14px; }
            .pw-modal .btn-cancel { background: #e2e8f0; color: #475569; }
            .pw-modal .btn-save { background: linear-gradient(135deg,#0891b2,#2563eb); color: white; }
            .pw-modal .btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .pw-modal .msg { margin-top: 10px; font-size: 13px; font-weight: 600; min-height: 18px; }
        `;
        document.head.appendChild(style);

        // สร้าง dropdown ปุ่ม
        const wrap = document.createElement('div');
        wrap.className = 'user-profile-wrap';
        wrap.innerHTML = `
            <div class="user-profile-btn" id="profileBtn">
                <div style="text-align:right;">
                    <div style="font-size:13px; font-weight:700; color:#1e293b;">${user.displayName}</div>
                    <div style="font-size:11px; color:#64748b;">${user.roleLabel}</div>
                </div>
                <div style="width:32px; height:32px; background:linear-gradient(135deg,#0891b2,#2563eb); border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;">${user.displayName.charAt(0)}</div>
            </div>
            <div class="user-profile-menu" id="profileMenu">
                <button id="btnChangePw">🔑 เปลี่ยนรหัสผ่าน</button>
                <button id="btnLogout" class="danger">🚪 ออกจากระบบ</button>
            </div>
        `;
        document.body.appendChild(wrap);

        // สร้าง Modal เปลี่ยนรหัส
        const modal = document.createElement('div');
        modal.className = 'pw-modal-bg';
        modal.id = 'pwModal';
        modal.innerHTML = `
            <div class="pw-modal">
                <h2>🔑 เปลี่ยนรหัสผ่าน</h2>
                <p class="sub">โปรดกรอกข้อมูลให้ครบถ้วน</p>
                <label>รหัสผ่านเดิม</label>
                <input type="password" id="pwOld" autocomplete="off">
                <label>รหัสผ่านใหม่</label>
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

        // === Event Handlers ===
        const btn = document.getElementById('profileBtn');
        const menu = document.getElementById('profileMenu');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target)) menu.classList.remove('show');
        });

        // ออกจากระบบ
        document.getElementById('btnLogout').addEventListener('click', () => {
            if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
                sessionStorage.removeItem("cc_pr_user");
                window.location.href = "index.html";
            }
        });

        // เปิด Modal เปลี่ยนรหัส
        document.getElementById('btnChangePw').addEventListener('click', () => {
            menu.classList.remove('show');
            document.getElementById('pwOld').value = '';
            document.getElementById('pwNew').value = '';
            document.getElementById('pwConfirm').value = '';
            document.getElementById('pwMsg').innerText = '';
            document.getElementById('pwModal').classList.add('show');
        });

        document.getElementById('pwCancel').addEventListener('click', () => {
            document.getElementById('pwModal').classList.remove('show');
        });

        // ปิด modal เมื่อคลิกพื้นหลัง
        document.getElementById('pwModal').addEventListener('click', (e) => {
            if (e.target.id === 'pwModal') {
                document.getElementById('pwModal').classList.remove('show');
            }
        });

        // บันทึกรหัสใหม่
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
                // หา username จาก displayName (ในการใช้งานจริงควรเก็บ username ด้วย)
                // เนื่องจาก sessionStorage เก็บแค่ displayName เราต้องหา username กลับ
                const accRes = await fetch(SCRIPT_URL + "?action=getAccounts");
                const accData = await accRes.json();
                let username = null;
                for (const key in accData.accounts) {
                    if (accData.accounts[key].displayName === user.displayName) {
                        username = key;
                        break;
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
                msg.innerText = '❌ เกิดข้อผิดพลาด: ' + err.message;
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = 'บันทึก';
            }
        });
    }

    // === ระบบความปลอดภัย (ใช้ทุกหน้าที่ล็อกอินแล้ว) ===
    if (!isLoginPage) {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                const u = userRaw ? JSON.parse(userRaw).displayName : "Unknown";
                fetch(SCRIPT_URL + "?action=sendAlertEmail&user=" + encodeURIComponent(u), {mode:'no-cors'});
                alert("🔒 ระบบความปลอดภัย: ไม่อนุญาตให้พิมพ์หรือบันทึกหน้าจอนี้\nระบบได้ส่งแจ้งเตือนไปยังผู้ดูแลเรียบร้อยแล้ว");
            }
        });
    }
})();
