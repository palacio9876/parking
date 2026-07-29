(function(){
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

	if (window.__globalFooterInjected) { return; }
	window.__globalFooterInjected = true;

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
		var L = 0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b;
		return L > 160;
	}
	var rgb = parseRGB(getBgColor());
	var lightTheme = isLight(rgb);

	var linkClass = lightTheme ? 'link-secondary text-decoration-underline' : 'link-light text-decoration-underline';
	var outlineBtn = lightTheme ? 'btn-outline-secondary' : 'btn-outline-light';
	var solidBtn = lightTheme ? 'btn-secondary' : 'btn-light text-dark';
	var bgClass = lightTheme ? 'bg-white border-top text-muted' : 'bg-dark text-light border-0';

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
			if (!loginDay || loginDay !== t) return false;
			if (dismissedDay === t) return false;
			return true;
		}catch(_e){return true;}
	}

	function mount(){
		if (!shouldShow()) return;
		var footer = document.createElement('div');
		footer.className = 'global-footer gf-banner alert alert-dismissible fade show mb-0 rounded-0 ' + (lightTheme ? 'alert-light border-top' : 'alert-dark');
		footer.style.position = 'sticky';
		footer.style.top = '100vh';
		footer.style.width = '100%';
		var developerEmail = 'mailto:cristiancamilopala@gmail.com';
		var paypalUrl = 'https://www.paypal.com/donate/?hosted_button_id=QR7A3ZJYBK9EL';
		var githubUrl = 'https://github.com/palacio9876/parking';
		footer.innerHTML = [
			'<div class="container-fluid px-3 text-center">',
				'<div class="mx-auto" style="max-width: 980px">',
					'<p class="mb-2 small lh-base">',
						'Este software es completamente gratuito. Si necesitas consultoría, capacitación o deseas realizar cambios, contacta al desarrollador ',
						'<a class="'+linkClass+'" href="'+developerEmail+'" target="_blank" rel="noopener">Cristian C. Palacio N</a>. ',
						'Además, si te gustó y quieres apoyar, puedes hacer una donación a través de ',
						'<a class="'+linkClass+'" href="'+paypalUrl+'" target="_blank" rel="noopener">este enlace</a>. ',
						'Esto me ayudará a seguir creando software de calidad sin costo. ',
						'Y recuerda que el código de este sistema está completamente abierto en ',
						'<a class="'+linkClass+'" href="'+githubUrl+'" target="_blank" rel="noopener">GitHub</a>.',
					'</p>',
					'<div class="d-grid gap-2 d-sm-flex justify-content-center flex-wrap">',
						'<a class="btn btn-sm '+outlineBtn+'" href="'+developerEmail+'" target="_blank" rel="noopener" aria-label="Developer site">',
							'<i class="bi bi-globe2 me-1"></i> Soporte'
						,'</a>',
						'<a class="btn btn-sm '+solidBtn+'" href="'+paypalUrl+'" target="_blank" rel="noopener" aria-label="Donate on PayPal">',
							'<i class="bi bi-heart-fill me-1"></i> Donar'
						,'</a>',
						'<a class="btn btn-sm '+outlineBtn+'" href="'+githubUrl+'" target="_blank" rel="noopener" aria-label="Repository on GitHub">',
							'<i class="bi bi-github me-1"></i> Código'
						,'</a>',
					'</div>',
					'<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
				'</div>',
			'</div>'
		].join('');
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
