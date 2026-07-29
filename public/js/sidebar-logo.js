document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch company name
    try {
        const res = await fetch('/api/companies/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) {
            const j = await res.json();
            const name = j.data?.name || j.name || '';
            const titleEl = document.querySelector('.sidebar-header h5');
            if (titleEl && name) titleEl.textContent = name;
            if (name) document.title = document.title.replace(/^ParkSystem/, name);
        }
    } catch (_) {}

    // Fetch logo
    const img = document.getElementById('sidebarLogo');
    if (!img) return;
    try {
        const res = await fetch('/api/companies/logo', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise(resolve => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.readAsDataURL(blob);
        });
        img.src = dataUrl;
        img.style.display = 'block';
        const text = img.parentElement.querySelector('.logo-text');
        if (text) text.style.display = 'none';
    } catch (_) {}
});
