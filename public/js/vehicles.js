let vehiclesTable;

function initDataTable() {
  if (vehiclesTable) {
    vehiclesTable.destroy();
    vehiclesTable = null;
  }
  var langUrl = i18n.datatablesLangUrl();
  var opts = {
    order: [[4, 'desc']],
    columns: [
      { data: 'license_plate',
        render: function(data, type, row) {
          return '<button class="btn btn-link p-0" onclick="viewHistory(' + row.id + ", '" + data + "')" + '">' + data + '</button>';
        }
      },
      { data: 'type' },
      { data: 'color' },
      { data: 'model' },
      { data: 'created_at',
        render: function(data) {
          return fmtDate(data);
        }
      },
      { data: 'status',
        render: function(data) {
          return data === 'active'
            ? '<span class="badge bg-success">' + t('vehicles.active') + '</span>'
            : '<span class="badge bg-secondary">' + t('vehicles.inactive') + '</span>';
        }
      },
      { data: null,
        render: function(data, type, row) {
          return '<button class="btn btn-sm btn-info me-1" onclick="editVehicle(' + row.id + ')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteVehicle(' + row.id + ')"><i class="fas fa-trash"></i></button>';
        }
      }
    ]
  };
  if (langUrl) {
    opts.language = { url: langUrl };
  }
  vehiclesTable = $('#vehiclesTable').DataTable(opts);
}

document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  initDataTable();
  loadVehicles();

  document.getElementById('btnSave').addEventListener('click', saveVehicle);
  document.getElementById('filterType').addEventListener('change', applyFilters);
  document.getElementById('filterPlate').addEventListener('input', applyFilters);
  document.getElementById('btnLogout').addEventListener('click', closeSession);
  document.getElementById('logoutDropdown').addEventListener('click', closeSession);

  document.getElementById('userName').textContent = localStorage.getItem('userName') || 'User';
  if (localStorage.getItem('userRole') !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(function(el) { el.classList.add('d-none'); });
  }

  document.querySelector('.sidebar-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('show');
  });
});

async function loadVehicles() {
  try {
    const response = await fetch('/api/vehicles', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (!response.ok) {
      throw new Error(t('vehicles.loadError'));
    }
    const result = await response.json();
    const vehicles = (result.data || []).map(function(v) {
      return {
        id: v.id_vehicle,
        license_plate: v.license_plate,
        type: v.type,
        color: v.color,
        model: v.model,
        created_at: v.registration_date,
        status: v.status || 'inactive'
      };
    });
    vehiclesTable.clear().rows.add(vehicles).draw();
  } catch (error) {
    showError(t('vehicles.loadError'));
    console.error(error);
  }
}

async function saveVehicle() {
  const vehicleId = document.getElementById('vehicleId').value;
  const vehicle = {
    license_plate: document.getElementById('license_plate').value,
    type: document.getElementById('type').value,
    color: document.getElementById('color').value,
    model: document.getElementById('model').value
  };
  try {
    const url = vehicleId ? '/api/vehicles/' + vehicleId : '/api/vehicles';
    const response = await fetch(url, {
      method: vehicleId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(vehicle)
    });
    if (!response.ok) {
      throw new Error(t('vehicles.saveError'));
    }
    $('#vehicleModal').modal('hide');
    loadVehicles();
    showSuccess(vehicleId ? t('vehicles.updated') : t('vehicles.created'));
  } catch (error) {
    showError(error.message);
    console.error(error);
  }
}

async function editVehicle(id) {
  try {
    const response = await fetch('/api/vehicles/' + id, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (!response.ok) {
      throw new Error(t('vehicles.loadDataError'));
    }
    const result = await response.json();
    const vehicle = result.data || result;
    document.getElementById('vehicleId').value = vehicle.id_vehicle;
    document.getElementById('license_plate').value = vehicle.license_plate;
    document.getElementById('type').value = vehicle.type;
    document.getElementById('color').value = vehicle.color;
    document.getElementById('model').value = vehicle.model || '';
    document.getElementById('modalTitle').textContent = t('vehicles.edit');
    $('#vehicleModal').modal('show');
  } catch (error) {
    showError(error.message);
    console.error(error);
  }
}

async function deleteVehicle(id) {
  if (!confirm(t('vehicles.confirmDelete'))) return;
  try {
    const response = await fetch('/api/vehicles/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (!response.ok) {
      throw new Error(t('vehicles.deleteError'));
    }
    loadVehicles();
    showSuccess(t('vehicles.deleted'));
  } catch (error) {
    showError(error.message);
    console.error(error);
  }
}

function applyFilters() {
  const type = document.getElementById('filterType').value;
  const plate = document.getElementById('filterPlate').value.toLowerCase();
  $.fn.dataTable.ext.search.push(function(settings, data) {
    const typeMatch = !type || data[1] === type;
    const plateMatch = !plate || data[0].toLowerCase().includes(plate);
    return typeMatch && plateMatch;
  });
  vehiclesTable.draw();
  $.fn.dataTable.ext.search.pop();
}

async function viewHistory(idVehicle, plate) {
  try {
    const res = await fetch('/api/vehicles/' + idVehicle + '/history', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message || t('vehicles.historyError'));
    const tb = document.getElementById('historyBody');
    document.getElementById('histPlate').textContent = plate;
    if (!j.data || j.data.length === 0) {
      tb.innerHTML = '<tr><td colspan="6" class="text-center">' + t('common.noRecords') + '</td></tr>';
    } else {
      tb.innerHTML = j.data.map(function(r) {
        const total = Number(r.total_to_pay || 0);
        const paid = Number(r.total_paid || 0);
        const diff = paid - total;
        const badgeStatus = r.status === 'active' ? 'success' : (diff >= 0 && total > 0 ? 'primary' : 'secondary');
        var paymentSummary;
        if (total > 0) {
          paymentSummary = fmtCurrency(paid) + (r.payments ? ' (' + r.payments + ')' : '') + ' <br><small class="text-' + (diff >= 0 ? 'success' : 'danger') + '">' + (diff >= 0 ? t('vehicles.change') + ': ' + fmtCurrency(Math.abs(diff)) : t('vehicles.due') + ': ' + fmtCurrency(Math.abs(diff))) + '</small>';
        } else {
          paymentSummary = paid > 0 ? fmtCurrency(paid) + (r.payments ? ' (' + r.payments + ')' : '') : '-';
        }
        return '<tr><td>' + (r.id_movement || r.id) + '</td><td>' + fmtDate(r.entry_date) + '</td><td>' + (r.exit_date ? fmtDate(r.exit_date) : '-') + '</td><td><span class="badge bg-' + badgeStatus + '">' + r.status + '</span></td><td>' + (total ? fmtCurrency(total) : '-') + '</td><td>' + paymentSummary + '</td></tr>';
      }).join('');
    }
    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    modal.show();
  } catch (err) {
    alert(t('common.error') + ': ' + err.message);
  }
}

function showSuccess(message) {
  alert(message);
}

function showError(message) {
  alert(t('common.error') + ': ' + message);
}

function closeSession() {
  localStorage.clear();
  window.location.href = '/';
}
