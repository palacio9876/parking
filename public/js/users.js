// Frontend User Management (admin)
// Related to: public/admin/users.html and API /api/users

document.addEventListener('DOMContentLoaded', () => {
    // Auth and role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token) { window.location.href = '/'; return; }
    if (role !== 'admin') { window.location.href = '/admin/dashboard'; return; }

    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'User';
    document.querySelector('.sidebar-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('show'));
    document.getElementById('btnLogout').addEventListener('click',()=>{ localStorage.clear(); location.href='/'; });

    // Events
    document.getElementById('btnSaveUser').addEventListener('click', saveUser);

    // Load list
    loadUsers();
});

async function loadUsers(){
    try{
        const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||'Error listing users');
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = j.data.map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.username}</td>
                <td><span class="badge bg-${u.role==='admin'?'primary':'secondary'} text-uppercase">${u.role}</span></td>
                <td>${u.active ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
                <td>${u.last_access ? new Date(u.last_access).toLocaleString('en-US') : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick='editUser(${JSON.stringify(u)})'><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-warning me-1" onclick='openPasswordChange(${JSON.stringify({id:u.id_user, login:u.username, name:u.name})})'><i class="fas fa-key"></i></button>
                    <button class="btn btn-sm btn-danger" onclick='deactivateUser(${u.id_user})'><i class="fas fa-user-slash"></i></button>
                </td>
            </tr>
        `).join('');
    }catch(err){ toast('Error', err.message, 'error'); }
}

function editUser(u){
    document.getElementById('userId').value = u.id_user;
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('name').value = u.name;
    document.getElementById('username').value = u.username;
    document.getElementById('password').value = '';
    document.getElementById('role').value = u.role;
    document.getElementById('active').checked = !!u.active;
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

async function deactivateUser(id){
    if(!confirm('Deactivate this user?')) return;
    try{
        const res = await fetch(`/api/users/${id}`, { method:'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||'Error');
        toast('Success','User deactivated','success');
        loadUsers();
    }catch(err){ toast('Error', err.message, 'error'); }
}

async function saveUser(){
    const id = document.getElementById('userId').value;
    const body = {
        name: document.getElementById('name').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        active: document.getElementById('active').checked
    };
    // Frontend validations
    const errors = [];
    const usernameRegex = /^[A-Za-z0-9]+$/; // no spaces, dashes or special chars
    if (!body.name) errors.push('Name is required.');
    if (!body.username) errors.push('Username is required.');
    if (body.username && !usernameRegex.test(body.username)) errors.push('Username can only have letters and numbers (no spaces or dashes).');
    if (!id && !body.password) errors.push('Password is required.');
    if (body.password && body.password.length < 6) errors.push('Password must have at least 6 characters.');
    if (!['admin','operator'].includes(body.role)) errors.push('Select a valid role.');
    if (errors.length) { showFormErrors(errors); return; }
    clearFormErrors();
    
    // Loading indicator
    const btn = document.getElementById('btnSaveUser');
    const prevHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    if (id) { if (!body.password) { delete body.password; } }
    try{
        const res = await fetch(id ? `/api/users/${id}` : '/api/users', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(body)
        });
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||'Error saving user');
        toast('Success', id ? 'User updated' : 'User created', 'success');
        document.getElementById('userForm').reset();
        document.getElementById('userId').value='';
        document.getElementById('userModalTitle').textContent = 'New User';
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        loadUsers();
    }catch(err){ showFormErrors([err.message]); }
    finally {
        btn.disabled = false;
        btn.innerHTML = prevHtml;
    }
}

function toast(title, message, type){
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
    const t = new bootstrap.Toast(el, { delay: 3500 });
    t.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}

// UI helpers for form errors
function showFormErrors(messages){
    const cont = document.getElementById('userForm');
    // Reset states
    clearFormErrors();
    // Show general alert
    let alert = cont.querySelector('.alert');
    if (!alert) {
        alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        cont.prepend(alert);
    }
    alert.innerHTML = messages.map(m=>`<div>${m}</div>`).join('');
    // Mark fields if applicable
    const username = document.getElementById('username');
    const pass = document.getElementById('password');
    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (username.value && !usernameRegex.test(username.value)) username.classList.add('is-invalid');
    if (pass.value && pass.value.length < 6) pass.classList.add('is-invalid');
}

function clearFormErrors(){
    const cont = document.getElementById('userForm');
    const alert = cont.querySelector('.alert');
    if (alert) alert.remove();
    cont.querySelectorAll('.is-invalid').forEach(el=> el.classList.remove('is-invalid'));
}

// Password change - UI and logic. Related to modal #passwordModal in public/admin/users.html and endpoint PUT /api/users/:id
function openPasswordChange(data){
    // data: { id, login, name }
    document.getElementById('pwd_user_id').value = data.id;
    document.getElementById('pwd_user_login').value = `${data.login} (${data.name})`;
    document.getElementById('pwd_new').value = '';
    document.getElementById('pwd_confirm').value = '';
    const alert = document.getElementById('pwd_alert');
    alert.className = 'alert d-none';
    alert.textContent = '';
    // toggle show/hide
    const toggleBtn = document.getElementById('pwd_toggle');
    const inputPwd = document.getElementById('pwd_new');
    toggleBtn.onclick = ()=>{
        const t = inputPwd.type === 'password' ? 'text' : 'password';
        inputPwd.type = t;
        toggleBtn.innerHTML = t === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    };
    // Save
    document.getElementById('btnPwdSave').onclick = changePassword;
    new bootstrap.Modal(document.getElementById('passwordModal')).show();
}

async function changePassword(){
    const id = document.getElementById('pwd_user_id').value;
    const pass1 = document.getElementById('pwd_new').value;
    const pass2 = document.getElementById('pwd_confirm').value;
    const alert = document.getElementById('pwd_alert');
    // Validations
    const msgs = [];
    if (!pass1) msgs.push('New password is required.');
    if (pass1 && pass1.length < 6) msgs.push('Password must have at least 6 characters.');
    if (pass1 !== pass2) msgs.push('Passwords do not match.');
    if (msgs.length){
        alert.className = 'alert alert-danger';
        alert.innerHTML = msgs.map(m=>`<div>${m}</div>`).join('');
        return;
    }
    // API call
    const btn = document.getElementById('btnPwdSave');
    const prev = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    try{
        const res = await fetch(`/api/users/${id}`,{
            method:'PUT',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`},
            body: JSON.stringify({ password: pass1 })
        });
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||'Could not update password');
        alert.className = 'alert alert-success';
        alert.textContent = 'Password updated successfully.';
        setTimeout(()=>{
            bootstrap.Modal.getInstance(document.getElementById('passwordModal')).hide();
        }, 600);
    }catch(err){
        alert.className = 'alert alert-danger';
        alert.textContent = err.message;
    }finally{
        btn.disabled = false;
        btn.innerHTML = prev;
    }
}
