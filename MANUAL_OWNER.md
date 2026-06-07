# Manual del Propietario — ParkSystem

Guía de negocio para entender y supervisar su parqueadero a través del sistema.

---

## Índice

1. [¿Qué es ParkSystem?](#qué-es-parksystem)
2. [Primeros pasos](#primeros-pasos)
3. [Dashboard: indicadores clave](#dashboard-indicadores-clave)
4. [Reportes](#reportes)
5. [Exportación de datos](#exportación-de-datos)
6. [Preguntas frecuentes](#preguntas-frecuentes)

---

## ¿Qué es ParkSystem?

ParkSystem es una plataforma de gestión de parqueaderos multi-empresa.
Permite administrar uno o varios parqueaderos desde un mismo servidor,
con usuarios, tarifas, movimientos, pagos y turnos de caja totalmente
aislados por empresa.

### Capacidades del sistema

- **Multi-empresa**: un solo servidor puede atender varios parqueaderos independientes.
- **Control de acceso**: cada operador tiene usuario y contraseña; todo movimiento queda auditado.
- **Tarifas flexibles**: puede configurar tarifas por minuto, hora, día o mixto, con umbrales y redondeos.
- **Múltiples métodos de pago**: efectivo, tarjeta, QR.
- **Turnos de caja**: control diario de ingresos por operador, con detalle por método de pago y diferencia.
- **Reportes y dashboard**: indicadores en tiempo real e históricos exportables a Excel.
- **Logo personalizado**: puede subir el logo de su empresa para que aparezca en la interfaz.

---

## Primeros pasos

### Acceder al sistema

1. Abra su navegador y vaya a la dirección del servidor (ej. `http://localhost:3000`).
2. Use las credenciales proporcionadas por el administrador:

| Campo     | Valor por defecto |
|-----------|-------------------|
| tax_id    | `900123456-7`     |
| Usuario   | `admin`           |
| Contraseña | `admin123`       |

### ¿Qué veo al iniciar sesión?

El **Dashboard** muestra un resumen ejecutivo en tiempo real:

- **Vehículos activos**: cuántos están dentro del parqueadero ahora.
- **Ingresos del día**: total recaudado hoy.
- **Ocupación por tipo**: porcentaje de capacidad usada (carros, motos, bicis).
- **Movimientos recientes**: últimos ingresos y salidas.

---

## Dashboard: indicadores clave

El dashboard se actualiza cada vez que ingresa y está dividido en:

### Tarjetas superiores (KPIs)

| Indicador             | Qué significa                                           |
|-----------------------|---------------------------------------------------------|
| Ocupación actual      | Vehículos dentro vs capacidad total, con porcentaje     |
| Ingresos del día      | Suma de todos los pagos del día en curso                |
| Vehículos por tipo    | Conteo de activos separado por carro/moto/bici          |
| Total movimientos     | Cantidad de ingresos registrados (activos + completados) |

### Tabla de movimientos activos

Lista los vehículos que están actualmente dentro, mostrando:

- Placa y tipo
- Hora de ingreso
- Tiempo transcurrido
- Operador que registró la entrada

---

## Reportes

Acceda desde el menú **Reportes**. Todos los reportes requieren un
rango de fechas (desde / hasta).

### KPIs del período

Muestra para el rango seleccionado:

- **Total ingresos**: suma recaudada.
- **Total tickets**: cantidad de pagos realizados.
- **Ocupación máxima**: pico de ocupación en el período.
- **Vehículo más frecuente**: placa con más visitas (top placa).

### Ingresos por día

Gráfica y tabla con el total recaudado día a día. Puede filtrar por
método de pago para ver, por ejemplo, cuánto se recaudó en efectivo
vs tarjeta vs QR cada día.

### Ingresos por método de pago

Distribución porcentual y en valor absoluto de:

| Método    | Descripción                            |
|-----------|----------------------------------------|
| Efectivo  | Pago en efectivo al operador           |
| Tarjeta   | Pago con tarjeta débito/crédito        |
| QR        | Pago por código QR (transferencia)     |

### Movimientos (ingresos y salidas)

Tabla paginada con todos los movimientos del período. Puede filtrar por:

- **Estado**: activos (dentro) o completados (ya salieron).
- **Tipo de vehículo**: carro, moto o bici.
- **Placa**: búsqueda parcial.

### Top placas

Las 10 placas que más veces han visitado el parqueadero en el período,
junto con el total que han pagado. Ideal para identificar clientes
frecuentes.

### Turnos

Listado de cierres de turno con:

- Operador que abrió/cerró
- Base inicial, totales por método, diferencia
- Observaciones de apertura y cierre

---

## Exportación de datos

Desde la pantalla de Reportes puede exportar:

- **Reporte general** (botón "Exportar Excel"): descarga un archivo `.xlsx`
  con todos los movimientos del período filtrado.
- **Turnos** (botón "Exportar Turnos"): descarga los cierres de turno
  del período en `.xlsx`.

Los archivos se abren en Excel, LibreOffice Calc o Google Sheets.

---

## Preguntas frecuentes

**¿Puedo tener más de un administrador?**
Sí. Desde la pantalla Usuarios puede crear todos los usuarios que
necesite.

**¿Cómo cambio las tarifas?**
Vaya a Tarifas en el menú, seleccione el tipo de vehículo y ajuste
los valores. Las tarifas nuevas aplican desde el momento de la
actualización.

**¿Qué pasa si un operador cierra mal el turno?**
Puede consultar los turnos cerrados en Reportes para hacer
conciliación. La diferencia calculada le mostrará si hubo
sobrante o faltante.

**¿Los datos se respaldan automáticamente?**
El sistema no incluye backup automático. Consulte con el
administrador técnico la política de respaldos de la base de datos.

**¿Cómo recupero la contraseña de admin?**
El administrador técnico puede generar un nuevo hash ejecutando
un script en el servidor y actualizando la base de datos.

---

*Documento v1.0 — ParkSystem*
