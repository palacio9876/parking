# ParkSystem — Sistema de Gestión de Parqueaderos Multi-empresa

Aplicación Node.js + Express para administrar parqueaderos con soporte multi-empresa:
registro de vehículos, movimientos de ingreso/salida, tarifas flexibles, pagos,
turnos de caja, reportes y dashboard. Incluye interfaz web estática en `public/`.

---

## Características

- **Autenticación JWT** con control de intentos fallidos por IP/usuario.
- **Multi-empresa**: aislamiento total por `id_company` en todas las operaciones.
- **Vehículos**: CRUD con historial de movimientos y pagos.
- **Tarifas configurables**: por tipo de vehículo, modo de facturación (minuto/hora/día/mixto), redondeos y umbrales.
- **Movimientos**: ingreso y salida con cálculo automático del total a pagar.
- **Pagos**: soporte para efectivo, tarjeta y QR; pago único o múltiple por movimiento.
- **Turnos de caja**: apertura/cierre, totales por método de pago, diferencia, exportación a Excel.
- **Reportes**: KPIs, ingresos por día/método, movimientos paginados, top placas, turnos, exportación a Excel.
- **Dashboard**: estadísticas en tiempo real (ocupación, ingresos del día, movimientos activos).
- **Logo de empresa**: almacenado como BLOB en BD, sin depender del sistema de archivos.
- **SweetAlert2** con tema Bootstrap 4 en toda la interfaz.

---

## Tecnologías

| Capa        | Tecnología                                         |
|-------------|----------------------------------------------------|
| Backend     | Node.js, Express                                   |
| ORM         | Sequelize 6                                        |
| Base de datos | MariaDB / MySQL 10.4+                            |
| Autenticación | JWT (jsonwebtoken) + bcryptjs                    |
| Validación  | Zod                                                |
| Reportes    | ExcelJS                                            |
| Frontend    | HTML5, CSS3, JavaScript vanilla, Bootstrap 4, SweetAlert2 |

---

## Requisitos

- Node.js 18+
- MariaDB / MySQL 10.4+
- npm

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url> && cd parking

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (ver .env.example o usar el siguiente modelo)
cat > .env << EOF
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secreto_jwt_aqui
DB_HOST=localhost
DB_NAME=parking_system
DB_USER=root
DB_PASSWORD=
EOF

# 4. Crear la base de datos
mysql -u root -p -e "CREATE DATABASE parking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Ejecutar migraciones (crea tablas, índices, FKs y vistas)
npm run migrate

# 6. Sembrar datos iniciales (empresa, admin, tarifas base)
npm run seed
```

### Datos de acceso por defecto

| Campo    | Valor            |
|----------|------------------|
| tax_id   | `900123456-7`    |
| username | `admin`          |
| password | `admin123`       |

---

## Ejecución

```bash
npm run dev      # Desarrollo con nodemon (recarga automática)
npm start        # Producción
```

El servidor inicia en `http://localhost:3000`. Sirve la interfaz web desde `public/`
y expone la API REST en `/api/*`.

### Rutas de la interfaz web

| Ruta               | Vista              |
|--------------------|--------------------|
| `/`                | Login              |
| `/admin/dashboard` | Dashboard          |
| `/admin/vehicles`  | Gestión de vehículos |
| `/admin/users`     | Gestión de usuarios |
| `/admin/rates`     | Tarifas            |
| `/admin/reports`   | Reportes           |
| `/admin/settings`  | Configuración      |
| `/admin/entry-exit`| Ingreso/Salida     |
| `/operator/*`      | (alias a las mismas vistas) |

---

## Estructura del proyecto

```
src/
  server.js                     # Express: middlewares, rutas, archivos estáticos
  config/
    db.js                       # Conexión Sequelize a MySQL
    sequelize-config.js         # Config para sequelize-cli
  models/
    index.js                    # Asociaciones entre modelos
    Company.js, User.js, LoginAttempt.js, CompanySetting.js,
    Vehicle.js, Rate.js, Movement.js, Payment.js, Shift.js
  migrations/                   # Migraciones Sequelize (una por tabla + vistas)
    20260606010000-create-companies.js
    20260606020000-create-company-settings.js
    20260606030000-create-users.js
    20260606040000-create-login-attempts.js
    20260606050000-create-vehicles.js
    20260606060000-create-rates.js
    20260606070000-create-movements.js
    20260606080000-create-payments.js
    20260606090000-create-shifts.js
    20260606100000-create-views.js
  seeders/                      # Datos iniciales (empresa, admin, tarifas)
    20260606040000-sample-data.js
  controllers/                  # Lógica de controladores por recurso
  services/                     # Lógica de negocio por recurso
  repositories/                 # Acceso a datos (consultas Sequelize)
  dtos/                         # Esquemas de validación Zod
  routes/                       # Definición de rutas Express
    auth.js, companies.js, dashboard.js, movements.js,
    payments.js, rates.js, reports.js, shifts.js, users.js, vehicles.js
  middlewares/
    auth.js                     # Verificación JWT
    requireAdmin.js             # Restricción de rol admin
    errorHandler.js             # Manejo centralizado de errores
public/
  index.html                    # Login
  admin/
    dashboard.html, vehicles.html, users.html, rates.html,
    reports.html, settings.html, entry-exit.html
  js/                           # Lógica frontend
  css/                          # Estilos
 404.html                       # Página 404 personalizada
tests/
  test-api.sh                   # Suite de pruebas de API (51 tests)
schema.sql                      # Esquema SQL de referencia (no usar para instalación)
```

---

## API endpoints

Todas las rutas requieren el header `Authorization: Bearer <token>`, excepto
`POST /api/auth/login`.

### Auth
| Método | Ruta              | Descripción                    |
|--------|-------------------|--------------------------------|
| POST   | `/api/auth/login` | Iniciar sesión                 |
| GET    | `/api/auth/me`    | Datos del usuario autenticado  |

**Login body:**
```json
{ "tax_id": "900123456-7", "username": "admin", "password": "admin123" }
```

### Vehicles
| Método | Ruta                      | Descripción                         |
|--------|---------------------------|-------------------------------------|
| GET    | `/api/vehicles`           | Listar vehículos de la empresa      |
| GET    | `/api/vehicles/:id`       | Detalle de un vehículo              |
| POST   | `/api/vehicles`           | Crear vehículo                      |
| PUT    | `/api/vehicles/:id`       | Actualizar vehículo                 |
| DELETE | `/api/vehicles/:id`       | Eliminar vehículo (sin movimientos) |
| GET    | `/api/vehicles/:id/history` | Historial de movimientos + pagos  |

### Users (solo admin)
| Método | Ruta                | Descripción          |
|--------|---------------------|----------------------|
| GET    | `/api/users`        | Listar usuarios      |
| GET    | `/api/users/:id`    | Detalle de usuario   |
| POST   | `/api/users`        | Crear usuario        |
| PUT    | `/api/users/:id`    | Actualizar usuario   |
| DELETE | `/api/users/:id`    | Eliminar usuario     |

### Rates
| Método | Ruta                | Descripción                        |
|--------|---------------------|------------------------------------|
| GET    | `/api/rates/current`| Tarifas activas por tipo de vehículo |
| PUT    | `/api/rates`        | Crear/actualizar tarifa (admin)    |

### Movements
| Método | Ruta                     | Descripción                         |
|--------|--------------------------|-------------------------------------|
| POST   | `/api/movements/entry`   | Registrar ingreso de vehículo       |
| POST   | `/api/movements/exit`    | Registrar salida y calcular total   |
| GET    | `/api/movements/:id`     | Detalle del movimiento              |
| GET    | `/api/movements/:id/history` | Historial completo              |

### Payments
| Método | Ruta                    | Descripción                         |
|--------|-------------------------|-------------------------------------|
| POST   | `/api/payments/bulk`    | Registrar uno o varios pagos        |

### Companies (solo admin para escritura)
| Método | Ruta                     | Descripción                    |
|--------|--------------------------|--------------------------------|
| GET    | `/api/companies/me`      | Datos de la empresa            |
| GET    | `/api/companies/config`  | Configuración operativa        |
| PUT    | `/api/companies`         | Actualizar datos básicos       |
| PUT    | `/api/companies/config`  | Actualizar configuración       |
| GET    | `/api/companies/logo`    | Obtener logo (BLOB, image/png) |
| POST   | `/api/companies/logo`    | Subir logo (multipart, admin)  |

### Shifts
| Método | Ruta                   | Descripción           |
|--------|------------------------|-----------------------|
| GET    | `/api/shifts/current`  | Turno abierto actual  |
| GET    | `/api/shifts/summary`  | Totales del turno     |
| POST   | `/api/shifts/open`     | Abrir turno           |
| POST   | `/api/shifts/close`    | Cerrar turno          |

### Reports
| Método | Ruta                                      | Descripción                 |
|--------|-------------------------------------------|-----------------------------|
| GET    | `/api/reports/kpis`                       | KPIs del período            |
| GET    | `/api/reports/income-by-day`              | Ingresos por día            |
| GET    | `/api/reports/income-by-payment-method`   | Ingresos por método de pago |
| GET    | `/api/reports/movements`                  | Movimientos paginados       |
| GET    | `/api/reports/top-plates`                 | Top placas más frecuentes   |
| GET    | `/api/reports/shifts`                     | Cierres de turno            |
| GET    | `/api/reports/export/xlsx`                | Exportar reportes a Excel   |
| GET    | `/api/reports/shifts/export/xlsx`         | Exportar turnos a Excel     |

### Dashboard
| Método | Ruta                     | Descripción                 |
|--------|--------------------------|-----------------------------|
| GET    | `/api/dashboard/stats`   | Estadísticas del dashboard  |

### Parámetros comunes de reportes
| Parámetro | Tipo   | Descripción                         |
|-----------|--------|-------------------------------------|
| `from`    | string | Fecha inicio (YYYY-MM-DD)           |
| `to`      | string | Fecha fin (YYYY-MM-DD)              |
| `page`    | int    | Número de página (default 0)        |
| `pageSize`| int    | Tamaño de página (default 10)       |
| `limit`   | int    | Límite de registros                 |

---

## Scripts npm

| Script             | Comando                                    |
|--------------------|--------------------------------------------|
| `npm start`        | `node src/server.js`                       |
| `npm run dev`      | `nodemon src/server.js`                    |
| `npm run migrate`  | Ejecutar migraciones pendientes            |
| `npm run migrate:undo` | Revertir última migración               |
| `npm run migrate:undo:all` | Revertir todas las migraciones      |
| `npm run migrate:status` | Ver estado de migraciones            |
| `npm run seed`     | Ejecutar seeders                          |
| `npm run seed:undo`| Revertir seeders                          |

---

## Migraciones y seeders

El proyecto usa **Sequelize CLI** para gestionar el esquema de la base de datos.

**Flujo para crear una base de datos desde cero:**
```bash
mysql -u root -p -e "CREATE DATABASE parking_system CHARACTER SET utf8mb4"
npm run migrate
npm run seed
```

**Flujo para agregar un cambio futuro:**
```bash
npx sequelize-cli migration:generate --name add-column-to-table
# Editar el archivo generado en src/migrations/
npm run migrate
```

**Revertir cambios:**
```bash
npm run migrate:undo           # Reversa la última migración
npm run migrate:undo:all       # Reversa todas (vuelve a BD vacía)
```

---

## Pruebas

El proyecto incluye una suite de pruebas de API en `tests/test-api.sh` que
cubre los 51 escenarios principales (auth, CRUD, validaciones, errores 404/401,
reportes, dashboard).

```bash
bash tests/test-api.sh
```

Requiere el servidor corriendo en `localhost:3000` con la base de datos migrada y seedada.

---

## Licencia

ISC © Cristian Palacio
