(function () {
  function locale() {
    return 'es-CO';
  }
  function currency() {
    return 'COP';
  }
  function fmtCurrency(amount) {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency: currency(), minimumFractionDigits: 0 }).format(Number(amount || 0));
  }
  function fmtDate(date) {
    return date ? new Date(date).toLocaleString(locale()) : '';
  }
  function t(key) {
    return key || '';
  }

  window.t = t;
  window.__ = t;
  window.locale = locale;
  window.currency = currency;
  window.fmtCurrency = fmtCurrency;
  window.fmtDate = fmtDate;
  window.i18n = {
    getLang: function() { return 'es'; },
    t: t,
    locale: locale,
    currency: currency,
    fmtCurrency: fmtCurrency,
    fmtDate: fmtDate,
    datatablesLangUrl: function() { return '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CO.json'; }
  };
})();
