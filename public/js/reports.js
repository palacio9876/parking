// Frontend Reports
// Related to: public/admin/reportes.html and routes /api/reports/*

let __pageRep = 0;
let __pageSizeRep = 20;
let chartIncome = null;
let chartPaymentMethod = null;

document.addEventListener('DOMContentLoaded', () => {
    // Basic auth
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }

    document.getElementById('userName').textContent = localStorage.getItem('userName') || t('reports.user');
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
    const container = document.querySelector('.container-fluid');
    if (!container || document.getElementById('shiftsModal')) {
        return;
    }

    // Button in main filters header
    const filtrosHeader = document.querySelector('.card.mb-4 .card-header') || container.querySelector('.card .card-header');
    if (filtrosHeader && !document.getElementById('btnShiftsModal')){
        const btn = document.createElement('button');
        btn.id = 'btnShiftsModal';
        btn.className = 'btn btn-outline-dark btn-sm ms-2';
        btn.innerHTML = '<i class="fas fa-cash-register me-1"></i>' + t('reports.shiftClosures');
        filtrosHeader.appendChild(btn);
        btn.addEventListener('click', ()=>{ loadShifts(); new bootstrap.Modal(document.getElementById('shiftsModal')).show(); });
    }

    // Modal with filters and table
    const modal = document.createElement('div');
    modal.innerHTML = [
      '<div class="modal fade" id="shiftsModal" tabindex="-1" aria-hidden="true">',
      '  <div class="modal-dialog modal-xl">',
      '    <div class="modal-content">',
      '      <div class="modal-header">',
      '        <h5 class="modal-title"><i class="fas fa-cash-register me-2"></i>' + t('reports.shiftClosures') + '</h5>',
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
      '      </div>',
      '      <div class="modal-body">',
      '        <div class="d-flex flex-wrap gap-2 mb-3">',
      '          <input type="date" id="tFrom" class="form-control form-control-sm" />',
      '          <input type="date" id="tTo" class="form-control form-control-sm" />',
'          <input type="text" id="tUser" class="form-control form-control-sm" placeholder="' + t('reports.searchUser') + '" />',
'          <button class="btn btn-sm btn-primary" id="tSearch"><i class="fas fa-filter me-1"></i>' + t('common.filter') + '</button>',
'          <button class="btn btn-sm btn-outline-success" id="tExportXlsx"><i class="fas fa-file-excel me-1"></i>' + t('reports.exportExcel') + '</button>',
      '        </div>',
      '        <div class="table-responsive">',
      '          <table class="table table-sm" id="tbShifts">',
      '            <thead><tr>',
'              <th>#</th><th>' + t('reports.opening') + '</th><th>' + t('reports.closing') + '</th><th>' + t('reports.user') + '</th>',
'              <th>' + t('reports.base') + '</th><th>' + t('payment.cash') + '</th><th>' + t('payment.card') + '</th><th>' + t('payment.qr') + '</th><th>' + t('common.total') + '</th><th>' + t('reports.difference') + '</th><th></th>',
      '            </tr></thead>',
      '            <tbody></tbody>',
      '          </table>',
      '        </div>',
      '      </div>',
      '      <div class="modal-footer">',
      '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">' + t('common.close') + '</button>',
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

    async function loadShifts(){
      const params = new URLSearchParams({
        from: document.getElementById('tFrom').value,
        to: document.getElementById('tTo').value,
        user: document.getElementById('tUser').value.trim()
      });
      const r = await fetch('/api/reports/shifts?'+params.toString(), { headers:{ 'Authorization':'Bearer '+token } });
      const j = await r.json();
      if (!r.ok) { toast(t('common.error'), j.message||t('reports.shiftsError'), 'error'); return; }
      const tb = document.querySelector('#tbShifts tbody');
      tb.innerHTML = '';
      j.data.forEach((t, idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = [
          `<td>${idx+1}</td>`,
          `<td>${fmtDate(t.opening_date)}</td>`,
          `<td>${fmtDate(t.closing_date)||''}</td>`,
          `<td>${escHtml(t.user||t.username||'')}</td>`,
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
      const params = new URLSearchParams({
        from: document.getElementById('tFrom').value,
        to: document.getElementById('tTo').value,
        user: document.getElementById('tUser').value.trim()
      });
      const res = await fetch('/api/reports/shifts/export/xlsx?'+params.toString(), { headers:{ 'Authorization':'Bearer '+token } });
      if (!res.ok) { const j = await res.json().catch(()=>({message:t('reports.exportError')})); toast(t('common.error'), j.message||t('reports.exportError'), 'error'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `shift_closures_${Date.now()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    // Shift reprint
    async function reprintShift(id){
      try{
        const r = await fetch('/api/shifts/detail/'+id, { headers:{ 'Authorization':'Bearer '+token } });
        const j = await r.json(); if(!r.ok) throw new Error(j.message||'Error');
        const t = j.data.shift; const exp = j.data.expected||{ total:0, cash:0, card:0, qr:0 }; const stats = j.data.stats||{ total:0, byType:{car:0,motorcycle:0,bicycle:0}};
        const res = { user:{ cash:t.total_cash||0, card:t.total_card||0, qr:t.total_qr||0, total:t.total_general||0 }, expected: exp, diff: Number((Number(t.total_general||0) - Number(exp.total||0)).toFixed(2)), obs: t.closing_observation, base_initial: t.initial_base, shift:{ id_shift:t.id_shift, user: (t.user||t.username||'') }, stats };
        if (window.printSummary){ window.printSummary(res); return; }
        const html = `
          <div style="font-family:Arial,sans-serif;font-size:12px">
            <h3 style="margin:0 0 8px">${t('reports.shiftClosure')}</h3>
            <div>${t('dashboard.printDate')}: ${fmtDate(new Date())}</div>
            <div>${t('reports.shiftClosure')} #${res.shift.id_shift} | ${t('reports.user')}: ${escHtml(res.shift.user)}</div>
            <div>${t('reports.initialBase')}: <strong>${fmt(res.base_initial)}</strong></div>
            <div>${t('reports.totalTickets')}: <strong>${res.stats.total}</strong> (${t('reports.cars')}: ${res.stats.byType.car} | ${t('reports.motorcycles')}: ${res.stats.byType.motorcycle} | ${t('reports.bicycles')}: ${res.stats.byType.bicycle})</div>
            <hr/>
            <div style="display:flex;gap:16px">
              <div>
                <div style="font-weight:bold">${t('reports.userCount')}</div>
                <div>${t('payment.cash')}: ${fmt(res.user.cash)}</div>
                <div>${t('payment.card')}: ${fmt(res.user.card)}</div>
                <div>${t('payment.qr')}: ${fmt(res.user.qr)}</div>
                <div><strong>${t('common.total')}: ${fmt(res.user.total)}</strong></div>
              </div>
              <div>
                <div style="font-weight:bold">${t('reports.system')}</div>
                <div>${t('payment.cash')}: ${fmt(res.expected.cash)}</div>
                <div>${t('payment.card')}: ${fmt(res.expected.card)}</div>
                <div>${t('payment.qr')}: ${fmt(res.expected.qr)}</div>
                <div><strong>${t('common.total')}: ${fmt(res.expected.total)}</strong></div>
              </div>
            </div>
            <hr/>
            <div><strong>${t('reports.difference')}: ${fmt(res.diff)}</strong></div>
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
      }catch(e){ toast(t('common.error'), e.message, 'error'); }
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
        '        <h5 class="modal-title">' + t('reports.selectPrintSize') + '</h5>',
        '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
        '      </div>',
        '      <div class="modal-body">',
        '        <p class="mb-2">' + t('reports.printSizeHelp') + '</p>',
        '        <div class="d-flex gap-2">',
        '          <button type="button" id="btnShiftsPrint58" class="btn btn-primary">58 mm</button>',
        '          <button type="button" id="btnShiftsPrint80" class="btn btn-outline-primary">80 mm</button>',
        '        </div>',
        '      </div>',
        '      <div class="modal-footer">',
        '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">' + t('common.cancel') + '</button>',
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
        if(!res.ok) throw new Error(j.message||t('reports.kpiError'));
        const d = j.data || {};
        document.getElementById('kpiIncome').textContent = formatCurrency(d.income||0);
        document.getElementById('kpiTickets').textContent = String(d.tickets||0);
        document.getElementById('kpiAverage').textContent = formatCurrency(d.averageTicket||0);
        document.getElementById('kpiOccupancy').textContent = (d.occupancy!=null? d.occupancy:0) + '%';
    }catch(e){ toast(t('common.error'), e.message, 'error'); }
}

async function loadChartIncome(){
    try{
        const { from, to } = baseParams();
        const paymentMethod = document.getElementById('fPaymentMethod').value;
        const q = new URLSearchParams({ from, to });
        if (paymentMethod) q.append('paymentMethod', paymentMethod);
        const res = await fetch(`/api/reports/income-by-day?${q.toString()}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||t('reports.incomeDayError'));
        const labels = j.data.map(r=>r.date);
        const data = j.data.map(r=>Number(r.total||0));
        renderLineChart('chartIncome', labels, data, t('reports.income'));
    }catch(e){ toast(t('common.error'), e.message, 'error'); }
}

async function loadChartPaymentMethod(){
    try{
        const { from, to } = baseParams();
        const res = await fetch(`/api/reports/income-by-payment-method?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||t('reports.incomeMethodError'));
        const labels = j.data.map(r=>r.payment_method);
        const data = j.data.map(r=>Number(r.total||0));
        renderDoughnut('chartPaymentMethod', labels, data);
    }catch(e){ toast(t('common.error'), e.message, 'error'); }
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
        if(!res.ok) throw new Error(j.message||t('reports.movementsError'));
        const tb = document.getElementById('tbMov');
        if (!j.data || j.data.length === 0){
            tb.innerHTML = '<tr><td colspan="7" class="text-center">' + t('common.noRecords') + '</td></tr>';
        } else {
            tb.innerHTML = j.data.map(r=>`
                <tr>
                    <td>${r.id}</td>
                    <td>${r.license_plate}</td>
                    <td>${r.type}</td>
                    <td>${formatDateTime(r.entry_date)}</td>
                    <td>${r.exit_date? formatDateTime(r.exit_date): '-'}</td>
                    <td><span class="badge bg-${r.status==='active'?'success':'secondary'}">${r.status}</span></td>
                    <td>${r.total_to_pay!=null? formatCurrency(r.total_to_pay) : '-'}</td>
                    <td>
                        ${r.status==='completed' ? `<button class="btn btn-sm btn-outline-primary" onclick="reprintExit(${r.id})"><i class='fas fa-print'></i></button>` : ''}
                    </td>
                </tr>
            `).join('');
        }
        const total = j.paging?.total || 0;
        const maxPage = Math.max(0, Math.ceil(total / __pageSizeRep) - 1);
        document.getElementById('btnPrev').disabled = __pageRep <= 0;
        document.getElementById('btnNext').disabled = __pageRep >= maxPage;
        document.getElementById('pageInfo').textContent = t('common.page') + ' ' + (__pageRep+1) + ' ' + t('common.of') + ' ' + (maxPage+1);
        document.getElementById('movPaging').textContent = t('common.total') + ': ' + total;
    }catch(e){ toast(t('common.error'), e.message, 'error'); }
}

// Reprint exit ticket from reports
window.reprintExit = async function(idMovement){
    try{
        // Get invoice with entry-exit structure
        const res = await fetch(`/api/movements/invoice/${idMovement}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if (!res.ok) throw new Error(j.message||t('reports.reprintExit'));
        const f = j.data;
        // Company, logo (DataURL) and settings
        const company = await fetch('/api/companies/me',{ headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} }).then(r=>r.json()).then(x=>x.data).catch(()=>null);
        let logoUrl = '';
        try{
            const lr = await fetch('/api/companies/logo',{headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
            if (lr.ok){ const b = await lr.blob(); logoUrl = await new Promise((res)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b); }); }
        }catch(_){ }
        let cfg = null;
        try{ cfg = await fetch('/api/companies/config',{headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`}}).then(r=>r.json()).then(x=>x.data); }catch(_){ }
        const companyInfo = Object.assign({}, company, { logo_url: logoUrl||company?.logo_url }, cfg||{});

        // Reuse same entry-exit render if available
        if (window.renderReceipt && window.printHTML){
            const htmlTicket = renderReceipt('EXIT', null, f, companyInfo);
            printHTML(htmlTicket, t('reprints.exitInvoice'), 80, { t:'exit', e:companyInfo?.tax_id, m:f.movementId, p:f.license_plate, fs:f.exitDate, total: f.total });
            return;
        }
        // Simple fallback (if reports is opened in isolation)
        const header = `
            <div style="text-align:center">
                ${companyInfo.logo_url ? `<img src="${companyInfo.logo_url}" alt="logo" style="max-height:60px">` : ''}
                <div><strong>${companyInfo.name||t('company.name')}</strong></div>
                <div>TAX ID: ${companyInfo.tax_id||''}</div>
                <div>${companyInfo.address||''} ${companyInfo.phone? ' - '+companyInfo.phone:''}</div>
                <div>${t('company.schedule')}: <strong>${(companyInfo?.operation_24h)?t('time.h24'):((fmtTimeRS(companyInfo?.opening_time)||'')+' - '+(fmtTimeRS(companyInfo?.closing_time)||''))}</strong></div>
                <hr/>
                <div><strong>${t('dashboard.exitLabel')}</strong></div>
            </div>`;
        const paymentsHtml = (f.paymentsList && f.paymentsList.length)
            ? `<div><strong>${t('vehicles.historyPayments')}</strong></div>` + f.paymentsList.map(p=>`<div>${p.payment_method}: <strong>${formatCurrency(Number(p.amount||0))}</strong></div>`).join('')
            : '';
        const body = `
            <div>${t('dashboard.movement')}: <strong>#${f.movementId}</strong></div>
            <div>${t('dashboard.plate')}: <strong>${f.license_plate}</strong></div>
            <div>${t('dashboard.type')}: <strong>${f.type}</strong></div>
            <div>${t('dashboard.entry')}: <strong>${fmtDate(f.entryDate)}</strong></div>
            <div>${t('dashboard.exit')}: <strong>${fmtDate(f.exitDate)}</strong></div>
            <hr/>
            <div>Rates</div>
            <div>Minute: <strong>${f.rate.minute_rate}</strong></div>
            <div>Hour: <strong>${f.rate.hourly_rate}</strong></div>
            <div>Day: <strong>${f.rate.full_day_rate}</strong></div>
            <hr/>
            <div>${t('dashboard.totalToPay')}: <strong>${formatCurrency(f.total)}</strong></div>
            ${paymentsHtml}
            <div>${t('dashboard.attendedBy')}: ${localStorage.getItem('userName')||''}</div>
            <div>${t('dashboard.printDate')}: ${fmtDate(new Date())}</div>`;
        const printWin = window.open('','_blank','width=420,height=700');
        const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reprint</title>
            <style>@page{ size:80mm auto; margin: 3mm } body{ width:80mm; font-family: Arial, sans-serif; font-size:11px; margin:0 } .wrap{ padding:4mm } hr{ border:none; border-top:1px dashed #999; margin:6px 0 } img{ display:block; margin:0 auto 6px; max-width:100% } .qr{ display:flex; justify-content:center; margin-top:6px }</style>
            </head><body><div class="wrap">${header+body}<div class="qr"><div id="qrcode"></div></div></div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
            <script>(function(){ try{ new QRCode(document.getElementById('qrcode'), {text:'https://yoursite.com/', width:96, height:96}); }catch(e){} setTimeout(function(){ window.print(); window.close(); }, 400); })();<\/script>
            </body></html>`;
        printWin.document.write(doc);
        printWin.document.close();
        printWin.focus();
    }catch(e){ toast(t('common.error'), e.message, 'error'); }
}

function fmtTimeRS(t){ if(!t) return ''; const s=String(t); return s.length>=5? s.substring(0,5): s; }

async function loadTopPlates(){
    try{
        const { from, to } = baseParams();
        const res = await fetch(`/api/reports/top-plates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=10`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||t('reports.topPlatesError'));
        const tb = document.getElementById('tbTop');
        if (!j.data || j.data.length === 0){
            tb.innerHTML = '<tr><td colspan="4" class="text-center">' + t('common.noRecords') + '</td></tr>';
        } else {
            tb.innerHTML = j.data.map(r=>`
                <tr>
                    <td>${r.license_plate}</td>
                    <td>${r.type}</td>
                    <td>${r.visits}</td>
                    <td>${formatCurrency(r.total||0)}</td>
                </tr>
            `).join('');
        }
    }catch(e){ toast(t('common.error'), e.message, 'error'); }
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

// PDF export with design
async function exportToPDF(){
    try{
        const { from, to } = baseParams();
        const type = document.getElementById('fType').value;
        const status = document.getElementById('fStatus').value;
        const plate = document.getElementById('fPlate').value.trim();
        const q = new URLSearchParams({ from, to, limit:'1000' });
        if (type) q.append('type', type);
        if (status) q.append('status', status);
        if (plate) q.append('plate', plate);
        toast(t('common.info'), t('reports.generatingPdf'), 'info');
    }catch(err){
        toast(t('common.error'), err.message, 'error');
    }
}

async function exportToExcelBackend(){
    try{
        const { from, to } = baseParams();
        const type = document.getElementById('fType').value;
        const status = document.getElementById('fStatus').value;
        const plate = document.getElementById('fPlate').value.trim();
        const q = new URLSearchParams({ from, to });
        if (type) q.append('type', type);
        if (status) q.append('status', status);
        if (plate) q.append('plate', plate);
        const res = await fetch(`/api/reports/export/xlsx?${q.toString()}`, { headers:{ 'Authorization':`Bearer ${localStorage.getItem('token')}` } });
        if (!res.ok) { const j = await res.json().catch(()=>({message:t('common.error')})); toast(t('common.error'), j.message||t('reports.exportError'), 'error'); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `reports_${Date.now()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast(t('common.success'), t('reports.fileDownloaded'), 'success');
    }catch(err){ toast(t('common.error'), err.message, 'error'); }
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
    const container = document.getElementById('toastContainer');
    if (!container) { console[type==='error'?'error':'log'](message); return; }
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
