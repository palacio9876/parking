// Reusable footer for all public/admin pages
// - Inserts a consistent Bootstrap footer at the end of <body>
// - Text requested by client with links to support, donation and open source
// - No external CSS dependencies; uses Bootstrap utilities. Compatible with Bootstrap 5.3+


(function(){
	// Ensure Bootstrap Icons available for footer buttons
	(function ensureBootstrapIcons(){
		try{
			if(!document.querySelector('link[href*="bootstrap-icons"]')){
				var link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
				document.head.appendChild(link);
			}
		}catch(_e){}
	})();

	// Inject responsive styles once
	(function injectStyles(){
		if (document.getElementById('gfStyles')) return;
		var s = document.createElement('style');
		s.id = 'gfStyles';
		s.textContent = [
			'.global-footer.gf-banner{ z-index:1029 }',
			'.global-footer.gf-banner p{ font-size: clamp(12px, 1.4vw, 14px); }',
			'.global-footer.gf-banner .btn{ white-space: nowrap; }',
			'@media (max-width: 576px){',
			'.global-footer.gf-banner .mx-auto{ max-width: 100% !important; }',
			'.global-footer.gf-banner .btn{ width:100%; }',
			'.global-footer.gf-banner p{ margin-bottom:.5rem; }',
			'}'
		].join('');
		document.head.appendChild(s);
	})();

	// Prevent multiple insertions if loaded twice
	if (window.__globalFooterInjected) { return; }
	window.__globalFooterInjected = true;

	// Detect background to adapt theme (light/dark)
	function getBgColor(){
		var el = document.querySelector('.main-content') || document.body;
		var c = window.getComputedStyle(el).backgroundColor;
		if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') {
			c = window.getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
		}
		return c;
	}
	function parseRGB(str){
		var m = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d\.]+))?\)/.exec(str||'');
		return m ? {r:+m[1], g:+m[2], b:+m[3], a: m[4]!==undefined? +m[4] : 1} : {r:255,g:255,b:255,a:1};
	}
	function isLight(rgb){
		var L = 0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b; // approximate luminance
		return L > 160; // empirical threshold
	}
	var rgb = parseRGB(getBgColor());
	var lightTheme = isLight(rgb);

	var linkClass = lightTheme ? 'link-secondary text-decoration-underline' : 'link-light text-decoration-underline';
	var outlineBtn = lightTheme ? 'btn-outline-secondary' : 'btn-outline-light';
	var solidBtn = lightTheme ? 'btn-secondary' : 'btn-light text-dark';
	var bgClass = lightTheme ? 'bg-white border-top text-muted' : 'bg-dark text-light border-0';

	// Component as dismissible banner (alert) that appears once per day after login
	// Day control: gfLoginDay (set on login) and gfDismissedDay (when closed)
	function todayKey(){
		var d = new Date();
		var yyyy = d.getFullYear();
		var mm = String(d.getMonth()+1).padStart(2,'0');
		var dd = String(d.getDate()).padStart(2,'0');
		return yyyy+'-'+mm+'-'+dd;
	}
	function shouldShow(){
		try{
			var loginDay = localStorage.getItem('gfLoginDay');
			var dismissedDay = localStorage.getItem('gfDismissedDay');
			var t = todayKey();
			if (!loginDay || loginDay !== t) return false; // Only on login day
			if (dismissedDay === t) return false; // Already closed today
			return true;
		}catch(_e){return true;}
	}

	var footer = document.createElement('div');
	footer.className = 'global-footer gf-banner alert alert-dismissible fade show mb-0 rounded-0 ' + (lightTheme ? 'alert-light border-top' : 'alert-dark');
	footer.style.position = 'sticky';
	footer.style.top = '100vh';
	footer.style.width = '100%';
	footer.innerHTML = [
		'<div class="container-fluid px-3 text-center">',
			'<div class="mx-auto" style="max-width: 980px">',
				'<p class="mb-2 small lh-base">',
					'This software is completely free. If you need consulting, training, or want to make changes, please contact the developer ',
					'<a class="'+linkClass+'" href="https://ciscodedev.netlify.app/" target="_blank" rel="noopener">Ciscode</a>. ',
					'Also, if you liked it and want to support, you can make a donation through ',
					'<a class="'+linkClass+'" href="https://www.paypal.com/donate/?hosted_button_id=8HMKJZY4E29RY" target="_blank" rel="noopener">this link</a>. ',
					'This will help me continue creating quality software at no cost. ',
					'And remember that the code of this system is completely open on ',
					'<a class="'+linkClass+'" href="https://github.com/Cristiancano1236/sistema-parqueadero" target="_blank" rel="noopener">GitHub</a>.',
				'</p>',
				'<div class="d-grid gap-2 d-sm-flex justify-content-center flex-wrap">',
					'<a class="btn btn-sm '+outlineBtn+'" href="https://ciscodedev.netlify.app/" target="_blank" rel="noopener" aria-label="Developer site">',
						'<i class="bi bi-globe2 me-1"></i> Support'
					,'</a>',
					'<a class="btn btn-sm '+solidBtn+'" href="https://www.paypal.com/donate/?hosted_button_id=8HMKJZY4E29RY" target="_blank" rel="noopener" aria-label="Donate on PayPal">',
						'<i class="bi bi-heart-fill me-1"></i> Donate'
					,'</a>',
					'<a class="btn btn-sm '+outlineBtn+'" href="https://github.com/Cristiancano1236/sistema-parqueadero" target="_blank" rel="noopener" aria-label="Repository on GitHub">',
						'<i class="bi bi-github me-1"></i> Code'
					,'</a>',
				'</div>',
				'<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
			'</div>',
		'</div>'
	].join('');

	if (!shouldShow()) { return; }

	// Ensure placement at end of body without breaking layouts
	function mount(){
		if (!shouldShow()) return;
		try{
			if (document.body) { document.body.appendChild(footer); }
			var closeBtn = footer.querySelector('.btn-close');
			if (closeBtn) {
				closeBtn.addEventListener('click', function(){
					try { localStorage.setItem('gfDismissedDay', todayKey()); } catch(_e){}
				});
			}
		}catch(_e){}
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else { mount(); }
})();


