const vehicleTypeLabels = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' };
const statusLabelsV = { active: 'Activo', completed: 'Finalizado', inactive: 'Inactivo', activo: 'Activo', completado: 'Finalizado', inactivo: 'Inactivo' };

let vehiclesTable;

function initDataTable() {
  if (vehiclesTable) {
    vehiclesTable.destroy();
    vehiclesTable = null;
  }
  var lang = 'es';
  var opts = {
    pageLength: 10,
    dom: 'lrtip',
    lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'Total']],
    order: [[4, 'desc']],
    language: lang === 'es' ? {
      lengthMenu: "Mostrar _MENU_ registros",
      zeroRecords: "No se encontraron registros",
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "Mostrando 0 a 0 de 0 registros",
      infoFiltered: "(filtrado de _MAX_ registros totales)",
      search: "Buscar:",
      paginate: { first: "Primero", previous: "Anterior", next: "Siguiente", last: "Último" }
    } : {},
    columns: [
      { data: 'license_plate',
        render: function(data) {
          return '<span class="font-medium">' + (data || '-') + '</span>';
        }
      },
      { data: 'type',
        render: function(data) {
          return vehicleTypeLabels[data] || data;
        }
      },
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
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-red-400">Inactivo</span>';
        }
      },
      { data: null,
        render: function(data, type, row) {
          const plate = String(row.license_plate || '').replace(/'/g, "\\'");
          const onclick = "viewHistory(" + row.id + ", '" + plate + "')";
          return '<button class="btn btn-sm btn-warning" title="Ver historial" type="button" onclick="' + onclick + '"><i class="fas fa-eye"></i></button>' +
            '<button class="btn btn-sm btn-edit" title="Editar" type="button" onclick="editVehicle(' + row.id + ')"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-delete" title="Eliminar" type="button" onclick="deleteVehicle(' + row.id + ')"><i class="fas fa-trash"></i></button>';
        }
      }
    ]
  };
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
      throw new Error('Error cargando vehículos');
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
    showError('Error cargando vehículos');
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
      throw new Error('Error guardando vehículo');
    }
    $('#vehicleModal').modal('hide');
    loadVehicles();
    showSuccess(vehicleId ? 'Vehículo actualizado' : 'Vehículo registrado');
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
      throw new Error('Error cargando datos del vehículo');
    }
    const result = await response.json();
    const vehicle = result.data || result;
    document.getElementById('vehicleId').value = vehicle.id_vehicle;
    document.getElementById('license_plate').value = vehicle.license_plate;
    document.getElementById('type').value = vehicle.type;
    document.getElementById('color').value = vehicle.color;
    document.getElementById('model').value = vehicle.model || '';
    document.getElementById('modalTitle').textContent = 'Editar Vehículo';
    $('#vehicleModal').modal('show');
  } catch (error) {
    showError(error.message);
    console.error(error);
  }
}

async function deleteVehicle(id) {
  if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;
  try {
    const response = await fetch('/api/vehicles/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (!response.ok) {
      throw new Error('Error eliminando vehículo');
    }
    loadVehicles();
    showSuccess('Vehículo eliminado');
  } catch (error) {
    showError(error.message);
    console.error(error);
  }
}

function applyFilters() {
  const type = document.getElementById('filterType').value;
  const plate = document.getElementById('filterPlate').value.toLowerCase();
  const typeLabel = type ? (vehicleTypeLabels[type] || type) : '';
  $.fn.dataTable.ext.search.push(function(settings, data) {
    const typeMatch = !type || data[1] === typeLabel;
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
    if (!res.ok) throw new Error(j.message || 'Error obteniendo historial');
    const histEl = document.getElementById('histPlate');
    const tb = document.getElementById('historyBody');
    if (!histEl || !tb) { showToast('Error', 'Error', 'error'); return; }
    histEl.textContent = plate;
    if (!j.data || j.data.length === 0) {
      tb.innerHTML = '<tr><td colspan="6" class="text-center">Sin registros</td></tr>';
    } else {
      tb.innerHTML = j.data.map(function(r) {
        const total = Number(r.total_to_pay || 0);
        const paid = Number(r.total_paid || 0);
        const paymentCount = Number(r.payments || 0);
        const normalizedStatus = String(r.status || '').toLowerCase();
        const isCompleted = normalizedStatus === 'completado' || normalizedStatus === 'completed';
        const isActive = normalizedStatus === 'activo' || normalizedStatus === 'active';
        const balance = total - paid;
        const isFullyPaid = total > 0 ? balance <= 0 : paid > 0;
        const badgeStatus = isCompleted ? 'success' : (isActive ? 'warning' : 'secondary');
        const statusLabel = statusLabelsV[normalizedStatus] || statusLabelsV[r.status] || r.status;
        var paymentSummary;
        if (total > 0) {
          paymentSummary = fmtCurrency(paid) + (paymentCount > 0 ? ' (' + paymentCount + ')' : '') + ' <br><small class="text-' + (isFullyPaid ? 'success' : 'danger') + '">' + (isFullyPaid ? 'Pagado' : 'Debe: ' + fmtCurrency(Math.abs(balance))) + '</small>';
        } else {
          paymentSummary = paid > 0 ? fmtCurrency(paid) + (paymentCount > 0 ? ' (' + paymentCount + ')' : '') : '-';
        }
        return '<tr><td>' + (r.id_movement || r.id) + '</td><td>' + fmtDate(r.entry_date) + '</td><td>' + (r.exit_date ? fmtDate(r.exit_date) : '-') + '</td><td><span class="badge bg-' + badgeStatus + '">' + statusLabel + '</span></td><td>' + (total ? fmtCurrency(total) : '-') + '</td><td>' + paymentSummary + '</td></tr>';
      }).join('');
    }
    const modalEl = document.getElementById('historyModal');
    if (modalEl) { const modal = new bootstrap.Modal(modalEl); modal.show(); }
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
}

function showSuccess(message) {
  showToast('Éxito', message, 'success');
}

function showError(message) {
  showToast('Error', message, 'error');
}

function clearVFilters() {
  document.getElementById('filterType').value = '';
  document.getElementById('filterPlate').value = '';
  applyFilters();
}

function closeSession() {
  localStorage.clear();
  window.location.href = '/';
}
