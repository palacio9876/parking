# Manual del Operador — ParkSystem

Guía diaria para usar el sistema de parqueadero: ingresar vehículos,
cobrar, cerrar turno y consultar información.

---

## Índice

1. [Acceso al sistema](#acceso-al-sistema)
2. [Dashboard del operador](#dashboard-del-operador)
3. [Registrar entrada de vehículo](#registrar-entrada-de-vehículo)
4. [Registrar salida y cobro](#registrar-salida-y-cobro)
5. [Consultar vehículos](#consultar-vehículos)
6. [Turno de caja](#turno-de-caja)
7. [Solución de problemas comunes](#solución-de-problemas-comunes)

---

## Acceso al sistema

1. Abra su navegador web (Chrome, Firefox, Edge).
2. Ingrese la dirección que le proporcionó su administrador
   (ej. `http://localhost:3000`).
3. Verá la pantalla de **Inicio de Sesión**.

### Ingrese sus credenciales

| Campo       | Qué debe escribir                      |
|-------------|----------------------------------------|
| Tax ID / NIT | El número de identificación de la empresa (ej. `900123456-7`) |
| Usuario     | Su nombre de usuario (ej. `operador1`) |
| Contraseña  | Su contraseña                          |

4. Haga clic en **Ingresar**.

> Si olvidó su contraseña, solicite al administrador que la restablezca.

### Pantalla principal

Al ingresar verá el **Dashboard** con:

- **Vehículos activos**: cuántos vehículos hay dentro ahora.
- **Ingresos del día**: total recaudado en el día.
- **Ocupación**: porcentaje de capacidad usada.
- **Movimientos recientes**: tabla con los últimos ingresos/salidas.

---

## Dashboard del operador

El dashboard le muestra información útil para su turno:

### Tarjetas informativas

| Indicador              | Utilidad                                              |
|------------------------|-------------------------------------------------------|
| Vehículos activos      Sepa si el parqueadero está lleno |
| Ingresos del día       Lleve la cuenta de lo recaudado  |
| Capacidad disponible   Sepa cuántos carros/motos/bicicletas pueden entrar |
| Movimientos activos    Vea qué vehículos están dentro y hace cuánto |

### Tabla de movimientos activos

Muestra los vehículos que siguen dentro. Para cada uno:

- **Placa** y tipo de vehículo
- **Hora de entrada**
- **Tiempo transcurrido**
- **Operador que lo registró**

---

## Registrar entrada de vehículo

1. En el menú lateral, haga clic en **Ingreso/Salida**.
2. En la sección **Registrar Ingreso**, complete:

| Campo       | Descripción                                         |
|-------------|-----------------------------------------------------|
| Placa       | Placa del vehículo (ej. ABC123, sin guiones)        |
| Tipo        | Seleccione: Carro, Moto o Bicicleta                 |
| Color       | Color del vehículo (ej. Rojo, Azul, Negro)          |
| Modelo      | Marca o modelo (opcional)                           |

3. Haga clic en **Registrar Ingreso**.

> Si la placa no existe en el sistema, se crea automáticamente.
> Si ya existe, se asocia el movimiento al vehículo existente.

### Confirmación

El sistema mostrará un mensaje de confirmación con los datos del
ingreso: placa, tipo, hora y operador.

---

## Registrar salida y cobro

1. En la misma pantalla **Ingreso/Salida**, vaya a la sección
   **Registrar Salida**.
2. Escriba la **placa** del vehículo que sale.
3. El sistema buscará el movimiento activo y mostrará:

   - Placa y tipo de vehículo
   - Hora de entrada y tiempo transcurrido
   - **Total a pagar** calculado automáticamente

### Seleccionar método de pago

| Método    | Cuándo usarlo                                  |
|-----------|-------------------------------------------------|
| Efectivo  | El cliente paga en efectivo                     |
| Tarjeta   | El cliente paga con tarjeta débito/crédito      |
| QR        | El cliente paga por código QR o transferencia   |

4. Seleccione el método de pago.
5. Confirme la salida.

> Si el cliente paga en efectivo, asegúrese de dar el cambio correcto.
> Si paga con tarjeta o QR, procese el pago en su datáfono/app antes
> de confirmar.

### Pago múltiple (split payment)

Si el cliente paga con varios métodos (ej. mitad efectivo, mitad
tarjeta), haga clic en **Agregar pago** para registrar cada parte.

---

## Consultar vehículos

En el menú, haga clic en **Vehículos**.

### Buscar un vehículo

- Use la barra de búsqueda para filtrar por placa o tipo.
- La tabla muestra: placa, tipo, color, modelo, fecha de registro
  y estado (activo = dentro / inactivo = fuera).

### Ver historial

Haga clic en el botón **Historial** de cualquier vehículo para ver
todos sus movimientos anteriores: fechas de entrada/salida, totales
pagados y métodos de pago.

---

## Turno de caja

### ¿Qué es un turno?

El turno registra su jornada laboral. Al abrirlo declara cuánto
efectivo hay en caja al empezar. Al cerrarlo declara cuánto ingresó
en total por cada método. El sistema calcula si el dinero declarado
coincide con lo registrado.

### Abrir turno

1. En el menú, haga clic en **Configuración** (o en el botón
   **Abrir Turno** del dashboard si no hay turno activo).
2. Ingrese la **base inicial** (efectivo en caja al empezar, ej. `50000`).
3. Opcionalmente agregue una observación.
4. Haga clic en **Abrir Turno**.

### Resumen del turno

Mientras el turno está abierto, puede ver:

- Hora de apertura
- Base inicial
- Total de ingresos registrados en el sistema
- Totales por método de pago

### Cerrar turno

1. Haga clic en **Cerrar Turno**.
2. Ingrese los totales reales que tiene en caja:

| Campo             | Qué escribir                                      |
|-------------------|---------------------------------------------------|
| Total efectivo    | Suma del dinero en efectivo que tiene             |
| Total tarjeta     | Suma de ventas con tarjeta del día                |
| Total QR          | Suma de ventas por QR/transferencia               |
| Observación       | Nota sobre novedades del turno (opcional)         |

3. El sistema mostrará el **resumen** con:

   - **Total esperado**: lo que el sistema registró.
   - **Total declarado**: lo que usted ingresa.
   - **Diferencia**: sobrante o faltante.

4. Revise la diferencia. Si es correcta, confirme el cierre.

> Una diferencia pequeña puede deberse a redondeos o vueltas.
> Diferencias grandes debe reportarlas a su administrador.

---

## Solución de problemas comunes

**No puedo iniciar sesión**
- Verifique que el Tax ID, usuario y contraseña están bien escritos.
- Si sigue sin poder, el administrado pudo haber desactivado su usuario
  o la empresa está inactiva.

**El sistema dice "Vehículo no encontrado" al registrar salida**
- Verifique que la placa esté bien escrita.
- Si el vehículo entró antes de su turno, puede buscarlo en la lista
  de movimientos activos.

**El total a pagar no parece correcto**
- Consulte con el administrador la configuración de tarifas (modo,
  valores y umbrales). Cada tipo de vehículo puede tener tarifas
  diferentes.

**No puedo cerrar el turno**
- Asegúrese de que no haya movimientos activos que usted haya registrado
  sin completar la salida. Si es necesario, el administrador puede
  cerrarlos manualmente.

**Se ve un error 500 en la pantalla**
- Informe al administrador técnico. Mientras tanto, recargue la página
  e intente de nuevo.

---

*Documento v1.0 — ParkSystem*
