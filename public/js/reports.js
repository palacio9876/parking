// Frontend Reports
// Related to: public/admin/reportes.html and routes /api/reports/*

const vehicleTypeRep = { carro: 'Carro', moto: 'Moto', bicicleta: 'Bicicleta' };
const paymentMethodRep = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', QR: 'QR' };
const statusLabelsRep = { activo: 'Activo', completado: 'Finalizado', inactive: 'Inactivo' };

let __pageRep = 0;
let __pageSizeRep = 20;
let chartIncome = null;
let chartPaymentMethod = null;

document.addEventListener('DOMContentLoaded', () => {
    // Basic auth
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }

    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'Usuario';
    document.querySelector('.sidebar-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('show'));
    document.getElementById('btnLogout').addEventListener('click',()=>{localStorage.clear(); location.href='/';});
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') { document.querySelectorAll('.admin-only').forEach(el=> el.classList.add('d-none')); }

    // Default range: today
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()+1).padStart(2,'0');
    const dd = String(hoy.getDate()).padStart(2,'0');
    document.getElementById('fFrom').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('fTo').value = `${yyyy}-${mm}-${dd}`;

    document.getElementById('btnToday').addEventListener('click', setToday);
    document.getElementById('btnLast7').addEventListener('click', setLast7);
    document.getElementById('btnMonth').addEventListener('click', setMonth);
    document.getElementById('btnApply').addEventListener('click', ()=>{ __pageRep = 0; loadAll(); });
    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);
    document.getElementById('btnPrev').addEventListener('click', ()=>{ if(__pageRep>0){ __pageRep--; loadMovements(); } });
    document.getElementById('btnNext').addEventListener('click', ()=>{ __pageRep++; loadMovements(); });
    document.getElementById('btnExport').addEventListener('click', exportToPDF);
    const btnXlsx = document.getElementById('btnExportXlsx');
    if (btnXlsx) btnXlsx.addEventListener('click', exportToExcelBackend);
    document.getElementById('fPaymentMethod').addEventListener('change', loadChartIncome);

    loadAll();

    // --- Insert shift closures section ---
    initShiftsView();
});

// Robust SheetJS loading if not available (tries multiple CDNs)
async function ensureXLSX(){
    if (window.XLSX) return window.XLSX;
    const urls = [
        'https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.19.3/xlsx.full.min.js',
        'https://unpkg.com/xlsx@0.19.3/dist/xlsx.full.min.js'
    ];
    let lastErr = null;
    for (const url of urls){
        try{
            await new Promise((resolve, reject)=>{
                const s = document.createElement('script');
                s.src = url;
                s.async = true;
                s.onload = ()=> setTimeout(resolve, 0);
                s.onerror = (e)=> reject(e);
                document.head.appendChild(s);
            });
            if (window.XLSX) return window.XLSX;
        }catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('Could not load SheetJS');
}

function clearFilters(){
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()+1).padStart(2,'0');
    const dd = String(hoy.getDate()).padStart(2,'0');
    const today = `${yyyy}-${mm}-${dd}`;
    document.getElementById('fFrom').value = today;
    document.getElementById('fTo').value = today;
    document.getElementById('fType').value = '';
    document.getElementById('fStatus').value = '';
    document.getElementById('fPlate').value = '';
    document.getElementById('fPaymentMethod').value = '';
    __pageRep = 0;
    loadAll();
}

function baseParams(){
    const from = document.getElementById('fFrom').value;
    const to = document.getElementById('fTo').value;
    return { from, to };
}

async function loadAll(){
    await Promise.all([
        loadKPIs(),
        loadChartIncome(),
        loadChartPaymentMethod(),
        loadMovements(),
        loadTopPlates()
    ]);
}

// --------- View: Shift Closures (Modal) ---------
function initShiftsView(){
    const token = localStorage.getItem('token');
    if (document.getElementById('shiftsModal')) return;

    // Button in filter panel alongside PDF/Excel export buttons
    const filterButtons = document.querySelector('#filterPanel .flex.flex-wrap.gap-2');
    if (filterButtons && !document.getElementById('btnShiftsModal')){
        const btn = document.createElement('button');
        btn.id = 'btnShiftsModal';
        btn.className = 'inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors';
        btn.innerHTML = '<i class="fas fa-cash-register mr-2"></i><span>Cierres de Turno</span>';
        filterButtons.appendChild(btn);
        btn.addEventListener('click', ()=>{ loadShifts(); new bootstrap.Modal(document.getElementById('shiftsModal')).show(); });
    }

    // Modal with filters and table
    const modal = document.createElement('div');
    modal.innerHTML = [
      '<div class="modal fade" id="shiftsModal" tabindex="-1" aria-hidden="true">',
      '  <div class="modal-dialog modal-xl">',
      '    <div class="modal-content">',
      '      <div class="modal-header">',
      '        <h5 class="modal-title"><i class="fas fa-cash-register me-2"></i>Cierres de Turno</h5>',
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
      '      </div>',
      '      <div class="modal-body">',
      '        <div class="d-flex flex-wrap gap-2 mb-3">',
      '          <input type="date" id="tFrom" class="form-control form-control-sm" />',
      '          <input type="date" id="tTo" class="form-control form-control-sm" />',
'          <input type="text" id="tUser" class="form-control form-control-sm" placeholder="Usuario" />',
'          <button class="btn btn-sm btn-primary" id="tSearch"><i class="fas fa-filter me-1"></i>Filtrar</button>',
'          <button class="btn btn-sm btn-outline-secondary" id="tClearFilters"><i class="fas fa-times me-1"></i> Limpiar</button>',
'          <button class="btn btn-sm btn-outline-success" id="tExportXlsx"><i class="fas fa-file-excel me-1"></i>Exportar Excel</button>',
      '        </div>',
      '        <div class="table-responsive">',
      '          <table class="table table-sm" id="tbShifts">',
      '            <thead><tr>',
'              <th>#</th><th>Apertura</th><th>Cierre</th><th>Usuario</th>',
'              <th>Base</th><th>Efectivo</th><th>Tarjeta</th><th>QR</th><th>Total</th><th>Diferencia</th><th></th>',
      '            </tr></thead>',
      '            <tbody></tbody>',
      '          </table>',
      '        </div>',
      '      </div>',
      '      <div class="modal-footer">',
      '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal.firstChild);

    // Default dates (local)
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    document.getElementById('tFrom').value = today;
    document.getElementById('tTo').value = today;

    document.getElementById('tSearch').addEventListener('click', loadShifts);
    document.getElementById('tClearFilters').addEventListener('click', ()=>{
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      document.getElementById('tFrom').value = today;
      document.getElementById('tTo').value = today;
      document.getElementById('tUser').value = '';
      loadShifts();
    });

    async function loadShifts(){
      const params = new URLSearchParams({
        from: document.getElementById('tFrom').value,
        to: document.getElementById('tTo').value,
        user: document.getElementById('tUser').value.trim()
      });
      const r = await fetch('/api/reports/shifts?'+params.toString(), { headers:{ 'Authorization':'Bearer '+token } });
      const j = await r.json();
      if (!r.ok) { toast('Error', j.error||'Error listando turnos', 'error'); return; }
      const tb = document.querySelector('#tbShifts tbody');
      tb.innerHTML = '';
      j.data.forEach((t, idx)=>{
        _shiftData[t.id_shift] = t;
        const tr = document.createElement('tr');
        tr.innerHTML = [
          `<td>${idx+1}</td>`,
          `<td>${fmtDate(t.opening_date)}</td>`,
          `<td>${fmtDate(t.closing_date)||''}</td>`,
          `<td>${escHtml(t.user?.username||t.user?.name||t.username||'')}</td>`,
          `<td>${fmt(t.initial_base)}</td>`,
          `<td>${fmt(t.total_cash)}</td>`,
          `<td>${fmt(t.total_card)}</td>`,
          `<td>${fmt(t.total_qr)}</td>`,
          `<td class="fw-bold">${fmt(t.total_general)}</td>`,
          `<td class="${Number(t.difference||0)===0?'text-success':'text-danger'}">${fmt(t.difference)}</td>`,
          `<td><button class=\"btn btn-outline-primary btn-sm\" data-reimp=\"${t.id_shift}\"><i class=\"fas fa-print\"></i></button></td>`
        ].join('');
        tb.appendChild(tr);
      });

      // Reprint
      tb.querySelectorAll('button[data-reimp]').forEach(btn=>{
        btn.addEventListener('click', ()=> reprintShift(btn.getAttribute('data-reimp')));
      });
    }

    function fmt(n){ return fmtCurrency(n); }
    function fmtDate(d){ return window.fmtDate ? window.fmtDate(d) : (d ? new Date(d).toLocaleString() : ''); }
    function escHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }

    // Excel export
    document.getElementById('tExportXlsx').addEventListener('click', async ()=>{
      const lang = 'es';
      const params = new URLSearchParams({
        from: document.getElementById('tFrom').value,
        to: document.getElementById('tTo').value,
        user: document.getElementById('tUser').value.trim(),
        lang
      });
      const res = await fetch('/api/reports/shifts/export/xlsx?'+params.toString(), { headers:{ 'Authorization':'Bearer '+token } });
        if (!res.ok) { const j = await res.json().catch(()=>({error:'Error exportando'})); toast('Error', j.error||'Error exportando', 'error'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `shift_closures_${Date.now()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    const _shiftData = {};
    // Shift reprint
    async function reprintShift(id){
      try{
        const t = _shiftData[id]; if (!t) { toast('Error', 'Datos del turno no disponibles', 'error'); return; }
        const exp = { total: t.total_general||0, cash: t.total_cash||0, card: t.total_card||0, qr: t.total_qr||0 };
        const stats = { total: 0, byType: { car:0, motorcycle:0, bicycle:0 } };
        const res = { user:{ cash:t.total_cash||0, card:t.total_card||0, qr:t.total_qr||0, total:t.total_general||0 }, expected: exp, diff: Number((Number(t.total_general||0) - Number(exp.total||0)).toFixed(2)), obs: t.closing_observation, base_initial: t.initial_base, shift:{ id_shift:t.id_shift, user: (t.user?.username||t.user?.name||t.username||'') }, stats };
        if (window.printSummary){ window.printSummary(res); return; }
        const html = `
          <div style="font-family:Arial,sans-serif;font-size:12px">
            <h3 style="margin:0 0 8px">Cierre de Turno</h3>
            <div>Fecha impresión: ${fmtDate(new Date())}</div>
            <div>Cierre de Turno #${res.shift.id_shift} | Usuario: ${escHtml(res.shift.user)}</div>
            <div>Base inicial: <strong>${fmt(res.base_initial)}</strong></div>
            <div>Total tickets: <strong>${res.stats.total}</strong> (Carros: ${res.stats.byType.car} | Motos: ${res.stats.byType.motorcycle} | Bicicletas: ${res.stats.byType.bicycle})</div>
            <hr/>
            <div style="display:flex;gap:16px">
              <div>
                <div style="font-weight:bold">Conteo Usuario</div>
                <div>Efectivo: ${fmt(res.user.cash)}</div>
                <div>Tarjeta: ${fmt(res.user.card)}</div>
                <div>QR: ${fmt(res.user.qr)}</div>
                <div><strong>Total: ${fmt(res.user.total)}</strong></div>
              </div>
              <div>
                <div style="font-weight:bold">Sistema</div>
                <div>Efectivo: ${fmt(res.expected.cash)}</div>
                <div>Tarjeta: ${fmt(res.expected.card)}</div>
                <div>QR: ${fmt(res.expected.qr)}</div>
                <div><strong>Total: ${fmt(res.expected.total)}</strong></div>
              </div>
            </div>
            <hr/>
            <div><strong>Diferencia: ${fmt(res.diff)}</strong></div>
            ${res.obs?('<div>Obs.: '+escHtml(res.obs)+'</div>'):''}
          </div>`;

        ensurePrintSizeModal();
        const m = new bootstrap.Modal(document.getElementById('shiftsPrintSizeModal'));
        const b58 = document.getElementById('btnShiftsPrint58');
        const b80 = document.getElementById('btnShiftsPrint80');
        const on58 = ()=>{ printHtmlAtWidth(html, 58); cleanup(); };
        const on80 = ()=>{ printHtmlAtWidth(html, 80); cleanup(); };
        function cleanup(){ b58.removeEventListener('click', on58); b80.removeEventListener('click', on80); m.hide(); }
        b58.addEventListener('click', on58);
        b80.addEventListener('click', on80);
        m.show();
      }catch(e){ toast('Error', e.message, 'error'); }
    }

    function printHtmlAtWidth(html, mm){
      const w = window.open('', '_blank', 'width=420,height=700');
      const css = `@page{ size: ${mm}mm auto; margin: 3mm } body{ width:${mm}mm; font-family: Arial, sans-serif; font-size:11px; margin:0 } .wrap{ padding:4mm } hr{ border:none; border-top:1px dashed #999; margin:6px 0 }`;
      w.document.write(`<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Shift Closure Reprint</title><style>${css}</style></head><body><div class=\"wrap\">${html}</div><script>window.print(); setTimeout(()=>window.close(), 300);<\/script></body></html>`);
      w.document.close();
    }

    function ensurePrintSizeModal(){
      if (document.getElementById('shiftsPrintSizeModal')) return;
      const div = document.createElement('div');
      div.innerHTML = [
        '<div class="modal fade" id="shiftsPrintSizeModal" tabindex="-1" aria-hidden="true">',
        '  <div class="modal-dialog">',
        '    <div class="modal-content">',
        '      <div class="modal-header">',
        '        <h5 class="modal-title">Seleccionar tamaño de impresión</h5>',
        '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
        '      </div>',
        '      <div class="modal-body">',
        '        <p class="mb-2">Elige el ancho del papel térmico para imprimir el cierre.</p>',
        '        <div class="d-flex gap-2">',
        '          <button type="button" id="btnShiftsPrint58" class="btn btn-primary">58 mm</button>',
        '          <button type="button" id="btnShiftsPrint80" class="btn btn-outline-primary">80 mm</button>',
        '        </div>',
        '      </div>',
        '      <div class="modal-footer">',
        '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(div.firstChild);
    }
}

async function loadKPIs(){
    try{
        const { from, to } = baseParams();
        const res = await fetch(`/api/reports/kpis?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const j = await res.json();
        if(!res.ok) throw new Error(j.error||'Error KPIs');
        const d = j.data || {};
        document.getElementById('kpiIncome').textContent = formatCurrency(d.income||0);
        document.getElementById('kpiTickets').textContent = String(d.tickets||0);
        document.getElementById('kpiAverage').textContent = formatCurrency(d.averageTicket||0);
        document.getElementById('kpiOccupancy').textContent = (d.occupancy!=null? d.occupancy:0) + '%';
    }catch(e){ toast('Error', e.message, 'error'); }
}

async function loadChartIncome(){
    try{
        const { from, to } = baseParams();
        const paymentMethod = document.getElementById('fPaymentMethod').value;
        const q = new URLSearchParams({ from, to });
        if (paymentMethod) q.append('paymentMethod', paymentMethod);
        const res = await fetch(`/api/reports/income-by-day?${q.toString()}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.error||'Error ingresos por día');
        const labels = j.data.map(r=>r.date);
        const data = j.data.map(r=>Number(r.total||0));
        renderLineChart('chartIncome', labels, data, 'Ingresos');
    }catch(e){ toast('Error', e.message, 'error'); }
}

async function loadChartPaymentMethod(){
    try{
        const { from, to } = baseParams();
        const res = await fetch(`/api/reports/income-by-payment-method?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.error||'Error ingresos por método');
        const labels = j.data.map(r=>paymentMethodRep[r.payment_method] || r.payment_method);
        const data = j.data.map(r=>Number(r.total||0));
        renderDoughnut('chartPaymentMethod', labels, data);
    }catch(e){ toast('Error', e.message, 'error'); }
}

async function loadMovements(){
    try{
        const { from, to } = baseParams();
        const type = document.getElementById('fType').value;
        const status = document.getElementById('fStatus').value;
        const plate = document.getElementById('fPlate').value.trim();
        const q = new URLSearchParams({ from, to, page:String(__pageRep), pageSize:String(__pageSizeRep) });
        if (type) q.append('type', type);
        if (status) q.append('status', status);
        if (plate) q.append('plate', plate);
        const res = await fetch(`/api/reports/movements?${q.toString()}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.error||'Error movimientos');
        const tb = document.getElementById('tbMov');
        if (!j.data || j.data.length === 0){
            tb.innerHTML = '<tr><td colspan="7" class="text-center">Sin registros</td></tr>';
        } else {
            tb.innerHTML = j.data.map(r=>`
                <tr>
                    <td>${r.id}</td>
                    <td>${r.license_plate}</td>
                    <td>${vehicleTypeRep[r.type] || r.type}</td>
                    <td>${formatDateTime(r.entry_date)}</td>
                    <td>${r.exit_date? formatDateTime(r.exit_date): '-'}</td>
                    <td><span class="badge bg-${r.status==='activo'?'success':'secondary'}">${statusLabelsRep[r.status] || r.status}</span></td>
                    <td>${r.total_to_pay!=null? formatCurrency(r.total_to_pay) : '-'}</td>
                    <td>
                        ${r.status==='completado' ? `<button class="btn btn-sm btn-outline-primary" onclick="reprintExit(${r.id})"><i class='fas fa-print'></i></button>` : ''}
                    </td>
                </tr>
            `).join('');
        }
        const total = j.paging?.total || 0;
        const maxPage = Math.max(0, Math.ceil(total / __pageSizeRep) - 1);
        document.getElementById('btnPrev').disabled = __pageRep <= 0;
        document.getElementById('btnNext').disabled = __pageRep >= maxPage;
        document.getElementById('pageInfo').textContent = 'Página ' + (__pageRep+1) + ' de ' + (maxPage+1);
        document.getElementById('movPaging').textContent = 'Total: ' + total;
    }catch(e){ toast('Error', e.message, 'error'); }
}

// Reprint exit ticket from reports
window.reprintExit = async function(idMovement){
    try{
        const res = await fetch(`/api/movements/${idMovement}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error||'Reimpresión de Salida');
        const m = j.data;
        const plate = m.vehicle?.license_plate || m.license_plate || '';
        const vtype = m.vehicle?.type || m.type || '';
        const f = {
            id_movement: m.id_movement,
            license_plate: plate,
            type: vtype,
            entry_date: m.entry_date,
            exit_date: m.exit_date,
            minute_rate: m.rate?.minute_rate || 0,
            hourly_rate: m.rate?.hourly_rate || 0,
            full_day_rate: m.rate?.full_day_rate || 0,
            total_to_pay: m.total_to_pay || 0,
            paymentsList: (m.payments || []).map(p => ({
                payment_method: p.payment_method,
                amount: p.amount
            }))
        };
        const company = await fetch('/api/companies/me',{ headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} }).then(r=>r.json()).then(x=>x.data).catch(()=>null);
        let logoUrl = '';
        try{
            const lr = await fetch('/api/companies/logo',{headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
            if (lr.ok){ const b = await lr.blob(); logoUrl = await new Promise((res)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b); }); }
        }catch(_){ }
        let cfg = null;
        try{ cfg = await fetch('/api/companies/config',{headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`}}).then(r=>r.json()).then(x=>x.data); }catch(_){ }
        const companyInfo = Object.assign({}, company, { logo_url: logoUrl||company?.logo_url }, cfg||{});

        if (window.renderReceipt && window.printHTML){
            const htmlTicket = renderReceipt('EXIT', null, f, companyInfo);
            printHTML(htmlTicket, 'Factura de Salida', 80, { t:'exit', e:companyInfo?.tax_id, m:f.id_movement, p:f.license_plate, fs:f.exit_date, total: f.total_to_pay });
            return;
        }
        const header = `
            <div style="text-align:center">
                ${companyInfo.logo_url ? `<img src="${companyInfo.logo_url}" alt="logo" style="max-height:60px">` : ''}
                <div><strong>${companyInfo.name||'Empresa'}</strong></div>
                <div>TAX ID: ${companyInfo.tax_id||''}</div>
                <div>${companyInfo.address||''} ${companyInfo.phone? ' - '+companyInfo.phone:''}</div>
                <div>Horario: <strong>${(companyInfo?.operation_24h)?'24 horas':((fmtTimeRS(companyInfo?.opening_time)||'')+' - '+(fmtTimeRS(companyInfo?.closing_time)||''))}</strong></div>
                <hr/>
                <div><strong>SALIDA</strong></div>
            </div>`;
        const paymentsHtml = (f.paymentsList && f.paymentsList.length)
            ? `<div><strong>Pagos</strong></div>` + f.paymentsList.map(p=>`<div>${p.payment_method}: <strong>${formatCurrency(Number(p.amount||0))}</strong></div>`).join('')
            : '';
        const body = `
            <div>Movimiento: <strong>#${f.id_movement}</strong></div>
            <div>Placa: <strong>${f.license_plate}</strong></div>
            <div>Tipo: <strong>${f.type}</strong></div>
            <div>Entrada: <strong>${fmtDate(f.entry_date)}</strong></div>
            <div>Salida: <strong>${fmtDate(f.exit_date)}</strong></div>
            <hr/>
            <div>Tarifas</div>
            <div>Minuto: <strong>${f.minute_rate}</strong></div>
            <div>Hora: <strong>${f.hourly_rate}</strong></div>
            <div>Día: <strong>${f.full_day_rate}</strong></div>
            <hr/>
            <div>Total a pagar: <strong>${formatCurrency(f.total_to_pay)}</strong></div>
            ${paymentsHtml}
            <div>Atendido por: ${localStorage.getItem('userName')||''}</div>
            <div>Fecha impresión: ${fmtDate(new Date())}</div>
            <div class="barcode" style="text-align:center;margin-top:6px"><svg id="barcodeSvg"></svg><div style="font-size:12px">${f.license_plate || ''}</div></div>`;
        const printWin = window.open('','_blank','width=420,height=700');
        const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reprint</title>
            <style>@page{ size:80mm auto; margin: 3mm } body{ width:80mm; font-family: Arial, sans-serif; font-size:11px; margin:0 } .wrap{ padding:4mm } hr{ border:none; border-top:1px dashed #999; margin:6px 0 } img{ display:block; margin:0 auto 6px; max-width:100% } .qr{ display:flex; justify-content:center; margin-top:6px } .barcode{ display:flex; justify-content:center; margin-top:6px }</style>
            </head><body><div class="wrap">${header+body}<div class="qr"><div id="qrcode"></div></div></div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
            <script>(function(){ try{ new QRCode(document.getElementById('qrcode'), {text:'https://yoursite.com/', width:96, height:96}); }catch(e){} var svg=document.getElementById('barcodeSvg'); if(svg){ JsBarcode(svg, '${f.license_plate || ''}', {format:'code128', displayValue:false, height:40}); } setTimeout(function(){ window.print(); window.close(); }, 400); })();<\/script>
            </body></html>`;
        printWin.document.write(doc);
        printWin.document.close();
        printWin.focus();
    }catch(e){ toast('Error', e.message, 'error'); }
}

function fmtTimeRS(t){ if(!t) return ''; const s=String(t); return s.length>=5? s.substring(0,5): s; }

async function loadTopPlates(){
    try{
        const { from, to } = baseParams();
        const res = await fetch(`/api/reports/top-plates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=10`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.error||'Error top placas');
        const tb = document.getElementById('tbTop');
        if (!j.data || j.data.length === 0){
            tb.innerHTML = '<tr><td colspan="4" class="text-center">Sin registros</td></tr>';
        } else {
            tb.innerHTML = j.data.map(r=>`
                <tr>
                    <td>${r.license_plate}</td>
                    <td>${vehicleTypeRep[r.type] || r.type}</td>
                    <td>${r.visits}</td>
                    <td>${formatCurrency(r.total||0)}</td>
                </tr>
            `).join('');
        }
    }catch(e){ toast('Error', e.message, 'error'); }
}

// Render charts
function renderLineChart(id, labels, data, label){
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (chartIncome) { chartIncome.destroy(); }
    chartIncome = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label, data, fill:false, borderColor:'#0d6efd', tension:0.25 }]},
        options: { responsive: true, plugins:{ legend:{ display:false } }, scales:{ y:{ ticks:{ callback:(v)=>formatCurrency(v) } } } }
    });
}

function renderDoughnut(id, labels, data){
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (chartPaymentMethod) { chartPaymentMethod.destroy(); }
    chartPaymentMethod = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor:['#198754','#0d6efd','#ffc107'] }] },
        options: { responsive:true, plugins:{ legend:{ position:'bottom' } } }
    });
}

// PDF export from backend
async function exportToPDF(){
    try{
        const { from, to } = baseParams();
        const type = document.getElementById('fType').value;
        const status = document.getElementById('fStatus').value;
        const plate = document.getElementById('fPlate').value.trim();
        const lang = 'es';
        const q = new URLSearchParams({ from, to, lang });
        if (type) q.append('type', type);
        if (status) q.append('status', status);
        if (plate) q.append('plate', plate);
        toast('Información', 'Generando PDF...', 'info');
        const res = await fetch(`/api/reports/export/pdf?${q.toString()}`, { headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` } });
        if (!res.ok) { const j = await res.json().catch(()=>({error:'Error'})); toast('Error', j.error||'Error exportando', 'error'); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `reporte_${from}_${to}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast('Éxito', 'Archivo descargado', 'success');
    }catch(err){
        toast('Error', err.message, 'error');
    }
}

async function exportToExcelBackend(){
    try{
        const { from, to } = baseParams();
        const type = document.getElementById('fType').value;
        const status = document.getElementById('fStatus').value;
        const plate = document.getElementById('fPlate').value.trim();
        const lang = 'es';
        const q = new URLSearchParams({ from, to, lang });
        if (type) q.append('type', type);
        if (status) q.append('status', status);
        if (plate) q.append('plate', plate);
        const res = await fetch(`/api/reports/export/xlsx?${q.toString()}`, { headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` } });
        if (!res.ok) { const j = await res.json().catch(()=>({error:'Error'})); toast('Error', j.error||'Error exportando', 'error'); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `reports_${Date.now()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast('Éxito', 'Archivo descargado', 'success');
    }catch(err){ toast('Error', err.message, 'error'); }
}

function setToday(){ const d = new Date(); const s = d.toISOString().split('T')[0]; document.getElementById('fFrom').value = s; document.getElementById('fTo').value = s; }
function setLast7(){ const d = new Date(); const s = new Date(d.getTime()-6*24*3600*1000).toISOString().split('T')[0]; document.getElementById('fFrom').value = s; document.getElementById('fTo').value = d.toISOString().split('T')[0]; }
function setMonth(){ const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]; document.getElementById('fFrom').value = s; document.getElementById('fTo').value = d.toISOString().split('T')[0]; }

function formatCurrency(amount) {
    return fmtCurrency(amount);
}

function formatDateTime(date) {
    return fmtDate(date);
}

function toast(title, message, type) {
    showToast(title, message, type);
}
