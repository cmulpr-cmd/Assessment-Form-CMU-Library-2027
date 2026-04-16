(function() {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmzYhYYfJoshKHGW5U-APtmvTQMqlf9L3lzTlXfgDSE2WbU7-Oa9ZiI2nCrti6E60h/exec";

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
        profile.innerHTML = '<div style="text-align:right;"><div style="font-size:13px; font-weight:700; color:#1e293b;">' + user.displayName + '</div><div style="font-size:11px; color:#64748b;">' + user.roleLabel + '</div></div><div style="width:32px; height:32px; background:linear-gradient(135deg,#0891b2,#2563eb); border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;">' + user.displayName.charAt(0) + '</div>';
        document.body.appendChild(profile);
    }

    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            const user = userRaw ? JSON.parse(userRaw).displayName : "Unknown";
            fetch(SCRIPT_URL + "?action=sendAlertEmail&user=" + encodeURIComponent(user), {mode:'no-cors'});
            alert("🔒 ระบบความปลอดภัย: ไม่อนุญาตให้พิมพ์หรือบันทึกหน้าจอนี้\nระบบได้ส่งแจ้งเตือนไปยังผู้ดูแลเรียบร้อยแล้ว");
        }
    });
})();
