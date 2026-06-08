function showToast(title, message, type) {
  var bgMap = { success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#38bdf8' };
  var bg = bgMap[type] || '#374151';

  var div = document.createElement('div');
  div.className = 'flex items-start gap-2';
  div.innerHTML = '<div style="line-height:1.4"><strong>' + title + '</strong><br><small>' + message + '</small></div>';

  Toastify({
    node: div,
    duration: 3500,
    gravity: 'top',
    position: 'right',
    style: {
      background: bg,
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'inline-flex',
      alignItems: 'center',
    },
    stopOnFocus: true,
  }).showToast();
}
