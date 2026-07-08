(function () {
  var LANG_KEY = 'parking_lang';
  var DEFAULT_LANG = 'es';
  var translations = {};
  var currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  var isReady = false;
  var callbacks = [];

  function loadLanguage(lang, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/lang/' + lang + '.json?_=' + Date.now(), true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          translations = JSON.parse(xhr.responseText);
          currentLang = lang;
          localStorage.setItem(LANG_KEY, lang);
          isReady = true;
          applyTranslations();
          updateSwitcher();
          callbacks.forEach(function (fn) { fn(); });
          if (callback) callback();
        } catch (e) {
          console.error('i18n: Error parsing translations', e);
        }
      } else {
        console.error('i18n: Error loading language file', lang, xhr.status);
        if (lang !== DEFAULT_LANG) {
          loadLanguage(DEFAULT_LANG, callback);
        }
      }
    };
    xhr.onerror = function () {
      console.error('i18n: Network error loading', lang);
      if (lang !== DEFAULT_LANG) {
        loadLanguage(DEFAULT_LANG, callback);
      }
    };
    xhr.send();
  }

  function t(key) {
    var value = translations[key];
    if (value === undefined) {
      return key;
    }
    if (arguments.length > 1) {
      var args = Array.prototype.slice.call(arguments, 1);
      args.forEach(function (arg, i) {
        value = value.replace(new RegExp('\\{' + i + '\\}', 'g'), arg);
      });
    }
    return value;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      var value = t(key);
      if (attr) {
        el.setAttribute(attr, value);
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        if (attr === 'placeholder' || attr === 'title') {
          el.setAttribute(attr || 'placeholder', value);
        } else {
          el.setAttribute('placeholder', value);
        }
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang, callback) {
    localStorage.setItem(LANG_KEY, lang);
    location.reload();
  }

  function updateSwitcher() {
    var select = document.getElementById('langSwitcher');
    if (select) {
      select.value = currentLang;
    }
  }

  function onReady(fn) {
    if (isReady) {
      fn();
    } else {
      callbacks.push(fn);
    }
  }

  function injectSwitcher() {
    if (document.getElementById('langSwitcher')) return;

    // Check for .lang-switcher container in HTML
    var container = document.querySelector('.lang-switcher');
    if (container) {
      var sel = document.createElement('select');
      sel.id = 'langSwitcher';
      sel.className = 'text-sm bg-transparent border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer outline-none focus:border-primary text-gray-700 hover:border-gray-300 transition-colors';
      addOptions(sel);
      sel.value = currentLang;
      sel.addEventListener('change', function () { setLang(this.value); });
      container.appendChild(sel);
      return;
    }

    var nav = document.querySelector('.navbar-nav.ms-auto');
    if (!nav) {
      var wrapper = document.createElement('div');
      wrapper.className = 'lang-switcher-wrapper';
      wrapper.style.cssText = 'position:fixed;top:8px;right:12px;z-index:9999;display:flex;align-items:center;gap:6px;';
      var select = document.createElement('select');
      select.id = 'langSwitcher';
      select.className = 'form-select form-select-sm';
      select.style.cssText = 'width:auto;min-width:110px;padding:2px 28px 2px 8px;font-size:13px;border-radius:6px;border:1px solid #dee2e6;background:#fff;cursor:pointer;transition:border-color 0.15s ease;';
      addOptions(select);
      select.value = currentLang;
      select.addEventListener('change', function () { setLang(this.value); });
      wrapper.appendChild(select);
      document.body.appendChild(wrapper);
      return;
    }
    var li = document.createElement('li');
    li.className = 'nav-item d-flex align-items-center';
    var sel = document.createElement('select');
    sel.id = 'langSwitcher';
    sel.className = 'form-select form-select-sm border-0 bg-transparent fw-medium';
    sel.style.cssText = 'width:auto;cursor:pointer;color:inherit;font-size:14px;outline:none;';
    addOptions(sel);
    sel.value = currentLang;
    sel.addEventListener('change', function () { setLang(this.value); });
    li.appendChild(sel);
    nav.insertBefore(li, nav.firstChild);
  }

  function addOptions(sel) {
    var optEs = document.createElement('option');
    optEs.value = 'es';
    optEs.textContent = 'ES';
    sel.appendChild(optEs);
    var optEn = document.createElement('option');
    optEn.value = 'en';
    optEn.textContent = 'EN';
    sel.appendChild(optEn);
  }

  function locale() {
    return currentLang === 'en' ? 'en-US' : 'es-CO';
  }

  function currency() {
    return currentLang === 'en' ? 'USD' : 'COP';
  }

  function fmtCurrency(amount) {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency: currency(), minimumFractionDigits: 0 }).format(Number(amount || 0));
  }

  function fmtDate(date) {
    return date ? new Date(date).toLocaleString(locale()) : '';
  }

  function datatablesLangUrl() {
    if (currentLang === 'en') return '';
    return '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CO.json';
  }

  function init() {
    injectSwitcher();
    loadLanguage(currentLang);
  }

  window.t = t;
  window.__ = t;
  window.locale = locale;
  window.currency = currency;
  window.fmtCurrency = fmtCurrency;
  window.fmtDate = fmtDate;
  window.i18n = {
    getLang: getLang,
    setLang: setLang,
    t: t,
    onReady: onReady,
    datatablesLangUrl: datatablesLangUrl,
    locale: locale,
    currency: currency,
    fmtCurrency: fmtCurrency,
    fmtDate: fmtDate
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
