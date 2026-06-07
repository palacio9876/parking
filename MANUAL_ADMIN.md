# Manual del Administrador — ParkSystem

Guía técnica y operativa para configurar, administrar y mantener el
sistema ParkSystem.

---

## Índice

1. [Descripción general](#descripción-general)
2. [Instalación técnica](#instalación-técnica)
3. [Migraciones y seeders](#migraciones-y-seeders)
4. [Configuración de la empresa](#configuración-de-la-empresa)
5. [Gestión de usuarios](#gestión-de-usuarios)
6. [Tarifas](#tarifas)
7. [Turnos de caja](#turnos-de-caja)
8. [Logs y monitoreo](#logs-y-monitoreo)
9. [Backup y restore](#backup-y-restore)
10. [Solución de problemas](#solución-de-problemas)

---

## Descripción general

ParkSystem es una aplicación Node.js + Express con base de datos
MariaDB/MySQL. Utiliza Sequelize como ORM y Sequelize CLI para
migraciones y seeders.

### Stack tecnológico

| Componente    | Tecnología                        |
|---------------|-----------------------------------|
| Servidor      | Node.js 18+, Express              |
| Base de datos | MariaDB / MySQL 10.4+             |
| ORM           | Sequelize 6                       |
| Autenticación | JWT + bcryptjs                    |
| Validación    | Zod                               |
| Reportes      | ExcelJS                           |
| Frontend      | Bootstrap 4, SweetAlert2          |

### Estructura del proyecto

```
src/
  server.js                    # Punto de entrada: Express, rutas, archivos estáticos
  config/
    db.js                      # Conexión Sequelize (usa variables de entorno)
    sequelize-config.js        # Configuración para Sequelize CLI
  models/                      # Definición de modelos y asociaciones
  migrations/                  # Migraciones (una por tabla)
  seeders/                     # Datos iniciales (empresa, admin, tarifas)
  controllers/                 # Controladores Express
  services/                    # Lógica de negocio
  repositories/                # Acceso a datos (consultas Sequelize)
  dtos/                        # Esquemas de validación Zod
  routes/                      # Definición de rutas
  middlewares/                 # Autenticación, autorización, manejo de errores
public/                        # Interfaz web estática
tests/                         # Pruebas de API
```

---

## Instalación técnica

### Requisitos

- Node.js 18 o superior
- MariaDB / MySQL 10.4 o superior
- npm

### Paso a paso

```bash
# 1. Clonar el repositorio e instalar dependencias
git clone <repo-url> parking
cd parking
npm install

# 2. Crear archivo .env con las variables de entorno
cat > .env << EOF
PORT=3000
NODE_ENV=development
JWT_SECRET=<generar-un-secreto-seguro>
DB_HOST=localhost
DB_NAME=parking_system
DB_USER=root
DB_PASSWORD=
EOF

# El JWT_SECRET debe ser una cadena larga y aleatoria:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Crear la base de datos
mysql -u root -p -e "CREATE DATABASE parking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Ejecutar migraciones (crea tablas, índices, FKs, vistas)
npm run migrate

# 5. Sembrar datos iniciales
npm run seed
```

### Variables de entorno

| Variable        | Obligatorio | Default       | Descripción                                  |
|-----------------|-------------|---------------|----------------------------------------------|
| `PORT`          | No          | `3000`        | Puerto del servidor HTTP                     |
| `NODE_ENV`      | No          | `development` | `development` habilita logging SQL           |
| `JWT_SECRET`    | **Sí**      | —             | Secreto para firmar tokens JWT (64+ chars)   |
| `DB_HOST`       | No          | `localhost`   | Host de la base de datos                     |
| `DB_NAME`       | **Sí**      | —             | Nombre de la base de datos                   |
| `DB_USER`       | **Sí**      | —             | Usuario de base de datos                     |
| `DB_PASSWORD`   | **Sí**      | —             | Contraseña de base de datos                  |

### Ejecución

```bash
npm run dev     # Desarrollo con nodemon (recarga automática)
npm start       # Producción
```

El servidor inicia en `http://localhost:3000`.

---

## Migraciones y seeders

### ¿Qué son?

- **Migraciones**: archivos que describen cambios en el esquema de la BD
  (crear tablas, agregar columnas, índices, etc.). Se ejecutan en orden
  y quedan registrados en la tabla `SequelizeMeta`.
- **Seeders**: datos de prueba o iniciales (empresa, usuario admin, tarifas).

### Comandos

```bash
npm run migrate               # Ejecuta migraciones pendientes
npm run migrate:undo          # Revierte la última
npm run migrate:undo:all      # Revierte todas
npm run migrate:status        # Muestra estado (up/down) de cada una
npm run seed                  # Ejecuta seeders
npm run seed:undo             # Revierte seeders
```

### Crear una nueva migración

```bash
npx sequelize-cli migration:generate --name add-telefono-to-companies
```

Esto crea `src/migrations/<timestamp>-add-telefono-to-companies.js`.
Edite el archivo y ejecute `npm run migrate`.

### Ejemplo de migración

```js
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'phone', {
      type: Sequelize.STRING(20),
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'phone')
  },
}
```

> **Nota**: Siempre implemente `up` y `down`. El método `down` debe
> revertir exactamente lo que `up` hizo.

---

## Configuración de la empresa

### Datos básicos

Desde el menú **Configuración** puede editar:

| Campo          | Descripción                              |
|----------------|------------------------------------------|
| Nombre         | Nombre comercial del parqueadero         |
| Dirección      | Dirección física                         |
| Teléfono       | Teléfono de contacto                     |
| Email          | Correo electrónico                       |

### Logo

Puede subir una imagen PNG que se mostrará en la interfaz.
El logo se almacena como BLOB en la base de datos (no en disco).

### Configuración operativa

| Campo                         | Descripción                                      |
|-------------------------------|--------------------------------------------------|
| Capacidad carros              | Número máximo de carros que caben                |
| Capacidad motos               | Número máximo de motos que caben                 |
| Capacidad bicicletas          | Número máximo de bicicletas que caben            |
| Hora de apertura              | Hora a la que abre el parqueadero (HH:MM)        |
| Hora de cierre                | Hora a la que cierra (HH:MM)                     |
| Operación 24h                 | Marcar si opera las 24 horas                     |
| Porcentaje IVA                | IVA aplicado (ej. 19.00)                         |
| Moneda                        | Código de moneda (ej. COP, USD)                  |
| Zona horaria                  | Zona horaria (ej. America/Bogota)                |

> Los cambios en capacidad afectan el cálculo de ocupación en el dashboard.

---

## Gestión de usuarios

### Roles

| Rol       | Permisos                                                |
|-----------|---------------------------------------------------------|
| `admin`   | Acceso completo: configuración, usuarios, tarifas, reportes |
| `operator`| Ingreso/salida de vehículos, pagos, turnos, dashboard  |

### Crear un operador

1. Vaya a **Usuarios** en el menú.
2. Haga clic en **Nuevo Usuario**.
3. Complete:
   - **Nombre**: nombre real del operador.
   - **Usuario**: nombre de inicio de sesión (único por empresa).
   - **Contraseña**: mínimo 6 caracteres.
   - **Rol**: seleccione `operator`.
4. Guardar.

### Desactivar un usuario

En la lista de usuarios, desmarque la casilla **Activo**.
El usuario no podrá iniciar sesión pero sus registros históricos
se conservan.

---

## Tarifas

### Modos de facturación

| Modo    | Descripción                                          |
|---------|------------------------------------------------------|
| `minute`| Se cobra por minuto transcurrido                     |
| `hour`  | Se cobra por hora o fracción                         |
| `day`   | Se cobra por día completo                            |
| `mixed` | Mixto: usa minutos hasta un umbral, luego horas, luego días |

### Parámetros por tarifa

| Parámetro                 | Descripción                                       |
|---------------------------|---------------------------------------------------|
| Valor minuto              | Precio por minuto                                 |
| Valor hora                | Precio por hora                                   |
| Valor día completo        | Precio por día (24h)                              |
| Umbral minutos → horas    | Minutos a partir de los cuales cobra como hora    |
| Umbral horas → días       | Horas a partir de las cuales cobra como día       |
| Redondeo de horas         | `up`: siempre redondea arriba; `exact`: exacto    |
| Redondeo de días          | `up`: siempre redondea arriba; `exact`: exacto    |

### Ejemplo: configuración típica mixta

```
Modo: mixed
Valor minuto: $100
Valor hora:   $5,000
Valor día:    $50,000
Umbral min→h: 30 minutos  (menos de 30 min se cobra por minuto)
Umbral h→d:   5 horas     (menos de 5h se cobra por hora)
Redondeo hora: up          (1h01min → 2h)
Redondeo día:  up          (5h01min → 1 día)
```

### Configurar tarifas

1. Vaya a **Tarifas**.
2. Para cada tipo de vehículo (carro, moto, bici), ajuste los valores.
3. Guardar. La tarifa anterior se desactiva automáticamente.

---

## Turnos de caja

### Concepto

Un turno es el período de trabajo de un operador. Al abrir turno se
registra una base inicial de efectivo. Al cerrar, el operador declara
los totales por método de pago y el sistema calcula la diferencia
contra lo registrado en el sistema.

### Flujo

1. **Abrir turno**: el operador ingresa la base inicial (efectivo en caja).
2. **Operar**: registrar ingresos, salidas y pagos normalmente.
3. **Cerrar turno**: el operador ingresa los totales reales de efectivo,
   tarjeta y QR. El sistema muestra:
   - Total general registrado en el sistema.
   - Diferencia: (declarado - esperado).
4. Si la diferencia es aceptable, se cierra el turno.

### Consultar turnos

Desde **Reportes → Turnos** puede ver todos los cierres, incluyendo
operador, fechas, totales y diferencias. Exportable a Excel.

---

## Logs y monitoreo

El sistema usa **Winston** para logging. Los mensajes se muestran en
la consola donde corre el servidor.

| Nivel    | Cuándo se usa                                  |
|----------|-------------------------------------------------|
| `error`  | Excepciones no capturadas, errores de BD        |
| `warn`   | Intentos de login fallidos, advertencias        |
| `info`   | Inicio del servidor, conexión a BD              |
| `debug`  | (solo en development) Queries SQL               |

Para ver más detalle, ejecute con `NODE_ENV=development` para ver las
consultas SQL en consola.

---

## Backup y restore

### Backup de la base de datos

```bash
# Backup completo (estructura + datos)
mysqldump -u root -p parking_system > backup_$(date +%Y%m%d).sql

# Backup solo estructura (sin datos)
mysqldump -u root -p --no-data parking_system > schema_backup.sql
```

### Restore

```bash
# Opción 1: restaurar desde backup completo
mysql -u root -p parking_system < backup_20260101.sql

# Opción 2: desde cero con migraciones
mysql -u root -p -e "DROP DATABASE IF EXISTS parking_system; CREATE DATABASE parking_system ..."
npm run migrate
npm run seed
```

> **Recomendación**: programe backups diarios con cron:
> ```
> 0 3 * * * mysqldump -u root -pMYPASSWORD parking_system > /backups/db_$(date +\%Y\%m\%d).sql
> ```

### Restore con migraciones (reconstrucción completa)

```bash
# 1. Crear BD vacía
mysql -u root -p -e "CREATE DATABASE parking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Ejecutar migraciones
npm run migrate

# 3. Sembrar datos iniciales (si aplica)
npm run seed

# 4. Si tiene backup de datos, restaurarlo
mysql -u root -p parking_system < backup_datos.sql
```

---

## Solución de problemas

### Error: Puerto 3000 en uso

```bash
# Linux/macOS
fuser -k 3000/tcp

# O encontrar el proceso
lsof -i :3000
kill -9 <PID>
```

### Error: "Company not found or inactive"

1. Verifique que las credenciales en `.env` son correctas.
2. Verifique que ejecutó `npm run seed` (la empresa seed usa tax_id `900123456-7`).
3. Verifique en BD que la empresa está activa: `SELECT active FROM companies WHERE tax_id = '900123456-7';`

### Error: "ECONNREFUSED" al conectar a BD

1. Verifique que MariaDB/MySQL está corriendo: `systemctl status mariadb`.
2. Verifique credenciales en `.env`.
3. Verifique que el usuario tiene acceso desde `localhost`.

### Error: Tabla no existe

```bash
# Verificar estado de migraciones
npm run migrate:status

# Si alguna está "down", ejecutar migraciones
npm run migrate
```

### Error: "id_payment" unknown column

Esto ocurría cuando el modelo apuntaba a una columna `id_pago`. Con la
estandarización, la columna ahora es `id_payment`. Si viene de una
versión anterior, ejecute:

```sql
ALTER TABLE payments CHANGE id_pago id_payment INT AUTO_INCREMENT;
```

### Error: SweetAlert2 no se ve

Verifique la conexión a Internet (CDN). Si el servidor no tiene acceso
a Internet, descargue los archivos y sírvalos localmente:

```
node_modules/sweetalert2/dist/sweetalert2.all.min.js
node_modules/@sweetalert2/theme-bootstrap-4/bootstrap-4.css
```

---

*Documento v1.0 — ParkSystem*
