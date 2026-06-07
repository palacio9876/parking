const token = localStorage.getItem('token');
let empresaInfo = null;
let ultimoIngreso = null;
let ultimaSalida = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!token) return;
    if (localStorage.getItem('userRole') !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    }
    document.getElementById('userName').textContent = localStorage.getItem('userName') || t('entryExit.title');
    document.querySelector('.sidebar-toggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('show'));
    document.getElementById('btnLogout').addEventListener('click', () => { localStorage.clear(); location.href = '/'; });

    loadEmpresaInfo();

    document.getElementById('formIngreso').addEventListener('submit', handleEntry);
    document.getElementById('formSalida').addEventListener('submit', handleExit);

    document.getElementById('btnPrintIngreso58').addEventListener('click', () => {
        if (!ultimoIngreso) return;
        const qr = JSON.stringify({ t: 'entry', e: empresaInfo?.tax_id, m: ultimoIngreso.id_movement, p: ultimoIngreso.license_plate, fe: ultimoIngreso.entry_date });
        imprimirHTML(document.getElementById('compIngresoBody').innerHTML, t('entryExit.entryReceiptTitle'), 58, qr);
    });
    document.getElementById('btnPrintIngreso80').addEventListener('click', () => {
        if (!ultimoIngreso) return;
        const qr = JSON.stringify({ t: 'entry', e: empresaInfo?.tax_id, m: ultimoIngreso.id_movement, p: ultimoIngreso.license_plate, fe: ultimoIngreso.entry_date });
        imprimirHTML(document.getElementById('compIngresoBody').innerHTML, t('entryExit.entryReceiptTitle'), 80, qr);
    });
    document.getElementById('btnPrintSalida58').addEventListener('click', () => {
        if (!ultimaSalida) return;
        const qr = JSON.stringify({ t: 'exit', e: empresaInfo?.tax_id, m: ultimaSalida.id_movement, p: ultimaSalida.license_plate, fs: ultimaSalida.exit_date, total: ultimaSalida.total_to_pay });
        imprimirHTML(document.getElementById('compSalidaBody').innerHTML, t('entryExit.exitReceiptTitle'), 58, qr);
    });
    document.getElementById('btnPrintSalida80').addEventListener('click', () => {
        if (!ultimaSalida) return;
        const qr = JSON.stringify({ t: 'exit', e: empresaInfo?.tax_id, m: ultimaSalida.id_movement, p: ultimaSalida.license_plate, fs: ultimaSalida.exit_date, total: ultimaSalida.total_to_pay });
        imprimirHTML(document.getElementById('compSalidaBody').innerHTML, t('entryExit.exitReceiptTitle'), 80, qr);
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
        console.warn(t('entryExit.companyError'));
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

async function handleEntry(e) {
    e.preventDefault();
    await ensureEmpresaConfig();
    const license_plate = document.getElementById('ingPlaca').value.trim().toUpperCase();
    const type = (document.querySelector('input[name="ingTipo"]:checked') || {}).value || '';
    const res = await fetch('/api/movements/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ license_plate, type })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message || t('common.error')); return; }
    const b = data.data;
    ultimoIngreso = b;
    document.getElementById('compIngresoBody').innerHTML = renderComprobante('INGRESO', b, null, empresaInfo);
    document.getElementById('compIngreso').classList.remove('d-none');
    document.getElementById('formIngreso').reset();
}

async function handleExit(e) {
    e.preventDefault();
    await ensureEmpresaConfig();
    const license_plate = document.getElementById('salPlaca').value.trim().toUpperCase();
    const metodoPref = document.getElementById('salMetodo').value;
    const res = await fetch('/api/movements/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ license_plate })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message || t('common.error')); return; }
    const f = data.data;
    ultimaSalida = f;
    document.getElementById('compSalidaBody').innerHTML = renderComprobante('SALIDA', null, f, empresaInfo);
    document.getElementById('compSalida').classList.remove('d-none');
    document.getElementById('formSalida').reset();
    abrirModalPago(f, metodoPref);
}

function renderComprobante(tipo, ingreso, salida, empresa) {
    const e = empresa || {};
    const ciscodeUrl = 'https://ciscode.co';
    const header = `
        <div style="text-align:center">
            ${e.logo_url ? `<img src="${e.logo_url}" alt="logo" style="max-height:60px">` : ''}
            <div><strong>${e.name || t('company.name')}</strong></div>
            <div>${t('company.nit')}: ${e.tax_id || ''}</div>
            <div>${e.address || ''} ${e.phone ? ' - ' + e.phone : ''}</div>
            <div>${t('company.schedule')}: <strong>${(empresa?.operation_24h) ? t('time.h24') : ((fmtTime(empresa?.opening_time) || '') + ' - ' + (fmtTime(empresa?.closing_time) || ''))}</strong></div>
            <hr/>
            <div><strong>${tipo === 'INGRESO' ? t('entryExit.entryReceiptTitle') : t('entryExit.exitReceiptTitle')}</strong></div>
        </div>`;

    const ciscodeFooter = `
        <hr/>
        <div style="text-align:center;margin-top:6px">
            <div>${t('footer.developedBy')} <strong>Ciscode</strong></div>
            <div>
                <a href="${ciscodeUrl}" target="_blank" style="text-decoration:none;color:#000">ciscode.co</a>
                &nbsp;|&nbsp;
                <a href="https://www.youtube.com/@Ciscode" target="_blank" aria-label="YouTube Ciscode" style="display:inline-flex;align-items:center;gap:4px;text-decoration:none;color:#000">
                    <span>
                        <svg width="18" height="12" viewBox="0 0 24 17" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M23.5 2.6a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0s-7.5 0-9.4.5A3 3 0 0 0 .5 2.6 31 31 0 0 0 0 8.5a31 31 0 0 0 .5 5.9 3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.9 31 31 0 0 0-.5-5.9z" fill="#FF0000"/>
                            <path d="M9.75 12.25V4.75L15.5 8.5l-5.75 3.75z" fill="#fff"/>
                        </svg>
                    </span>
                    <span style="font-size:10px">YouTube</span>
                </a>
            </div>
        </div>`;

    if (tipo === 'INGRESO') {
        return `${header}
            <div>${t('entryExit.movement')}: <strong>#${ingreso.id_movement}</strong></div>
            <div>${t('entryExit.plate')}: <strong>${ingreso.license_plate}</strong></div>
            <div>${t('entryExit.type')}: <strong>${ingreso.type || ''}</strong></div>
            <div>${t('entryExit.entryTime')}: <strong>${fmtDate(ingreso.entry_date)}</strong></div>
            <hr/>
            <div>${t('entryExit.rates')}</div>
            <div>${t('entryExit.minute')}: <strong>${ingreso.minute_rate || ''}</strong></div>
            <div>${t('entryExit.hour')}: <strong>${ingreso.hourly_rate || ''}</strong></div>
            <div>${t('entryExit.day')}: <strong>${ingreso.full_day_rate || ''}</strong></div>
            <hr/>
            <div>${t('entryExit.attendedBy')}: ${localStorage.getItem('userName') || ''}</div>
            <div>${t('entryExit.printDate')}: ${fmtDate(new Date())}</div>
            ${ciscodeFooter}`;
    }

    const pagosHtml = (salida.paymentsList && salida.paymentsList.length)
        ? `<div><strong>${t('vehicles.historyPayments')}</strong></div>` + salida.paymentsList.map(p => `<div>${p.payment_method}: <strong>${fmtCurrency(Number(p.amount || 0))}</strong></div>`).join('')
        : '';
    return `${header}
        <div>${t('entryExit.movement')}: <strong>#${salida.id_movement}</strong></div>
        <div>${t('entryExit.plate')}: <strong>${salida.license_plate}</strong></div>
        <div>${t('entryExit.type')}: <strong>${salida.type || ''}</strong></div>
        <div>${t('entryExit.entryTime')}: <strong>${fmtDate(salida.entry_date)}</strong></div>
        <div>${t('entryExit.exitTime')}: <strong>${fmtDate(salida.exit_date)}</strong></div>
        <hr/>
        <div>${t('entryExit.rates')}</div>
        <div>${t('entryExit.minute')}: <strong>${salida.minute_rate || ''}</strong></div>
        <div>${t('entryExit.hour')}: <strong>${salida.hourly_rate || ''}</strong></div>
        <div>${t('entryExit.day')}: <strong>${salida.full_day_rate || ''}</strong></div>
        <hr/>
        <div>${t('entryExit.totalToPay')}: <strong>${fmtCurrency(salida.total_to_pay)}</strong></div>
        ${pagosHtml}
        <div>${t('entryExit.attendedBy')}: ${localStorage.getItem('userName') || ''}</div>
        <div>${t('entryExit.printDate')}: ${fmtDate(new Date())}</div>
        ${ciscodeFooter}`;
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
    document.getElementById('pagoTotal').textContent = formatCurrencyEE(factura.total_to_pay);
    const cont = document.getElementById('pagosContainer');
    cont.innerHTML = '';
    const btnConfirm = document.getElementById('btnConfirmPagos');
    const addRow = (metodo = 'cash', monto = '') => {
        const row = document.createElement('div');
        row.className = 'd-flex gap-2';
        row.innerHTML = `
            <select class="form-select form-select-sm metodo" style="max-width:140px">
                <option value="cash" ${metodo === 'cash' ? 'selected' : ''}>${t('payment.cash')}</option>
                <option value="card" ${metodo === 'card' ? 'selected' : ''}>${t('payment.card')}</option>
                <option value="QR" ${metodo === 'QR' ? 'selected' : ''}>${t('payment.qr')}</option>
            </select>
            <input type="number" class="form-control form-control-sm monto" min="0" step="0.01" placeholder="${t('entryExit.amount')}" value="${monto}">
            <button class="btn btn-outline-danger btn-sm btnDel">&times;</button>
        `;
        row.querySelector('.btnDel').addEventListener('click', () => { row.remove(); calc(); });
        row.querySelector('.monto').addEventListener('input', calc);
        cont.appendChild(row);
    };
    const calc = () => {
        const montos = Array.from(cont.querySelectorAll('.monto')).map(i => Number(i.value || 0));
        const sum = montos.reduce((a, b) => a + b, 0);
        document.getElementById('pagoSum').textContent = formatCurrencyEE(sum);
        const diff = sum - factura.total_to_pay;
        const sign = diff >= 0 ? t('entryExit.change') + ': ' : t('entryExit.missing') + ': ';
        const diffEl = document.getElementById('pagoDiff');
        diffEl.textContent = sign + formatCurrencyEE(Math.abs(diff));
        diffEl.className = diff >= 0 ? 'text-success' : 'text-danger';
        btnConfirm.disabled = (sum + 0.0001) < factura.total_to_pay;
    };
    document.getElementById('btnAddPago').onclick = () => { addRow('cash', ''); };
    addRow(metodoPorDefecto || 'cash', factura.total_to_pay);
    calc();
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    btnConfirm.onclick = async () => {
        const rows = Array.from(cont.querySelectorAll('.d-flex'));
        const pagos = rows.map(r => ({
            payment_method: r.querySelector('.metodo').value,
            amount: Number(r.querySelector('.monto').value || 0)
        })).filter(p => p.amount > 0);
        const totalPagado = pagos.reduce((a, b) => a + Number(b.amount || 0), 0);
        if ((totalPagado + 0.0001) < factura.total_to_pay) {
            alert(t('entryExit.paymentError'));
            return;
        }
        try {
            const res = await fetch('/api/payments/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_movement: factura.id_movement, payments: pagos })
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j.message || t('entryExit.paymentRegisterError'));
            const facturaConPagos = Object.assign({}, factura, { paymentsList: pagos });
            const htmlTicket = renderComprobante('SALIDA', null, facturaConPagos, empresaInfo);
            imprimirHTML(htmlTicket, t('entryExit.exitReceiptTitle'), 80, { t: 'exit', e: empresaInfo?.tax_id, m: factura.id_movement, p: factura.license_plate, fs: factura.exit_date, total: factura.total_to_pay });
            ultimaSalida = facturaConPagos;
            document.getElementById('compSalidaBody').innerHTML = htmlTicket;
            modal.hide();
        } catch (err) {
            alert(t('common.error') + ': ' + err.message);
        }
    };
}

window.abrirModalPago = abrirModalPago;
window.renderReceipt = renderComprobante;
window.printHTML = imprimirHTML;
window.formatCurrency = formatCurrencyEE;
