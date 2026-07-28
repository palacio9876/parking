document.addEventListener('DOMContentLoaded', async () => {
    const img = document.getElementById('sidebarLogo');
    if (!img) return;
    const token = localStorage.getItem('token');
    if (!token) return;
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
