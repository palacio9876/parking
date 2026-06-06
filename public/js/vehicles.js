document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Initialize DataTable
    const table = $('#vehiclesTable').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/en-US.json'
        },
        order: [[4, 'desc']], // Sort by registration date descending
        columns: [
            { 
                data: 'license_plate',
                render: function(data, type, row){
                    return `<button class="btn btn-link p-0" onclick="viewHistory(${row.id}, '${data}')">${data}</button>`;
                }
            },
            { data: 'type' },
            { data: 'color' },
            { data: 'model' },
            { 
                data: 'created_at',
                render: function(data) {
                    return new Date(data).toLocaleString('en-US');
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    return data === 'active' 
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-secondary">Inactive</span>';
                }
            },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-info me-1" onclick="editVehicle(${row.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${row.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }
            }
        ]
    });

    // Load initial data
    loadVehicles();

    // Event Listeners
    document.getElementById('btnSave').addEventListener('click', saveVehicle);
    document.getElementById('filterType').addEventListener('change', applyFilters);
    document.getElementById('filterPlate').addEventListener('input', applyFilters);
    document.getElementById('btnLogout').addEventListener('click', closeSession);
    document.getElementById('logoutDropdown').addEventListener('click', closeSession);

    // Show user name
    document.getElementById('userName').textContent = localStorage.getItem('userName') || 'User';
    // Hide admin menus for operators
    if (localStorage.getItem('userRole') !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    }

    // Toggle Sidebar
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
    });
});

// Function to load vehicles
async function loadVehicles() {
    try {
        const response = await fetch('/api/vehicles', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error loading vehicles');
        }

        const result = await response.json();
        const vehicles = (result.data || []).map(v => ({
            id: v.id_vehicle,
            license_plate: v.license_plate,
            type: v.type,
            color: v.color,
            model: v.model,
            created_at: v.registration_date,
            status: v.status || 'inactive'
        }));
        $('#vehiclesTable').DataTable().clear().rows.add(vehicles).draw();

    } catch (error) {
        showError('Error loading vehicles');
        console.error(error);
    }
}

// Function to save vehicle
async function saveVehicle() {
    const vehicleId = document.getElementById('vehicleId').value;
    const vehicle = {
        license_plate: document.getElementById('license_plate').value,
        type: document.getElementById('type').value,
        color: document.getElementById('color').value,
        model: document.getElementById('model').value
    };

    try {
        const url = vehicleId 
            ? `/api/vehicles/${vehicleId}`
            : '/api/vehicles';
        
        const response = await fetch(url, {
            method: vehicleId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(vehicle)
        });

        if (!response.ok) {
            throw new Error('Error saving vehicle');
        }

        // Close modal and reload data
        $('#vehicleModal').modal('hide');
        loadVehicles();
        showSuccess(vehicleId ? 'Vehicle updated' : 'Vehicle registered');

    } catch (error) {
        showError(error.message);
        console.error(error);
    }
}

// Function to edit vehicle
async function editVehicle(id) {
    try {
        const response = await fetch(`/api/vehicles/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error loading vehicle data');
        }

        const result = await response.json();
        const vehicle = result.data || result;
        
        // Fill form
        document.getElementById('vehicleId').value = vehicle.id_vehicle;
        document.getElementById('license_plate').value = vehicle.license_plate;
        document.getElementById('type').value = vehicle.type;
        document.getElementById('color').value = vehicle.color;
        document.getElementById('model').value = vehicle.model || '';

        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Vehicle';
        
        // Open modal
        $('#vehicleModal').modal('show');

    } catch (error) {
        showError(error.message);
        console.error(error);
    }
}

// Function to delete vehicle
async function deleteVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }

    try {
        const response = await fetch(`/api/vehicles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error deleting vehicle');
        }

        loadVehicles();
        showSuccess('Vehicle deleted');

    } catch (error) {
        showError(error.message);
        console.error(error);
    }
}

// Function to apply filters
function applyFilters() {
    const type = document.getElementById('filterType').value;
    const plate = document.getElementById('filterPlate').value.toLowerCase();

    $.fn.dataTable.ext.search.push(function(settings, data) {
        const typeMatch = !type || data[1] === type;
        const plateMatch = !plate || data[0].toLowerCase().includes(plate);
        return typeMatch && plateMatch;
    });

    $('#vehiclesTable').DataTable().draw();
    $.fn.dataTable.ext.search.pop();
}

// View history by vehicle
async function viewHistory(idVehicle, plate){
    try{
        const res = await fetch(`/api/vehicles/${idVehicle}/history`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const j = await res.json();
        if(!res.ok) throw new Error(j.message||'Error getting history');
        const tb = document.getElementById('historyBody');
        document.getElementById('histPlate').textContent = plate;
        if (!j.data || j.data.length === 0){
            tb.innerHTML = '<tr><td colspan="6" class="text-center">No records</td></tr>';
        } else {
            tb.innerHTML = j.data.map(r => {
                const fmt = v => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(v||0);
                const total = Number(r.total_to_pay || 0);
                const paid = Number(r.total_paid || 0);
                const diff = paid - total;
                const paymentStatus = total === 0 ? '-' : (diff >= 0 ? `Change: ${fmt(Math.abs(diff))}` : `Due: ${fmt(Math.abs(diff))}`);
                const badgeStatus = r.status==='active' ? 'success' : (diff>=0 && total>0 ? 'primary' : 'secondary');
                const paymentSummary = total>0
                    ? `${fmt(paid)} ${r.payments?`(${r.payments})`:''} <br><small class="text-${diff>=0?'success':'danger'}">${paymentStatus}</small>`
                    : (paid>0 ? `${fmt(paid)} ${r.payments?`(${r.payments})`:''}` : '-');
                return `
                <tr>
                    <td>${r.id_movement || r.id}</td>
                    <td>${new Date(r.entry_date).toLocaleString('en-US')}</td>
                    <td>${r.exit_date ? new Date(r.exit_date).toLocaleString('en-US') : '-'}</td>
                    <td><span class="badge bg-${badgeStatus}">${r.status}</span></td>
                    <td>${total ? fmt(total) : '-'}</td>
                    <td>${paymentSummary}</td>
                </tr>`;
            }).join('');
        }
        const modal = new bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }catch(err){
        alert('Error: ' + err.message);
    }
}

// Function to show success messages
function showSuccess(message) {
    alert(message);
}

// Function to show error messages
function showError(message) {
    alert('Error: ' + message);
}

// Function to close session
function closeSession() {
    localStorage.clear();
    window.location.href = '/';
}
