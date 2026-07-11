const token = localStorage.getItem('token');
let empresaInfo = null;
let ultimoIngreso = null;
let ultimaSalida = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!token) return;
    if (localStorage.getItem('userRole') !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    }
    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'Ingreso / Salida';
    document.querySelector('.sidebar-toggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('show'));
    document.getElementById('btnLogout').addEventListener('click', () => { localStorage.clear(); location.href = '/'; });

    loadEmpresaInfo();
    cargarPlacasActivas();

    document.getElementById('formIngreso').addEventListener('submit', handleEntry);
    document.getElementById('formSalida').addEventListener('submit', handleExit);

    document.getElementById('btnPrintIngreso58').addEventListener('click', () => {
        if (!ultimoIngreso) return;
        const qr = JSON.stringify({ t: 'entry', e: empresaInfo?.tax_id, m: ultimoIngreso.id_movement, p: ultimoIngreso.license_plate, fe: ultimoIngreso.entry_date });
        imprimirHTML(document.getElementById('compIngresoBody').innerHTML, 'Comprobante de Ingreso', 58, qr);
    });
    document.getElementById('btnPrintIngreso80').addEventListener('click', () => {
        if (!ultimoIngreso) return;
        const qr = JSON.stringify({ t: 'entry', e: empresaInfo?.tax_id, m: ultimoIngreso.id_movement, p: ultimoIngreso.license_plate, fe: ultimoIngreso.entry_date });
        imprimirHTML(document.getElementById('compIngresoBody').innerHTML, 'Comprobante de Ingreso', 80, qr);
    });
    document.getElementById('btnPrintSalida58').addEventListener('click', () => {
        if (!ultimaSalida) return;
        const qr = JSON.stringify({ t: 'exit', e: empresaInfo?.tax_id, m: ultimaSalida.id_movement, p: ultimaSalida.license_plate, fs: ultimaSalida.exit_date, total: ultimaSalida.total_to_pay });
        imprimirHTML(document.getElementById('compSalidaBody').innerHTML, 'Factura de Salida', 58, qr);
    });
    document.getElementById('btnPrintSalida80').addEventListener('click', () => {
        if (!ultimaSalida) return;
        const qr = JSON.stringify({ t: 'exit', e: empresaInfo?.tax_id, m: ultimaSalida.id_movement, p: ultimaSalida.license_plate, fs: ultimaSalida.exit_date, total: ultimaSalida.total_to_pay });
        imprimirHTML(document.getElementById('compSalidaBody').innerHTML, 'Factura de Salida', 80, qr);
    });
});

async function loadEmpresaInfo() {
    try {
        const r = await fetch('/api/companies/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const j = await r.json();
        if (r.ok) empresaInfo = j.data;
        try {
            const cr = await fetch('/api/companies/config', { headers: { 'Authorization': `Bearer ${token}` } });
            const cj = await cr.json();
            if (cr.ok && cj && cj.data) {
                empresaInfo.operation_24h = cj.data.operation_24h;
                empresaInfo.opening_time = cj.data.opening_time;
                empresaInfo.closing_time = cj.data.closing_time;
            }
        } catch (_) {}
        try {
            const lr = await fetch('/api/companies/logo', { headers: { 'Authorization': `Bearer ${token}` } });
            if (lr.ok) {
                const blob = await lr.blob();
                empresaInfo.logo_url = await new Promise((resolve) => {
                    const fr = new FileReader();
                    fr.onload = () => resolve(fr.result);
                    fr.readAsDataURL(blob);
                });
            }
        } catch (_) {}
    } catch (_) {
        console.warn('No se pudo cargar la empresa');
    }
}

async function ensureEmpresaConfig() {
    if (!empresaInfo) return;
    if (typeof empresaInfo.operation_24h === 'undefined') {
        try {
            const cr = await fetch('/api/companies/config', { headers: { 'Authorization': `Bearer ${token}` } });
            const cj = await cr.json();
            if (cr.ok && cj && cj.data) {
                empresaInfo.operation_24h = cj.data.operation_24h;
                empresaInfo.opening_time = cj.data.opening_time;
                empresaInfo.closing_time = cj.data.closing_time;
            }
        } catch (_) {}
    }
}

function fmtTime(t) {
    if (!t) return '';
    const s = String(t);
    return s.length >= 5 ? s.substring(0, 5) : s;
}

async function cargarPlacasActivas() {
    try {
        const r = await fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } });
        const j = await r.json();
        if (!r.ok || !j.data) return;
        const datalist = document.getElementById('salPlacaList');
        datalist.innerHTML = j.data
            .filter(v => v.status === 'activo')
            .map(v => `<option value="${v.license_plate}">${v.type} - ${v.color}</option>`)
            .join('');
    } catch (_) {}
}

async function handleEntry(e) {
    e.preventDefault();
    await ensureEmpresaConfig();
    const license_plate = document.getElementById('ingPlaca').value.trim().toUpperCase();
    const checkedTipo = document.querySelector('input[name="ingTipo"]:checked');
    const type = (checkedTipo || {}).value || '';
    const res = await fetch('/api/movements/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ license_plate, type })
    });
    const data = await res.json();
    if (!res.ok) { showToast('Error', data.message || 'Error al registrar ingreso', 'error'); return; }
    const b = data.data;
    ultimoIngreso = b;
    showToast('Ingreso registrado', `Vehículo ${b.license_plate} ingresó correctamente`, 'success');
    document.getElementById('compIngresoBody').innerHTML = renderComprobante('INGRESO', b, null, empresaInfo);
    document.getElementById('compIngreso').classList.remove('d-none');
    document.getElementById('ingPlaca').value = '';
    document.getElementById('ingPlaca').focus();
    if (checkedTipo) checkedTipo.checked = true;
    cargarPlacasActivas();
}

async function handleExit(e) {
    e.preventDefault();
    await ensureEmpresaConfig();
    const license_plate = document.getElementById('salPlaca').value.trim().toUpperCase();
    const metodoPref = document.getElementById('salMetodo').value;
    const res = await fetch('/api/movements/calculate-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ license_plate })
    });
    const data = await res.json();
    if (!res.ok) { showToast('Error', data.message || 'Error al calcular salida', 'error'); return; }
    const f = data.data;
    abrirModalPago(f, metodoPref);
}

function renderComprobante(tipo, ingreso, salida, empresa) {
    const e = empresa || {};
    const header = `
        <div style="text-align:center">
            ${e.logo_url ? `<img src="${e.logo_url}" alt="logo" style="max-height:60px">` : ''}
            <div><strong>${e.name || 'Empresa'}</strong></div>
            <div>NIT: ${e.tax_id || ''}</div>
            <div>${e.address || ''} ${e.phone ? ' - ' + e.phone : ''}</div>
            <div>Horario: <strong>${(empresa?.operation_24h) ? '24 horas' : ((fmtTime(empresa?.opening_time) || '') + ' - ' + (fmtTime(empresa?.closing_time) || ''))}</strong></div>
            <hr/>
            <div><strong>${tipo === 'INGRESO' ? 'Comprobante de Ingreso' : 'Factura de Salida'}</strong></div>
        </div>`;

    if (tipo === 'INGRESO') {
        return `${header}
            <div>Movimiento: <strong>#${ingreso.id_movement}</strong></div>
            <div>Placa: <strong>${ingreso.license_plate}</strong></div>
            <div>Tipo: <strong>${ingreso.type || ''}</strong></div>
            <div>Entrada: <strong>${fmtDate(ingreso.entry_date)}</strong></div>
            <hr/>
            <div>Tarifas</div>
            <div>Minuto: <strong>${ingreso.minute_rate || ''}</strong></div>
            <div>Hora: <strong>${ingreso.hourly_rate || ''}</strong></div>
            <div>Día: <strong>${ingreso.full_day_rate || ''}</strong></div>
            <hr/>
            <div>Atendido por: ${localStorage.getItem('userName') || ''}</div>
            <div>Fecha impresión: ${fmtDate(new Date())}</div>`;
    }

    const pagosHtml = (salida.paymentsList && salida.paymentsList.length)
        ? `<div><strong>Pagos</strong></div>` + salida.paymentsList.map(p => `<div>${p.payment_method}: <strong>${fmtCurrency(Number(p.amount || 0))}</strong></div>`).join('')
        : '';
    return `${header}
        <div>Movimiento: <strong>#${salida.id_movement}</strong></div>
        <div>Placa: <strong>${salida.license_plate}</strong></div>
        <div>Tipo: <strong>${salida.type || ''}</strong></div>
        <div>Entrada: <strong>${fmtDate(salida.entry_date)}</strong></div>
        <div>Salida: <strong>${fmtDate(salida.exit_date)}</strong></div>
        <hr/>
        <div>Tarifas</div>
        <div>Minuto: <strong>${salida.minute_rate || ''}</strong></div>
        <div>Hora: <strong>${salida.hourly_rate || ''}</strong></div>
        <div>Día: <strong>${salida.full_day_rate || ''}</strong></div>
        <hr/>
        <div>Total a pagar: <strong>${fmtCurrency(salida.total_to_pay)}</strong></div>
        ${pagosHtml}
        <div>Atendido por: ${localStorage.getItem('userName') || ''}</div>
        <div>Fecha impresión: ${fmtDate(new Date())}</div>`;
}

function formatCurrencyEE(amount) {
    return fmtCurrency(amount);
}

function imprimirHTML(html, titulo, anchoMM, qrPayload) {
    const width = anchoMM || 58;
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

function abrirModalPago(factura, metodoPorDefecto) {
    const modalEl = document.getElementById('pagoModal');
    const cont = document.getElementById('pagosContainer');
    cont.innerHTML = '';
    const btnConfirm = document.getElementById('btnConfirmPagos');

    const METODO_STYLE = {
        efectivo: { icon: 'fa-money-bill-wave', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        tarjeta:  { icon: 'fa-credit-card',      bg: 'bg-indigo-50',  text: 'text-indigo-600' },
        QR:       { icon: 'fa-qrcode',           bg: 'bg-purple-50',  text: 'text-purple-600' },
    };

    const addRow = (metodo = 'efectivo', monto = '') => {
        const row = document.createElement('div');
        row.className = 'pago-row flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors';
        row.innerHTML = `
            <div class="metodo-icon w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${METODO_STYLE[metodo].bg} ${METODO_STYLE[metodo].text}">
                <i class="fas ${METODO_STYLE[metodo].icon} text-sm"></i>
            </div>
            <div class="flex-1 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Método</label>
                    <select class="metodo w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                        <option value="efectivo" ${metodo === 'efectivo' ? 'selected' : ''}>Efectivo</option>
                        <option value="tarjeta" ${metodo === 'tarjeta' ? 'selected' : ''}>Tarjeta</option>
                        <option value="QR" ${metodo === 'QR' ? 'selected' : ''}>QR</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Monto</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                        <input type="number" class="monto w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" min="0" step="0.01" placeholder="0.00" inputmode="decimal" autocomplete="off" value="${monto}">
                    </div>
                </div>
            </div>
            <button class="btnDel w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm font-bold shrink-0" title="Eliminar método">&times;</button>
        `;
        const iconWrap = row.querySelector('.metodo-icon');
        const iconEl = iconWrap.querySelector('i');
        row.querySelector('.metodo').addEventListener('change', (e) => {
            const style = METODO_STYLE[e.target.value];
            iconWrap.className = `metodo-icon w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`;
            iconEl.className = `fas ${style.icon} text-sm`;
        });
        row.querySelector('.btnDel').addEventListener('click', () => { row.remove(); calc(); });
        row.querySelector('.monto').addEventListener('input', calc);
        cont.appendChild(row);
    };

    const calc = () => {
        const montos = Array.from(cont.querySelectorAll('.monto')).map(i => Number(i.value || 0));
        const sum = montos.reduce((a, b) => a + b, 0);
        const total = Number(factura.total_to_pay || 0);
        document.getElementById('pagoSum').textContent = formatCurrencyEE(sum);
        document.getElementById('pagoTotalResumen').textContent = formatCurrencyEE(total);
        const diff = sum - total;
        const sign = diff >= 0 ? 'Vuelto: ' : 'Falta: ';
        const diffEl = document.getElementById('pagoDiff');
        diffEl.textContent = sign + formatCurrencyEE(Math.abs(diff));
        diffEl.className = 'text-sm ' + (diff >= 0 ? 'text-green-600' : 'text-red-500');

        const pct = total > 0 ? Math.min(100, (sum / total) * 100) : 0;
        const progressEl = document.getElementById('pagoProgress');
        progressEl.style.width = pct + '%';
        progressEl.className = 'h-full rounded-full transition-all duration-300 ' + (diff >= 0 ? 'bg-green-500' : 'bg-primary');

        btnConfirm.disabled = (sum + 0.0001) < total;
    };

    document.getElementById('btnAddPago').onclick = () => { addRow('efectivo', ''); };
    addRow(metodoPorDefecto || 'efectivo', factura.total_to_pay);
    calc();
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    btnConfirm.onclick = async () => {
        const rows = Array.from(cont.querySelectorAll('.pago-row'));
        const pagos = rows.map(r => ({
            payment_method: r.querySelector('.metodo').value,
            amount: Number(r.querySelector('.monto').value || 0)
        })).filter(p => p.amount > 0);
        const totalPagado = pagos.reduce((a, b) => a + Number(b.amount || 0), 0);
        if ((totalPagado + 0.0001) < factura.total_to_pay) {
            showToast('Pago incompleto', 'Falta valor por pagar. Completa el pago para finalizar.', 'warning');
            return;
        }
        try {
            const exitRes = await fetch('/api/movements/exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ license_plate: factura.license_plate })
            });
            const exitData = await exitRes.json();
            if (!exitRes.ok) throw new Error(exitData.message || 'Error al registrar salida');

            const res = await fetch('/api/payments/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_movement: factura.id_movement, payments: pagos })
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j.message || 'Error registrando pagos');
            showToast('Salida completada', `Vehículo ${factura.license_plate} - Pago registrado correctamente`, 'success');
            const salidaFinal = Object.assign({}, exitData.data, { paymentsList: pagos });
            ultimaSalida = salidaFinal;
            document.getElementById('compSalidaBody').innerHTML = renderComprobante('SALIDA', null, salidaFinal, empresaInfo);
            document.getElementById('compSalida').classList.remove('d-none');
            document.getElementById('formSalida').reset();
            imprimirHTML(renderComprobante('SALIDA', null, salidaFinal, empresaInfo), 'Factura de Salida', 80, { t: 'exit', e: empresaInfo?.tax_id, m: salidaFinal.id_movement, p: salidaFinal.license_plate, fs: salidaFinal.exit_date, total: salidaFinal.total_to_pay });
            modal.hide();
            cargarPlacasActivas();
        } catch (err) {
            showToast('Error', err.message || 'Error al registrar pagos', 'error');
        }
    };
}

window.abrirModalPago = abrirModalPago;
window.renderReceipt = renderComprobante;
window.printHTML = imprimirHTML;
window.formatCurrency = formatCurrencyEE;
