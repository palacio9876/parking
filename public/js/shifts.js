// Shift management: opening/closing, modal and gating
// Related to: src/routes/shifts.js (API) and admin pages
(function(){
	const token = localStorage.getItem('token');
	if (!token) return;

	// Inject modal only once
	if (document.getElementById('shiftModal')) return;

	const modalHtml = [
		'<div class="modal fade" id="shiftModal" tabindex="-1" aria-hidden="true">',
			'<div class="modal-dialog">',
				'<div class="modal-content">',
					'<div class="modal-header">',
						'<h5 class="modal-title"><i class="bi bi-cash-coin me-2"></i>' + t('shifts.title') + '</h5>',
						'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
					'</div>',
					'<div class="modal-body">',
						'<div id="shiftAlert" class="alert d-none" role="alert"></div>',
						'<div id="viewOpening">',
							'<div class="mb-3">',
								'<label class="form-label">' + t('shifts.initialBase') + '</label>',
								'<input type="number" min="0" step="0.01" id="initialBase" class="form-control" placeholder="0.00" />',
							'</div>',
							'<div class="mb-2">',
								'<label class="form-label">' + t('shifts.observation') + '</label>',
								'<input type="text" id="obsOpening" class="form-control" maxlength="255" />',
							'</div>',
							'<div class="small text-muted">' + t('shifts.youMustOpen') + '</div>',
						'</div>',
						'<div id="viewClosing" class="d-none">',
							'<div class="row g-2">',
								'<div class="col-6">',
									'<label class="form-label">' + t('shifts.cash') + '</label>',
									'<input type="number" min="0" step="0.01" id="sumCash" class="form-control" placeholder="0.00" />',
								'</div>',
								'<div class="col-6">',
									'<label class="form-label">' + t('shifts.card') + '</label>',
									'<input type="number" min="0" step="0.01" id="sumCard" class="form-control" placeholder="0.00" />',
								'</div>',
								'<div class="col-6">',
									'<label class="form-label">' + t('shifts.qr') + '</label>',
									'<input type="number" min="0" step="0.01" id="sumQR" class="form-control" placeholder="0.00" />',
								'</div>',
								'<div class="col-6">',
									'<label class="form-label">' + t('shifts.total') + '</label>',
									'<input type="number" min="0" step="0.01" id="sumTotal" class="form-control" placeholder="0.00" readonly />',
								'</div>',
							'</div>',
							'<div class="mt-2">',
								'<div class="d-flex justify-content-between">',
									'<div>' + t('shifts.systemExpected') + ' <strong id="sumExpected">$0</strong></div>',
									'<div>' + t('shifts.difference') + ': <strong id="sumDiffLive">$0</strong></div>',
								'</div>',
								'<div class="form-text">' + t('shifts.diffHelp') + '</div>',
							'</div>',
							'<div class="mb-2 mt-2">',
								'<label class="form-label">' + t('shifts.observationClosing') + '</label>',
								'<input type="text" id="obsClosing" class="form-control" maxlength="255" />',
							'</div>',
							'<div class="small text-muted">' + t('shifts.whenClosing') + '</div>',
						'</div>',
					'</div>',
					'<div class="modal-footer">',
						'<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">' + t('common.close') + '</button>',
						'<button type="button" class="btn btn-primary" id="btnOpenShift">' + t('shifts.open') + '</button>',
						'<button type="button" class="btn btn-success d-none" id="btnCloseShift">' + t('shifts.close') + '</button>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join('');

	const wrap = document.createElement('div');
	wrap.innerHTML = modalHtml;
	document.body.appendChild(wrap.firstChild);

	const modal = new bootstrap.Modal(document.getElementById('shiftModal'));
	const alertBox = document.getElementById('shiftAlert');
	const viewA = document.getElementById('viewOpening');
	const viewC = document.getElementById('viewClosing');
	const btnOpen = document.getElementById('btnOpenShift');
	const btnClose = document.getElementById('btnCloseShift');

	function openClosingModal(){
		viewA.classList.add('d-none');
		viewC.classList.remove('d-none');
		btnOpen.classList.add('d-none');
		btnClose.classList.remove('d-none');
		alertBox.className = 'alert d-none';
		fetchExpectedSummary();
		modal.show();
	}

	function showAlert(type, msg){
		alertBox.className = 'alert alert-'+type;
		alertBox.textContent = msg;
	}

	let shiftOpen = false;

	async function currentShift(){
		const r = await fetch('/api/shifts/current', { headers:{ 'Authorization':'Bearer '+token }});
		const j = await r.json();
		return j.data || null;
	}

	function setEntryExitEnabled(enabled){
		var inBtn = document.querySelector('#formEntry button[type="submit"]');
		var outBtn = document.querySelector('#formExit button[type="submit"]');
		if (inBtn) inBtn.disabled = !enabled;
		if (outBtn) outBtn.disabled = !enabled;
	}

	function updateGuardUI(){
		// Link quick actions (dashboard)
		Array.from(document.querySelectorAll('a[href*="entry-exit"]')).forEach(a=>{
			if (!a.__guarded){
				a.addEventListener('click', function(e){ if(!shiftOpen){ e.preventDefault(); requireShift(); }}, true);
				a.__guarded = true;
			}
		});
		// Entry/exit forms (entry-exit view)
		document.addEventListener('submit', function(e){
			var id = (e.target && e.target.id)||'';
			if ((id==='formEntry' || id==='formExit') && !shiftOpen){ e.preventDefault(); e.stopPropagation(); requireShift(); }
		}, true);
		setEntryExitEnabled(shiftOpen);

		// Indicator in topbar if navbar exists
		let badge = document.getElementById('shiftBadge');
		if (!badge){
			const nav = document.querySelector('.navbar .container-fluid .navbar-collapse, .navbar .container-fluid');
			if (nav){
				badge = document.createElement('span');
				badge.id = 'shiftBadge';
				badge.className = 'ms-2 badge rounded-pill';
				nav.appendChild(badge);
				// Quick button
				const quick = document.createElement('button');
				quick.id = 'shiftQuickBtn';
				quick.type = 'button';
				quick.className = 'btn btn-outline-danger btn-sm ms-2';
				quick.innerHTML = '<i class="bi bi-door-closed me-1"></i>' + t('shifts.closeQuick');
				nav.appendChild(quick);
				quick.addEventListener('click', function(){ if (shiftOpen) { openClosingModal(); } else { requireShift(); } });
			}
		}
		if (badge){
			if (shiftOpen){ badge.className = 'ms-2 badge rounded-pill bg-success'; badge.textContent = t('shifts.shiftOpen'); }
			else { badge.className = 'ms-2 badge rounded-pill bg-secondary'; badge.textContent = t('shifts.shiftClosed'); }
		}
		var quickBtn = document.getElementById('shiftQuickBtn');
		if (quickBtn){ quickBtn.classList.toggle('d-none', !shiftOpen); }
	}

	async function requireShift(){
		const t = await currentShift();
		shiftOpen = !!t;
		updateGuardUI();
		if (!t){
			viewA.classList.remove('d-none');
			viewC.classList.add('d-none');
			btnOpen.classList.remove('d-none');
			btnClose.classList.add('d-none');
			modal.show();
		}else{
			// Shift already open
		}
	}

	btnOpen.addEventListener('click', async ()=>{
		try{
			const base = Number(document.getElementById('initialBase').value||0);
			const obs = (document.getElementById('obsOpening').value||'').trim();
			const r = await fetch('/api/shifts/open', {
				method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
				body: JSON.stringify({ initial_base: base, opening_observation: obs })
			});
			const j = await r.json();
			if(!r.ok) throw new Error(j.message||'Error opening shift');
			showAlert('success',t('shifts.opened'));
			shiftOpen = true;
			updateGuardUI();
			setTimeout(()=>{ modal.hide(); }, 800);
		}catch(e){ showAlert('danger', e.message); }
	});

	// Live calculation of total and difference against system
	let expectedTotals = { total: 0 };
	['sumCash','sumCard','sumQR'].forEach(id=>{
		const el = ()=> document.getElementById(id);
		document.addEventListener('input', (e)=>{
			if (e.target && e.target.id === id){ recalcLive(); }
		});
	});
	async function fetchExpectedSummary(){
		try{
			const r = await fetch('/api/shifts/summary', { headers:{'Authorization':'Bearer '+token} });
			const j = await r.json();
			if (r.ok && j && j.data && j.data.totals){ expectedTotals = j.data.totals; }
			else { expectedTotals = { total: 0 }; }
			document.getElementById('sumExpected').textContent = fmt(expectedTotals.total||0);
			recalcLive();
		}catch(_){ expectedTotals = { total: 0 }; }
	}
	function recalcLive(){
		const ef = Number(document.getElementById('sumCash').value||0);
		const ta = Number(document.getElementById('sumCard').value||0);
		const qr = Number(document.getElementById('sumQR').value||0);
		const total = ef + ta + qr;
		document.getElementById('sumTotal').value = String(total.toFixed(2));
		const diff = Number((total - (expectedTotals.total||0)).toFixed(2));
		const diffEl = document.getElementById('sumDiffLive');
		diffEl.textContent = fmt(diff);
		diffEl.className = (Math.abs(diff) < 0.01) ? 'text-success' : 'text-danger';
	}

	btnClose.addEventListener('click', async ()=>{
		try{
			const payload = {
				total_cash: Number(document.getElementById('sumCash').value||0),
				total_card: Number(document.getElementById('sumCard').value||0),
				total_qr: Number(document.getElementById('sumQR').value||0),
				total_general: Number(document.getElementById('sumTotal').value||0),
				closing_observation: (document.getElementById('obsClosing').value||'').trim()
			};
			const r = await fetch('/api/shifts/close', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(payload) });
			const j = await r.json();
			if(!r.ok) throw new Error(j.message||'Error closing shift');
			const exp = j.data.expected;
			const usr = j.data.userTotals;
			const diff = Number(j.data.difference||0);
			if (Math.abs(diff) > 0.009){
				showAlert('warning',t('shifts.warningDiff')+': '+fmt(diff)+'.');
			} else {
				showAlert('success',t('shifts.closed'));
			}
			shiftOpen = false;
			updateGuardUI();
			setTimeout(()=>{
				printSummary({
					user: usr,
					expected: exp,
					diff: diff,
					obs: payload.closing_observation,
					base_initial: j.data.base,
					stats: j.data.stats,
					shift: j.data.shift
				});
				modal.hide();
			}, 600);
		}catch(e){ showAlert('danger', e.message); }
	});

	function printSummary(res){
		const html = [
			'<div style="font-family:Arial,sans-serif;font-size:12px">',
				'<h3 style="margin:0 0 8px">' + t('shifts.closureTitle') + '</h3>',
				// Company line
				('<div><strong>'+esc(localStorage.getItem('companyName')||'')+'</strong>'+(localStorage.getItem('companyTax')? ' - TAX ID: '+esc(localStorage.getItem('companyTax')):'')+'</div>'),
				(res.shift?('<div>Shift #'+(res.shift.id_shift||'')+' | User: '+esc(res.shift.user||localStorage.getItem('userName')||'')+'</div>'):''),
				(res.base_initial!=null?('<div>Initial base: <strong>'+fmt(res.base_initial)+'</strong></div>'):''),
				'<div>' + t('dashboard.printDate') + ': '+fmtDate(new Date())+'</div>',
				(res.stats?('<div>' + t('reports.totalTickets') + ': <strong>'+Number(res.stats.total||0)+'</strong></div>'):''),
				(res.stats?('<div>Cars: '+(res.stats.byType&&res.stats.byType.car||0)+' | Motorcycles: '+(res.stats.byType&&res.stats.byType.motorcycle||0)+' | Bicycles: '+(res.stats.byType&&res.stats.byType.bicycle||0)+'</div>'):''),
				'<hr/>',
				'<div style="display:flex;gap:16px">',
					'<div>',
						'<div style="font-weight:bold">' + t('reports.userCount') + '</div>',
						'<div>' + t('payment.cash') + ': '+fmt(res.user.cash)+'</div>',
						'<div>' + t('payment.card') + ': '+fmt(res.user.card)+'</div>',
						'<div>' + t('payment.qr') + ': '+fmt(res.user.qr)+'</div>',
						'<div><strong>' + t('common.total') + ': '+fmt(res.user.total)+'</strong></div>',
					'</div>',
					'<div>',
						'<div style="font-weight:bold">' + t('reports.system') + '</div>',
						'<div>' + t('payment.cash') + ': '+fmt(res.expected.cash)+'</div>',
						'<div>' + t('payment.card') + ': '+fmt(res.expected.card)+'</div>',
						'<div>' + t('payment.qr') + ': '+fmt(res.expected.qr)+'</div>',
						'<div><strong>' + t('common.total') + ': '+fmt(res.expected.total)+'</strong></div>',
					'</div>',
				'</div>',
				'<hr/>',
				'<div><strong>' + t('reports.difference') + ': '+fmt(res.diff)+'</strong></div>',
				(res.obs?('<div>Obs.: '+escapeHtml(res.obs)+'</div>'):'') ,
			'</div>'
		].join('');
		function printWidth(mm){
			const w = window.open('', '_blank', 'width=420,height=700');
			const css = `@page{ size: ${mm}mm auto; margin: 3mm } body{ width:${mm}mm; font-family: Arial, sans-serif; font-size:11px; margin:0 } .wrap{ padding:4mm } hr{ border:none; border-top:1px dashed #999; margin:6px 0 }`;
			w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Shift Closure</title><style>'+css+'</style></head><body><div class="wrap">'+html+'</div><script>window.print(); setTimeout(()=>window.close(), 300);<'+'/'+'script></body></html>');
			w.document.close();
		}
		// Size selector (58mm / 80mm) with Bootstrap modal
		ensureSizeModal();
		const m = new bootstrap.Modal(document.getElementById('shiftPrintSizeModal'));
		const b58 = document.getElementById('btnPrint58');
		const b80 = document.getElementById('btnPrint80');
		const on58 = ()=>{ printWidth(58); cleanup(); };
		const on80 = ()=>{ printWidth(80); cleanup(); };
		function cleanup(){ b58.removeEventListener('click', on58); b80.removeEventListener('click', on80); m.hide(); }
		b58.addEventListener('click', on58);
		b80.addEventListener('click', on80);
		m.show();
	}
	function esc(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }

	function ensureSizeModal(){
		if (document.getElementById('shiftPrintSizeModal')) return;
		const div = document.createElement('div');
		div.innerHTML = [
			'<div class="modal fade" id="shiftPrintSizeModal" tabindex="-1" aria-hidden="true">',
				'<div class="modal-dialog">',
					'<div class="modal-content">',
						'<div class="modal-header">',
							'<h5 class="modal-title">' + t('reports.selectPrintSize') + '</h5>',
							'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
						'</div>',
						'<div class="modal-body">',
							'<p class="mb-2">' + t('reports.printSizeHelp') + '</p>',
							'<div class="d-flex gap-2">',
								'<button type="button" id="btnPrint58" class="btn btn-primary">58 mm</button>',
								'<button type="button" id="btnPrint80" class="btn btn-outline-primary">80 mm</button>',
							'</div>',
						'</div>',
						'<div class="modal-footer">',
							'<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">' + t('common.cancel') + '</button>',
						'</div>',
					'</div>',
				'</div>',
			'</div>'
		].join('');
		document.body.appendChild(div.firstChild);
	}
	function fmt(n){ return fmtCurrency(n); }
	function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }

	// Gating: block critical actions if no shift
	window.requireOpenShift = requireShift;

	// Show modal if entering panel without shift
	setTimeout(requireShift, 200);
})();
