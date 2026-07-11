document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }

    // Sidebar configuration
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // Close sidebar when clicking outside on mobile devices
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });

    // Show user name and hide admin menus for operators
    const nameEl = document.getElementById('userName');
    if (nameEl) {
        nameEl.textContent = localStorage.getItem('userName') || 'User';
    }
    const role = localStorage.getItem('userRole');
    if (role === 'operator') {
        document.querySelectorAll('.sidebar-nav a[href^="/admin/"]').forEach(link => {
            const href = link.getAttribute('href')
            if (href === '/admin/dashboard') {
                link.setAttribute('href', '/operator/dashboard')
            } else if (href === '/admin/entry-exit') {
                link.setAttribute('href', '/operator/entry-exit')
            }
        })
    }
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    }

    // Logout handling
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('companyId');
        localStorage.removeItem('companyTax');
        window.location.href = '/';
    };

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);
    const logoutDropdown = document.getElementById('logoutDropdown');
    if (logoutDropdown) logoutDropdown.addEventListener('click', handleLogout);

    // Load dashboard data
    loadDashboardData();
});

let __page = 0;

// Simple company cache for printing
let __companyInfo = null;
async function getCompanyInfo() {
    if (__companyInfo) return __companyInfo;
    try {
        const r = await fetch('/api/companies/me', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        const j = await r.json();
        if (r.ok) __companyInfo = j.data;
    } catch (_) {}
    return __companyInfo;
}

// Función para cargar los datos del dashboard
async function loadDashboardData() {
    try {
        const response = await fetch(`/api/dashboard/stats?page=${__page}&pageSize=5`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            showToast('Sesión expirada', 'Por favor inicia sesión nuevamente', 'warning');
            localStorage.clear();
            setTimeout(()=> location.href='/', 1200);
            return;
        }

        if (!response.ok) {
            throw new Error('Error al cargar los datos del dashboard');
        }

        const resData = await response.json();
        const data = resData.data;
        updateDashboardStats(data);
        updateRecentActivity(data.recentActivity);
        const btnNext = document.getElementById('btnNext');
        const btnPrev = document.getElementById('btnPrev');
        const pageInfo = document.getElementById('pageInfo');
        if (btnNext && btnPrev && pageInfo) {
            btnNext.disabled = !data.paging?.hasNext;
            btnPrev.disabled = (__page <= 0);
            pageInfo.textContent = 'Página ' + (__page + 1);
            btnNext.onclick = () => { __page += 1; loadDashboardData(); };
            btnPrev.onclick = () => { if (__page > 0) { __page -= 1; loadDashboardData(); } };
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar los datos del dashboard');
        // Reseteo seguro de KPIs
        updateDashboardStats({ currentVehicles: 0, todayIncome: 0, averageTime: 0, totalUsers: 0 });
        updateRecentActivity([]);
    }
}

// Función para actualizar las estadísticas
function updateDashboardStats(data) {
    const map = { car: 0, motorcycle: 0, bicycle: 0 };
    (data.currentVehiclesByType || []).forEach(r => { map[r.type || r.vehicle?.type] = r.count; });
    document.getElementById('currCarros').textContent = Number(map.car || map.carro || 0);
    document.getElementById('currMotos').textContent = Number(map.motorcycle || map.moto || 0);
    document.getElementById('currBicis').textContent = Number(map.bicycle || map.bici || 0);
    document.getElementById('todayIncome').textContent = formatCurrency(data.todayIncome?.total ?? 0);
    // Ocupación: consultar KPI de reportes para hoy
    setOcupacionKpi();
}

async function setOcupacionKpi(){
    try{
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        const hoy = `${yyyy}-${mm}-${dd}`;
        const res = await fetch(`/api/reports/kpis?from=${hoy}&to=${hoy}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if (!res.ok) throw new Error(j.message||'Error KPIs');
        const ocup = (j.data && j.data.occupancy!=null) ? j.data.occupancy : 0;
        const el = document.getElementById('kpiOcupacionDash');
        if (el) el.textContent = `${ocup}%`;
    }catch(_){
        const el = document.getElementById('kpiOcupacionDash');
        if (el) el.textContent = '0%';
    }
}

// Función para actualizar la tabla de actividad reciente
function updateRecentActivity(activities) {
    const tableBody = document.getElementById('recentActivityTable');
    if (!activities || activities.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay actividad reciente</td></tr>';
        return;
    }

    tableBody.innerHTML = activities.map(activity => `
        <tr>
            <td>${activity.vehicle?.license_plate || activity.placa || ''}</td>
            <td>${activity.vehicle?.type || activity.tipo || ''}</td>
            <td>${formatDateTime(activity.entry_date || activity.entrada)}</td>
            <td><span class="badge bg-${(activity.status || activity.estado) === 'activo' ? 'success' : 'secondary'}">${activity.status || activity.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="viewDetails(${activity.id_movement || activity.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.viewDetails = async function(idMovement) {
    try {
        const res = await fetch(`/api/movements/${idMovement}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'No fue posible obtener el detalle');

        const m = data.data;
        const plate = m.vehicle?.license_plate || m.license_plate || '';
        const vehType = m.vehicle?.type || m.type || '';
        const entryDate = m.entry_date || m.entryDate || '';
        const exitDate = m.exit_date || m.exitDate || '';
        const total = m.total_to_pay || m.total || 0;
        const status = m.status || 'activo';
        const typeIcon = vehType === 'carro' ? 'fa-car' : vehType === 'moto' ? 'fa-motorcycle' : 'fa-bicycle';
        const typeLabel = vehType === 'carro' ? 'Carro' : vehType === 'moto' ? 'Moto' : vehType === 'bicicleta' ? 'Bicicleta' : vehType;
        const modalHtml = `
            <div class="modal fade" id="detailModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content bg-white rounded-xl shadow-2xl border-0">
                  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
                    <h5 class="text-lg font-semibold text-gray-900">
                      <i class="fas fa-info-circle text-primary mr-2"></i>Detalle del Movimiento #${m.id_movement || idMovement}
                    </h5>
                    <button type="button" class="text-gray-400 hover:text-gray-600 transition-colors" data-bs-dismiss="modal">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="p-6">
                    <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                      <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                        <i class="fas ${typeIcon}"></i>
                      </div>
                      <div>
                        <div class="text-lg font-bold text-gray-900">${plate}</div>
                        <div class="text-sm text-gray-500">${typeLabel}</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-3">
                      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                        <span class="text-sm font-medium text-gray-500"><i class="fas fa-sign-in-alt mr-2 text-green-500"></i>Entrada</span>
                        <span class="text-sm font-semibold text-gray-900">${fmtDate(entryDate)}</span>
                      </div>
                      ${exitDate ? `
                      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                        <span class="text-sm font-medium text-gray-500"><i class="fas fa-sign-out-alt mr-2 text-red-500"></i>Salida</span>
                        <span class="text-sm font-semibold text-gray-900">${fmtDate(exitDate)}</span>
                      </div>` : ''}
                      ${total ? `
                      <div class="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span class="text-sm font-medium text-blue-700"><i class="fas fa-dollar-sign mr-2"></i>Total</span>
                        <span class="text-sm font-bold text-blue-700">${formatCurrency(total)}</span>
                      </div>` : ''}
                      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                        <span class="text-sm font-medium text-gray-500"><i class="fas fa-circle mr-2 ${status === 'activo' ? 'text-green-500' : 'text-gray-400'}"></i>Estado</span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${status === 'activo' ? 'Activo' : 'Finalizado'}</span>
                      </div>
                    </div>
                  </div>
                  <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 rounded-b-xl">
                    <button type="button" class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors" data-bs-dismiss="modal">
                      <i class="fas fa-times mr-1"></i>Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>`;

        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container);
        const modal = new bootstrap.Modal(container.querySelector('#detailModal'));
        modal.show();
        container.addEventListener('hidden.bs.modal', () => container.remove());
    } catch (e) {
        console.error(e);
        showError('No fue posible obtener el detalle');
    }
}

// Finalizar (checkout) un movimiento activo con confirmación + impresión
window.checkoutVehicle = async function(idMovement) {
    try {
        const resDet = await fetch(`/api/movements/${idMovement}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const det = await resDet.json();
        if (!resDet.ok) throw new Error(det.message || 'Error');
        const m = det.data;
        const plate = m.vehicle?.license_plate || m.license_plate || '';
        const vehType = m.vehicle?.type || m.type || '';
        const entryDt = m.entry_date || '';
        const exitDt = m.exit_date || '';
        if (exitDt) {
            showToast('Advertencia', 'Este vehículo ya tuvo salida.', 'warning');
            return;
        }

        // Modal de confirmación
        const modalHtml = `
            <div class="modal fade" id="checkoutModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Confirmar salida</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-2"><strong>Placa:</strong> ${plate}</div>
                    <div class="mb-2"><strong>Tipo:</strong> ${vehType}</div>
                    <div class="mb-2"><strong>Entrada:</strong> ${fmtDate(entryDt)}</div>
                    <div class="mt-3">
                      <label class="form-label">Método de pago</label>
                      <select class="form-select" id="checkoutMethod">
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="QR">QR</option>
                      </select>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success" id="btnConfirmCheckout">Confirmar salida</button>
                  </div>
                </div>
              </div>
            </div>`;

        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container);
        const modal = new bootstrap.Modal(container.querySelector('#checkoutModal'));
        modal.show();

        container.querySelector('#btnConfirmCheckout').addEventListener('click', async () => {
            const paymentMethod = container.querySelector('#checkoutMethod').value;
            try {
                const res = await fetch('/api/movements/exit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ license_plate: placa })
                });
                const data = await res.json();
                if (!res.ok) {
                    if (res.status === 404) {
                        showToast('Advertencia', data.message || 'El vehículo no tiene ingreso activo', 'warning');
                        return;
                    }
                    throw new Error(data.message || 'No fue posible finalizar el movimiento');
                }

                // Refrescar dashboard
                await loadDashboardData();

                const company = await getCompanyInfo();
                const f = data.data;
                const ticketHtml = renderExitTicket(f, company);
                printHTML(ticketHtml, 'Factura de Salida', 80, {
                    t: 'exit', e: company?.tax_id, m: f.id_movement || f.movementId, p: f.license_plate, fs: f.exit_date || f.exitDate, total: f.total_to_pay || f.total
                });
                // Abrir modal de pago como en ingreso/salida
                try {
                    // Reutilizar modal de ingreso/salida si está disponible o informar
                    if (window.abrirModalPago) {
                        window.abrirModalPago(f);
                    } else {
                        showToast('Información', 'Para registrar pagos usa Ingreso/Salida.', 'info');
                    }
                } catch (_) {}

                showToast('Éxito', 'Salida registrada' + ': ' + formatCurrency(f.total), 'success');
                modal.hide();
                container.remove();
            } catch (err) {
                console.error(err);
                showToast('Error', 'No fue posible finalizar el movimiento', 'error');
            }
        });

        container.addEventListener('hidden.bs.modal', () => container.remove());
    } catch (e) {
        console.error(e);
        showError('No fue posible abrir la confirmación');
    }
}

// Render del ticket de salida
function renderExitTicket(exitData, company){
    const e = company || {};
    const companyName = e.name || 'Empresa';
    const taxId = e.tax_id || '';
    const address = e.address || '';
    const phone = e.phone || '';
    const header = `
        <div style="text-align:center">
            ${e.logo_url ? `<img src="${e.logo_url}" alt="logo" style="max-height:60px">` : ''}
            <div><strong>${companyName}</strong></div>
            <div>NIT: ${taxId}</div>
            <div>${address}${phone ? ' - '+phone : ''}</div>
            <hr/>
            <div><strong>SALIDA</strong></div>
        </div>`;
    const movId = exitData.id_movement || exitData.movementId || '';
    const plate = exitData.license_plate || '';
    const vtype = exitData.type || '';
    const entryD = exitData.entry_date || exitData.entryDate || '';
    const exitD = exitData.exit_date || exitData.exitDate || '';
    const total = exitData.total_to_pay || exitData.total || 0;
    return `${header}
        <div>Movimiento: <strong>#${movId}</strong></div>
        <div>Placa: <strong>${plate}</strong></div>
        <div>Tipo: <strong>${vtype}</strong></div>
        <div>Entrada: <strong>${fmtDate(entryD)}</strong></div>
        <div>Salida: <strong>${fmtDate(exitD)}</strong></div>
        <hr/>
        <div>Total a pagar: <strong>${formatCurrency(total)}</strong></div>
        <div>Atendido por: ${localStorage.getItem('userName')||''}</div>
        <div>Fecha impresión: ${fmtDate(new Date())}</div>`;
}

// Ventana de impresión tipo ticket con QR opcional
function printHTML(html, titulo, anchoMM, qrPayload){
    const width = anchoMM || 58; // 58 o 80
    const w = window.open('', '_blank', 'width=420,height=700');
    const payload = encodeURIComponent(JSON.stringify(qrPayload || {}));
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${titulo}</title>
        <style>
            @page{ size: ${width}mm auto; margin: 3mm }
            body{ width:${width}mm; font-family: Arial, sans-serif; font-size:11px; margin:0 }
            .wrap{ padding:4mm }
            hr{ border:none; border-top:1px dashed #999; margin:6px 0 }
            img{ display:block; margin:0 auto 6px; max-width:100% }
            .qr{ display:none; justify-content:center; margin-top:6px }
        </style>
    </head><body><div class="wrap">${html}<div class="qr"><div id="qrcode"></div></div></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
    <script>(function(){
        var payload = {};
        var enableQR = false;
        try{
            payload = JSON.parse(decodeURIComponent('${payload}'));
            enableQR = !!(payload && (payload.qr === true || payload.enableQR === true));
        }catch(e){}
        if (enableQR) {
            try{
                var el = document.getElementById('qrcode');
                if (el) {
                    new QRCode(el, {text: JSON.stringify(payload), width:96, height:96});
                    if (el.parentElement) { el.parentElement.style.display = 'flex'; }
                }
            }catch(_){ }
        }
        setTimeout(function(){ window.print(); window.close(); }, 400);
    })();<\/script>
    </body></html>`;
    w.document.write(doc);
    w.document.close();
    w.focus();
}

// Funciones de utilidad
function formatCurrency(amount) {
    return fmtCurrency(amount);
}

function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatDateTime(date) {
    return new Date(date).toLocaleString(locale(), {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para mostrar errores
function showError(message) {
    showToast('Error', message, 'error');
}


