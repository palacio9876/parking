# ParkSystem — Guía Completa del Sistema de Parqueadero

## 1. Arquitectura General

```
App Node.js + Express (puerto 3000)
  ├── API REST (10 módulos)
  ├── Frontend estático (HTML + JS vanilla)
  └── MySQL/MariaDB (Sequelize ORM)
```

- **Auth**: JWT + bcryptjs
- **Validación**: Zod
- **i18n**: Español/Inglés
- **Logs**: Winston
- **Reportes**: ExcelJS (XLSX)

---

## 2. Puesta en Marcha

### Requisitos
- Node.js 18+, MySQL/MariaDB 10.4+

### Instalación rápida
```bash
git clone <repo>
npm install
# Crear .env con:
#   JWT_SECRET=<clave_segura>
#   DB_NAME=parking_system
#   DB_USER=...
#   DB_PASSWORD=...
npm run migrate    # Crea tablas
npm run seed       # Datos de ejemplo
npm start          # Servidor en :3000
```

### Datos por defecto (seed)
| Campo | Valor |
|---|---|
| Empresa | Central Parking (NIT 900123456-7) |
| Admin | usuario: `admin`, clave: `admin123` |
| Tarifas iniciales | Carro $6000/h, Moto $3000/h, Bici $1500/h |

---

## 3. Estructura del Backend (`src/`)

```
src/
├── server.js              # Punto de entrada (Express)
├── config/                # db.js, sequelize-config.js
├── models/                # 9 modelos Sequelize
├── migrations/            # 10 migraciones + vistas
├── seeders/               # Datos de ejemplo
├── middlewares/            # auth, errorHandler, i18n, validate
├── utils/                 # AppError, i18n, logger, sanitize
├── dtos/                  # 9 esquemas Zod de validación
├── repositories/          # 10 repositorios (acceso a BD)
├── services/              # 10 servicios (lógica de negocio)
├── controllers/           # 10 controladores (HTTP handlers)
└── routes/                # 10 archivos de rutas Express
```

### Flujo de una petición típica
```
HTTP Request
  → Middleware auth (valida JWT)
  → Middleware validate (valida body con Zod)
  → Controller (recibe req/res)
  → Service (lógica de negocio + excepciones)
  → Repository (SQL vía Sequelize)
  → DB → Response JSON
```

---

## 4. API REST — Endpoints

### 4.1 Autenticación (`/api/auth`)
| Método | Ruta | ¿Auth? | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | No | Login (tax_id + username + password) → devuelve JWT |
| GET | `/api/auth/me` | Sí | Info del usuario logueado |

### 4.2 Dashboard (`/api/dashboard`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Vehículos activos, ingreso hoy, actividad reciente (paginado) |

### 4.3 Vehículos (`/api/vehicles`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/vehicles` | Listar todos los vehículos |
| POST | `/api/vehicles` | Crear vehículo (plate, type, color, model) |
| GET | `/api/vehicles/:id` | Obtener por ID |
| PUT | `/api/vehicles/:id` | Actualizar |
| DELETE | `/api/vehicles/:id` | Eliminar (solo sin movimientos) |
| GET | `/api/vehicles/:id/history` | Historial de movimientos |

### 4.4 Movimientos / Entrada-Salida (`/api/movements`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/movements/entry` | Registrar entrada (license_plate, type) |
| POST | `/api/movements/exit` | Registrar salida (license_plate) |
| GET | `/api/movements/:id` | Detalle del movimiento |
| GET | `/api/movements/:id/history` | Historial extendido |

### 4.5 Pagos (`/api/payments`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/payments/bulk` | Registrar pagos (soportan split: varios métodos en un solo movimiento) |

### 4.6 Tarifas (`/api/rates`)
| Método | Ruta | ¿Admin? | Descripción |
|--------|------|---------|-------------|
| GET | `/api/rates/current` | No | Tarifas activas actuales |
| PUT | `/api/rates` | Sí | Crear o actualizar tarifa |

### 4.7 Turnos de Caja (`/api/shifts`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/shifts/current` | Turno activo actual |
| GET | `/api/shifts/summary` | Totales esperados (para cerrar) |
| POST | `/api/shifts/open` | Abrir turno (initial_base) |
| POST | `/api/shifts/close` | Cerrar turno (declarar totals) |

### 4.8 Usuarios (`/api/users`) — Solo admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar usuarios de la empresa |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Actualizar / cambiar contraseña |
| DELETE | `/api/users/:id` | Desactivar (borrado lógico) |

### 4.9 Reportes (`/api/reports`) — Autenticado
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/kpis` | KPIs (ingreso, tickets, ticket promedio, ocupación) |
| GET | `/api/reports/income-by-day` | Ingreso diario (filtro por método de pago) |
| GET | `/api/reports/income-by-payment-method` | Ingreso por método de pago |
| GET | `/api/reports/movements` | Lista paginada de movimientos (filtros) |
| GET | `/api/reports/top-plates` | Top 10 placas |
| GET | `/api/reports/shifts` | Cierres de turno |
| GET | `/api/reports/export/xlsx` | Exportar movimientos a Excel |
| GET | `/api/reports/shifts/export/xlsx` | Exportar turnos a Excel |

### 4.10 Empresa (`/api/companies`)
| Método | Ruta | ¿Admin? | Descripción |
|--------|------|---------|-------------|
| GET | `/api/companies/me` | No | Datos de la empresa |
| GET | `/api/companies/config` | No | Configuración (horarios, capacidad, IVA) |
| GET | `/api/companies/logo` | No | Logo (blob → imagen) |
| POST | `/api/companies/logo` | Sí | Subir logo (multipart) |
| PUT | `/api/companies` | Sí | Actualizar datos |
| PUT | `/api/companies/config` | Sí | Actualizar configuración |

---

## 5. Frontend — Páginas

| Página | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| Login | `/` | — | Autenticación con NIT + usuario + contraseña |
| Dashboard | `/admin/dashboard` | Admin/Op | KPIs, vehículos activos, actividad reciente |
| Vehículos | `/admin/vehicles` | Admin/Op | CRUD de vehículos + historial por placa |
| Entry/Exit | `/admin/entry-exit` | Admin/Op | Registrar entrada/salida + cobro |
| Tarifas | `/admin/rates` | Admin | Configurar tarifas por tipo de vehículo |
| Usuarios | `/admin/users` | Admin | CRUD de operadores y admins |
| Reportes | `/admin/reports` | Admin | KPIs, gráficos, tabla de movimientos, exportación |
| Config. | `/admin/settings` | Admin | Datos empresa, logo, capacidad, horarios |

### Sidebar
- **Admin** ve: Dashboard, Vehículos, Entry/Exit, Config, Tarifas, Usuarios, Reportes
- **Operador** ve solo: Dashboard, Vehículos, Entry/Exit

---

## 6. Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **admin** | CRUD usuarios, tarifas, configuración empresa, reportes, operaciones de parqueadero |
| **operator** | Dashboard, vehículos, entrada/salida, turnos |

---

## 7. Flujos de Negocio Principales

### 7.1 Entrada de Vehículo
1. Usuario ingresa placa + tipo (carro/moto/bici) → POST `/api/movements/entry`
2. El sistema busca o usa el vehículo existente
3. Verifica que no tenga un movimiento activo
4. Asigna la tarifa vigente para ese tipo
5. Crea el movimiento con estado `active`
6. Imprime recibo de entrada (térmico 58mm o 80mm)

### 7.2 Salida y Pago
1. Usuario ingresa placa → POST `/api/movements/exit`
2. Sistema calcula el total según la tarifa asignada al entrar:
   - Modo `mixed`: primeros N minutos a tarifa por minuto, luego horas, luego día completo
   - Modo `minute`/`hour`/`day`: tarifa fija según tiempo transcurrido
3. Se abre modal de pago (soporta split: ej. $5000 cash + $3000 card)
4. POST `/api/payments/bulk` con los pagos
5. Imprime factura de salida

### 7.3 Turnos de Caja
1. **Abrir turno**: el operador declara base inicial en caja
2. Mientras está abierto: se pueden registrar entradas/salidas
3. **Cerrar turno**: operador declara cuanto tiene en cash/card/QR
4. Sistema compara lo declarado vs lo esperado (según movimientos)
5. Muestra diferencia (si hay descuadre, alerta)
6. Imprime resumen de cierre

### 7.4 Tarifas — Modos de Facturación

| Modo | Descripción |
|------|-------------|
| `minute` | Todo el tiempo se cobra por minuto |
| `hour` | Todo el tiempo se cobra por hora (redondeo up/exact) |
| `day` | Todo el tiempo se cobra por día completo |
| `mixed` | Híbrido: primeros N minutos por minuto, luego hasta N horas por hora, luego día |

**Redondeo**: `up` (siempre hacia arriba, ej. 1h10min = 2h) o `exact` (exacto, ej. 1h10min = 1.166h).

---

## 8. Modelo de Datos (9 tablas)

```
companies (1) ──→ company_settings (1)
    │
    ├── users (N)         [admin/operator]
    ├── login_attempts (N)
    ├── vehicles (N)
    ├── rates (N)          [car/motorcycle/bicycle]
    ├── movements (N)      [active/completed]
    ├── payments (N)       [cash/card/QR]
    └── shifts (N)         [open/closed]
```

---

## 9. Configuración Clave

### Variables de entorno (`.env`)
| Variable | Obligatorio | Defecto |
|----------|-------------|---------|
| `PORT` | No | 3000 |
| `JWT_SECRET` | **Sí** | — |
| `DB_NAME` | **Sí** | — |
| `DB_USER` | **Sí** | — |
| `DB_PASSWORD` | **Sí** | — |
| `DB_HOST` | No | localhost |
| `NODE_ENV` | No | development |

### Comandos útiles
```bash
npm run migrate              # Ejecutar migraciones
npm run seed                 # Cargar datos de ejemplo
npm run migrate:undo         # Revertir última migración
npm run migrate:undo:all     # Revertir todas
npm run dev                  # Servidor con nodemon
```

---

## 10. Despliegue

### Docker
```bash
docker-compose up -d
# web:3000 + db:3306 (mariadb 10.4)
# schema.sql se ejecuta automáticamente al iniciar la BD
```

### Nativo
```bash
npm start
# Requiere MySQL corriendo en localhost:3306
```

---

## 11. Resumen de Librerías

| Librería | Uso |
|----------|-----|
| express | Servidor web |
| sequelize / mysql2 | ORM y driver MySQL |
| jsonwebtoken / bcryptjs | Autenticación JWT y hashing |
| zod | Validación de esquemas |
| winston | Logs |
| exceljs | Exportación a Excel |
| multer | Subida de archivos (logo) |
| tailwindcss | Estilos CSS |
| chart.js | Gráficos en reportes |
| datatables | Tablas con búsqueda/paginación |
| toastify-js | Notificaciones toast |
| sweetalert2 | Modales y alertas |
| jspdf | Exportación PDF |
