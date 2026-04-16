// --- 1. ตรวจสอบการ Login ---
document.addEventListener("DOMContentLoaded", () => {
    const user = sessionStorage.getItem("cmul_user");
    
    // ถ้าไม่มีข้อมูล Login ให้เตะกลับหน้า index.html ทันที
    if (!user) {
        document.body.innerHTML = `
            <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: #fff; font-family: 'Noto Sans Thai', sans-serif;">
                <div style="text-align: center;">
                    <h2 style="color: #ef4444; margin-bottom: 10px;">Access Denied</h2>
                    <p>ไม่อนุญาตให้เข้าถึงข้อมูลโดยตรง โปรดลงชื่อเข้าใช้</p>
                    <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #0891b2; color: white; text-decoration: none; border-radius: 8px;">ไปหน้า Login</a>
                </div>
            </div>`;
        return;
    }

    // --- 2. สร้าง UI มุมขวาบน (ชื่อ-ตำแหน่ง) ---
    const userData = JSON.parse(user);
    const profileWidget = document.createElement('div');
    profileWidget.innerHTML = `
        <div style="position: fixed; top: 15px; right: 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 100px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid rgba(8,145,178,0.2); z-index: 9999; display: flex; align-items: center; gap: 10px; font-family: 'Noto Sans Thai', sans-serif;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0891b2, #2563eb); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                ${userData.name.charAt(0)}
            </div>
            <div style="line-height: 1.2;">
                <div style="font-size: 13px; font-weight: 700; color: #1a1d2e;">${userData.name}</div>
                <div style="font-size: 11px; color: #64748b;">${userData.position}</div>
            </div>
            <button onclick="logout()" style="margin-left: 10px; border: none; background: #fee2e2; color: #ef4444; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">ออก</button>
        </div>
    `;
    document.body.appendChild(profileWidget);
});

function logout() {
    sessionStorage.removeItem("cmul_user");
    window.location.href = "index.html";
}

// --- 3. ระบบรักษาความปลอดภัย Client-side ---
// ป้องกันคลิกขวา
document.addEventListener('contextmenu', event => event.preventDefault());

// ป้องกัน F12, Ctrl+Shift+I, Ctrl+U
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
       (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});

// ป้องกันการ Print ด้วย CSS (เพิ่ม Style ลงใน Head)
const printProtectStyle = document.createElement('style');
printProtectStyle.innerHTML = `@media print { body { display: none !important; } }`;
document.head.appendChild(printProtectStyle);
