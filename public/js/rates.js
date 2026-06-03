document.addEventListener('DOMContentLoaded', () => {
    // Role guard: admin only
    if (localStorage.getItem('userRole') !== 'admin') { window.location.href = '/admin/dashboard'; return; }
    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'User';
    document.querySelector('.sidebar-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('show'));
    document.getElementById('btnLogout').addEventListener('click',()=>{localStorage.clear(); location.href='/';});

    loadRates();

    // Enable/disable fields based on mode
    const mode = document.getElementById('billing_mode');
    const fToggle = () => {
        const m = mode.value;
        const inMin = m === 'minute' || m === 'mixed';
        const inHour = m === 'hour' || m === 'mixed';
        const inDay = m === 'day' || m === 'mixed';
        document.getElementById('minute_rate').disabled = !inMin;
        document.getElementById('hourly_rate').disabled = !inHour;
        document.getElementById('full_day_rate').disabled = !inDay;
        const scales = m === 'mixed';
        document.getElementById('minute_to_hour_threshold').disabled = !scales;
        document.getElementById('hour_to_day_threshold').disabled = !scales;
        document.getElementById('hour_rounding').disabled = !scales;
        document.getElementById('day_rounding').disabled = !scales;
    };
    mode.addEventListener('change', fToggle);
    fToggle();

    document.getElementById('rateForm').addEventListener('submit', async (e)=>{
        e.preventDefault();
        const body = {
            vehicle_type: document.getElementById('vehicle_type').value,
            billing_mode: document.getElementById('billing_mode').value,
            minute_rate: parseFloat(document.getElementById('minute_rate').value||0),
            hourly_rate: parseFloat(document.getElementById('hourly_rate').value||0),
            full_day_rate: parseFloat(document.getElementById('full_day_rate').value||0),
            minute_to_hour_threshold: parseInt(document.getElementById('minute_to_hour_threshold').value||0, 10),
            hour_to_day_threshold: parseInt(document.getElementById('hour_to_day_threshold').value||0, 10),
            hour_rounding: document.getElementById('hour_rounding').value,
            day_rounding: document.getElementById('day_rounding').value
        };
        try{
            const res = await fetch('/api/rates', {
                method: 'PUT',
                headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(body)
            });
            const j = await res.json();
            if(!res.ok) throw new Error(j.message||'Could not save');
            showToast('Success','Rate saved','success');
            loadRates();
        }catch(err){
            showToast('Error', err.message, 'error');
        }
    });
});

async function loadRates(){
    try{
        const res = await fetch('/api/rates/current', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||'Error loading rates');
        const ul = document.getElementById('ratesList');
        ul.innerHTML = j.data.map(t => `
            <li class="list-group-item d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="text-capitalize">${t.vehicle_type}</strong>
                    <span class="badge bg-primary">${t.billing_mode}</span>
                </div>
                <small>Min: ${t.minute_rate} | Hour: ${t.hourly_rate} | Day: ${t.full_day_rate}</small>
                <small>Scales → min→hr: ${t.minute_to_hour_threshold} min, hr→day: ${t.hour_to_day_threshold} h</small>
            </li>
        `).join('');
    }catch(err){
        showToast('Error', err.message, 'error');
    }
}

function showToast(title, message, type) {
    const container = document.getElementById('toastContainer');
    const id = 't_' + Date.now();
    const typeClass = type==='success' ? 'toast-success' : type==='warning' ? 'toast-warning' : type==='info' ? 'toast-info' : 'toast-error';
    const el = document.createElement('div');
    el.className = `toast align-items-center toast-custom ${typeClass}`;
    el.id = id;
    el.role = 'alert';
    el.ariaLive = 'assertive';
    el.ariaAtomic = 'true';
    el.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    container.appendChild(el);
    const toast = new bootstrap.Toast(el, { delay: 3500 });
    toast.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}
