document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token) { window.location.href = '/'; return; }
    if (role !== 'admin') { window.location.href = '/admin/dashboard'; return; }

    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'User';
    document.querySelector('.sidebar-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('show'));
    document.getElementById('btnLogout').addEventListener('click',()=>{ localStorage.clear(); location.href='/'; });

    loadCompany();
    loadSettings();

    document.getElementById('btnSaveCompany').addEventListener('click', saveCompany);
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);

    const fileInput = document.getElementById('e_logo_file');
    const preview = document.getElementById('e_logo_preview');
    const uploadBtn = document.getElementById('btnUploadLogo');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const f = fileInput.files && fileInput.files[0];
            if (!f) { preview.src=''; preview.classList.add('d-none'); return; }
            const max = 2 * 1024 * 1024;
            const okType = ['image/png','image/jpeg','image/jpg','image/gif'].includes(f.type);
            if (!okType) { setAlert('alertCompany','danger','Tipo de archivo no permitido. Usa PNG/JPG.'); fileInput.value=''; return; }
            if (f.size > max) { setAlert('alertCompany','danger','El archivo excede 2MB.'); fileInput.value=''; return; }
            const reader = new FileReader();
            reader.onload = e => { preview.src = e.target.result; preview.classList.remove('d-none'); };
            reader.readAsDataURL(f);
        });
    }
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadLogo);
    }
});

async function loadCompany(){
    try{
        const r = await fetch('/api/companies/me',{ headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` }});
        const j = await r.json();
        if(!r.ok) throw new Error(j.message||'Error cargando empresa');
        const e = j.data;
        document.getElementById('e_name').value = e.name || '';
        document.getElementById('e_tax_id').value = e.tax_id || '';
        document.getElementById('e_address').value = e.address || '';
        document.getElementById('e_phone').value = e.phone || '';
        document.getElementById('e_email').value = e.email || '';
        const preview = document.getElementById('e_logo_preview');
        if (preview) {
            fetch('/api/companies/logo', { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} })
                .then(r=> r.ok ? r.blob() : Promise.reject())
                .then(b=>{ preview.src = URL.createObjectURL(b); preview.classList.remove('d-none'); })
                .catch(()=> preview.classList.add('d-none'));
        }
    }catch(err){ setAlert('alertCompany', 'danger', err.message); }
}

async function loadSettings(){
    try{
        const r = await fetch('/api/companies/config',{ headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` }});
        const j = await r.json();
        if(!r.ok) throw new Error(j.message||'Error cargando configuración');
        const c = j.data;
        document.getElementById('c_cars').value = c.car_total_capacity || 0;
        document.getElementById('c_motos').value = c.motorcycle_total_capacity || 0;
        document.getElementById('c_bicis').value = c.bicycle_total_capacity || 0;
        document.getElementById('c_opening').value = (c.opening_time||'').toString().substring(0,5);
        document.getElementById('c_closing').value = (c.closing_time||'').toString().substring(0,5);
        document.getElementById('c_tax').value = c.vat_percentage || 0;
        document.getElementById('c_currency').value = c.currency || 'COP';
        document.getElementById('c_tz').value = c.timezone || 'America/Bogota';
        const chk = document.getElementById('c_24h');
        if (chk) {
            chk.checked = !!c.operation_24h;
            toggleHoursBy24h();
            chk.addEventListener('change', toggleHoursBy24h);
        }
    }catch(err){ setAlert('alertSettings', 'danger', err.message); }
}

async function saveCompany(){
    const payload = {
        name: document.getElementById('e_name').value.trim(),
        tax_id: document.getElementById('e_tax_id').value.trim(),
        address: document.getElementById('e_address').value.trim(),
        phone: document.getElementById('e_phone').value.trim(),
        email: document.getElementById('e_email').value.trim()
    };
    const btn = document.getElementById('btnSaveCompany');
    const prev = btn.innerHTML; btn.disabled = true; btn.innerHTML = spinner('Guardando...');
    try{
        const r = await fetch('/api/companies',{
            method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`}, body: JSON.stringify(payload)
        });
        const j = await r.json();
        if(!r.ok) throw new Error(j.message||'Error saving');
        setAlert('alertCompany', 'success', 'Datos de empresa actualizados.');
    }catch(err){ setAlert('alertCompany','danger', err.message); }
    finally{ btn.disabled=false; btn.innerHTML = prev; }
}

async function saveSettings(){
    const payload = {
        car_total_capacity: Number(document.getElementById('c_cars').value||0),
        motorcycle_total_capacity: Number(document.getElementById('c_motos').value||0),
        bicycle_total_capacity: Number(document.getElementById('c_bicis').value||0),
        opening_time: document.getElementById('c_opening').value,
        closing_time: document.getElementById('c_closing').value,
        vat_percentage: Number(document.getElementById('c_tax').value||0),
        currency: document.getElementById('c_currency').value.trim()||'COP',
        timezone: document.getElementById('c_tz').value.trim()||'America/Bogota',
        operation_24h: document.getElementById('c_24h').checked
    };
    const btn = document.getElementById('btnSaveSettings');
    const prev = btn.innerHTML; btn.disabled = true; btn.innerHTML = spinner('Guardando...');
    try{
        const r = await fetch('/api/companies/config',{
            method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`}, body: JSON.stringify(payload)
        });
        const j = await r.json();
        if(!r.ok) throw new Error(j.message||'Error saving');
        setAlert('alertSettings', 'success', 'Configuración actualizada.');
    }catch(err){ setAlert('alertSettings','danger', err.message); }
    finally{ btn.disabled=false; btn.innerHTML = prev; }
}

function toggleHoursBy24h(){
    const on = document.getElementById('c_24h').checked;
    document.getElementById('c_opening').disabled = on;
    document.getElementById('c_closing').disabled = on;
}

function setAlert(id, type, msg){
    const el = document.getElementById(id);
    el.className = `alert alert-${type}`;
    el.textContent = msg;
}

function spinner(text){
    return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`;
}

async function uploadLogo(){
    const file = document.getElementById('e_logo_file') && document.getElementById('e_logo_file').files[0];
    if (!file) { setAlert('alertCompany','warning','Selecciona un archivo de logo.'); return; }
    const btn = document.getElementById('btnUploadLogo');
    const prev = btn.innerHTML; btn.disabled = true; btn.innerHTML = spinner('Subiendo...');
    try{
        const form = new FormData();
        form.append('logo', file);
        const r = await fetch('/api/companies/logo', { method:'POST', headers:{ 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: form });
        const j = await r.json();
        if (!r.ok) throw new Error(j.message||'Error subiendo logo');
        setAlert('alertCompany','success','Logo subido y guardado.');
    }catch(err){ setAlert('alertCompany','danger', err.message); }
    finally{ btn.disabled=false; btn.innerHTML = prev; }
}
