# Matriz de pruebas del proyecto Parking

## Propósito
Esta matriz sirve como guía para ejecutar pruebas completas del sistema desde la instalación inicial hasta los flujos críticos de negocio, con el objetivo de detectar fallas antes de entregar o operar la aplicación.

## Leyenda
- [ ] Pendiente
- [x] Realizado
- [!] Observación

---

## 1. Preparación del entorno

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 1.1 | Entorno | Verificar Node.js (`node -v`) | v18+ | [ ] | |
| 1.2 | Entorno | Verificar npm (`npm -v`) | v9+ | [ ] | |
| 1.3 | Entorno | Verificar MySQL/MariaDB (`mysql --version`) | 10.4+ | [ ] | |
| 1.4 | Entorno | Verificar `jq` instalado (`jq --version`) | Instalado (requerido para test-api.sh) | [ ] | |
| 1.5 | Puertos | Verificar puerto 3000 libre (`lsof -i :3000`) | Sin procesos | [ ] | |
| 1.6 | Puertos | Verificar puerto 3306 libre (`lsof -i :3306`) | Sin procesos | [ ] | |
| 1.7 | Variables | Verificar archivo `.env` existe con variables correctas | PORT, JWT_SECRET, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME definidos | [ ] | |
| 1.8 | Dependencias | Ejecutar `npm install` | Instalación sin errores | [ ] | |

---

## 2. Base de datos y migraciones

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 2.1 | Conexión | Verificar acceso a MySQL (`mysql -u cristian -p`) | Conexión exitosa | [ ] | |
| 2.2 | BD | Verificar que la BD `parking_system` existe | BD existe | [ ] | |
| 2.3 | Migraciones | Ejecutar `npm run migrate` | 10 migraciones ejecutadas OK | [ ] | |
| 2.4 | Migraciones | Verificar estado (`npm run migrate:status`) | Todas en "Up" | [ ] | |
| 2.5 | Tablas | Verificar tablas creadas (9 tablas) | companies, company_settings, users, login_attempts, vehicles, rates, movements, payments, shifts | [ ] | |
| 2.6 | Vistas | Verificar vistas SQL | v_active_movements, v_daily_income | [ ] | |
| 2.7 | Seeders | Ejecutar `npm run seed` | Datos iniciales insertados | [ ] | |
| 2.8 | Integridad | Verificar empresa sembrada | 1 empresa (ParkSystem Demo) con NIT válido | [ ] | |
| 2.9 | Integridad | Verificar usuario admin sembrado | Usuario `admin` con role='admin' existe | [ ] | |
| 2.10 | Integridad | Verificar tarifas iniciales | 3 tarifas (carro, moto, bicicleta) | [ ] | |
| 2.11 | Relaciones | Verificar claves foráneas | Relaciones correctas entre tablas | [ ] | |
| 2.12 | Migraciones | Revertir última (`npm run migrate:undo`) | OK | [ ] | |
| 2.13 | Migraciones | Re-ejecutar (`npm run migrate`) | Vuelve a estar "Up" | [ ] | |
| 2.14 | Migraciones | Revertir todas (`npm run migrate:undo:all`) | Todas en "Down" | [ ] | |
| 2.15 | Migraciones | Ejecutar todas de nuevo (`npm run migrate`) | OK, todas "Up" | [ ] | |
| 2.16 | Seeders | Revertir seeders (`npm run seed:undo`) | OK | [ ] | |
| 2.17 | Seeders | Re-ejecutar seeders (`npm run seed`) | OK | [ ] | |

---

## 3. Servidor backend

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 3.1 | Inicio | Ejecutar `npm run dev` | Mensaje "Servidor corriendo en puerto 3000" | [ ] | |
| 3.2 | Inicio | Ejecutar `npm start` | Servidor inicia sin errores (producción) | [ ] | |
| 3.3 | Respuesta | Verificar `curl http://localhost:3000/` | Login HTML (HTTP 200) | [ ] | |
| 3.4 | Rutas | Verificar ruta inexistente `curl http://localhost:3000/noexiste` | HTTP 404 | [ ] | |
| 3.5 | Estáticos | Verificar archivos estáticos `/admin/dashboard` | HTML carga correctamente | [ ] | |
| 3.6 | CORS | Verificar CORS habilitado (OPTIONS request) | Headers CORS presentes | [ ] | |
| 3.7 | Logs | Revisar logs del servidor | Sin errores inesperados | [ ] | |
| 3.8 | Detener | Detener servidor (`Ctrl+C`) | Termina limpiamente | [ ] | |

---

## 4. Autenticación y acceso

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 4.1 | Login | Login con credenciales válidas (admin/admin123) | Token JWT obtenido, login exitoso | [ ] | |
| 4.2 | Login | Login con credenciales inválidas | Error de autenticación | [ ] | |
| 4.3 | Login | Login con campos vacíos | HTTP 400 | [ ] | |
| 4.4 | Token | Obtener datos del usuario (`GET /api/auth/me`) | Datos del usuario autenticado | [ ] | |
| 4.5 | Token | Token inválido en header Authorization | HTTP 401 | [ ] | |
| 4.6 | Token | Sin token en request protegido | HTTP 401 | [ ] | |
| 4.7 | Token | Token expirado | HTTP 401, manejo correcto | [ ] | |
| 4.8 | Roles | Login como admin | Acceso completo al panel admin | [ ] | |
| 4.9 | Roles | Login como operador | Acceso limitado según permisos | [ ] | |
| 4.10 | Roles | Operador accede a endpoint admin (`GET /api/users`) | HTTP 403 o 401 | [ ] | |
| 4.11 | Sesión | Refrescar página | Sesión se mantiene si el token es válido | [ ] | |
| 4.12 | Logout | Cerrar sesión | Token eliminado y redirección correcta | [ ] | |
| 4.13 | Rate limit | 6 logins fallidos consecutivos desde misma IP | Bloqueo temporal 15 min | [ ] | |
| 4.14 | Seguridad | Password almacenado en BD | Empieza con `$2a$` (bcrypt hash) | [ ] | |

---

## 5. Configuración de empresa

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 5.1 | Datos | Cambiar nombre de empresa | Se guarda y se visualiza | [ ] | |
| 5.2 | Datos | Cambiar NIT | Se guarda correctamente | [ ] | |
| 5.3 | Datos | Cambiar dirección | Se guarda correctamente | [ ] | |
| 5.4 | Datos | Cambiar teléfono | Se guarda correctamente | [ ] | |
| 5.5 | Datos | Cambiar correo | Se guarda correctamente | [ ] | |
| 5.6 | Config | Cambiar capacidad de carros | Se persiste | [ ] | |
| 5.7 | Config | Cambiar capacidad de motos | Se persiste | [ ] | |
| 5.8 | Config | Cambiar capacidad de bicicletas | Se persiste | [ ] | |
| 5.9 | Config | Cambiar horarios de apertura/cierre (formato HH:MM) | Se persiste | [ ] | |
| 5.10 | Config | Activar modo 24 horas | Se aplica correctamente, oculta campos de horario | [ ] | |
| 5.11 | Config | Cambiar porcentaje de IVA | Se persiste | [ ] | |
| 5.12 | Config | Cambiar moneda | Se persiste | [ ] | |
| 5.13 | Config | Cambiar zona horaria | Se persiste | [ ] | |
| 5.14 | Logo | Subir logo válido (< 2MB) | Se visualiza correctamente en sidebar | [ ] | |
| 5.15 | Logo | Subir logo inválido (> 2MB) | Muestra error de validación | [ ] | |
| 5.16 | Logo | Subir archivo que no es imagen | Se rechaza | [ ] | |

---

## 6. Gestión de usuarios

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 6.1 | Crear | Crear usuario admin | Se guarda correctamente | [ ] | |
| 6.2 | Crear | Crear usuario operador | Se guarda correctamente | [ ] | |
| 6.3 | Listar | Listar usuarios | Tabla muestra admin y operators | [ ] | |
| 6.4 | Editar | Cambiar nombre de usuario | Se actualiza | [ ] | |
| 6.5 | Editar | Cambiar rol | Se actualiza | [ ] | |
| 6.6 | Editar | Activar/desactivar usuario | Borrado lógico, cambio reflejado | [ ] | |
| 6.7 | Contraseña | Cambiar contraseña | Hash bcrypt aplicado, cambio guardado | [ ] | |
| 6.8 | Validación | Crear usuario con datos incompletos | HTTP 400, se rechaza con mensaje | [ ] | |
| 6.9 | Validación | Crear usuario con username duplicado en misma empresa | Se rechaza | [ ] | |
| 6.10 | Seguridad | Intentar desactivar el propio usuario admin | Se rechaza | [ ] | |
| 6.11 | API | Sin token en `GET /api/users` | HTTP 401 | [ ] | |

---

## 7. Gestión de tarifas

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 7.1 | Crear | Crear tarifa para carro (modo mixto) | Se guarda correctamente | [ ] | |
| 7.2 | Crear | Crear tarifa para moto | Se guarda correctamente | [ ] | |
| 7.3 | Crear | Crear tarifa para bicicleta | Se guarda correctamente | [ ] | |
| 7.4 | Consultar | Obtener tarifas activas (`GET /rates/current`) | 3 tarifas por tipo | [ ] | |
| 7.5 | Editar | Modificar valores de tarifa | Se actualiza, se desactiva tarifa anterior | [ ] | |
| 7.6 | Modo | Cambiar modo de cobro (minuto/hora/día/mixto) | UI muestra campos correctos según modo | [ ] | |
| 7.7 | Modo | Configurar umbrales (min→hr, hr→día) | Se persisten | [ ] | |
| 7.8 | Modo | Configurar redondeo (arriba/exacto) | Se persiste | [ ] | |
| 7.9 | Validación | Guardar tarifa con tipo inválido | HTTP 400, se rechaza | [ ] | |
| 7.10 | Validación | Tarifa con precio 0 | Se rechaza | [ ] | |

---

## 8. Gestión de vehículos

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 8.1 | Crear | Registrar vehículo nuevo (carro/moto/bicicleta) | Se almacena con ID | [ ] | |
| 8.2 | Listar | Listar vehículos de la empresa | Tabla con datos | [ ] | |
| 8.3 | Detalle | Obtener vehículo por ID | Datos correctos | [ ] | |
| 8.4 | Editar | Cambiar tipo/color/placa | Se actualiza | [ ] | |
| 8.5 | Filtrar | Filtrar por tipo de vehículo | Filtrado correcto | [ ] | |
| 8.6 | Filtrar | Filtrar por placa | Filtrado correcto | [ ] | |
| 8.7 | Historial | Revisar historial de movimientos por vehículo | Se muestra correctamente | [ ] | |
| 8.8 | Eliminar | Eliminar vehículo sin movimientos | Confirmación y eliminación exitosa (HTTP 204) | [ ] | |
| 8.9 | Eliminar | Eliminar vehículo con movimientos | Se rechaza, mensaje de protección | [ ] | |
| 8.10 | Validación | Crear vehículo con body vacío | HTTP 400 | [ ] | |
| 8.11 | Validación | Placa duplicada en misma empresa | Se rechaza | [ ] | |
| 8.12 | Validación | Obtener vehículo inexistente | HTTP 404 | [ ] | |
| 8.13 | Validación | Eliminar vehículo inexistente | HTTP 404 | [ ] | |

---

## 9. Ingreso y salida de vehículos

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 9.1 | Ingreso | Registrar entrada de un vehículo (placa + tipo) | Se crea movimiento activo, recibo generado | [ ] | |
| 9.2 | Ingreso | Ingreso rápido desde frontend | Vehículo registrado, recibo listo para imprimir | [ ] | |
| 9.3 | Ingreso | Intentar registrar entrada duplicada (mismo vehículo ya dentro) | Se muestra error "ya se encuentra", no duplica | [ ] | |
| 9.4 | Ingreso | Ingreso con body vacío | HTTP 400 | [ ] | |
| 9.5 | Detalle | Obtener detalle del movimiento por ID | Datos correctos (vehículo, fechas, tarifa) | [ ] | |
| 9.6 | Historial | Obtener historial de movimientos del vehículo | Lista de movimientos anteriores | [ ] | |
| 9.7 | Salida | Registrar salida | Se completa movimiento, estado "completado" | [ ] | |
| 9.8 | Cálculo | Calcular total a pagar (salida) | Valor correcto según tarifa y tiempo | [ ] | |
| 9.9 | Cálculo | Calcular salida sin registrar (`/calculate-exit`) | Preview del total sin modificar estado | [ ] | |
| 9.10 | Pago | Registrar pago en efectivo | Se almacena correctamente | [ ] | |
| 9.11 | Pago | Registrar pago con tarjeta | Se almacena correctamente | [ ] | |
| 9.12 | Pago | Registrar pago con QR | Se almacena correctamente | [ ] | |
| 9.13 | Pago | Split payment (múltiples métodos en un solo cobro) | Pagos registrados correctamente, suma coincide | [ ] | |
| 9.14 | Pago | Pago incompleto (monto menor al total) | Se rechaza con advertencia | [ ] | |
| 9.15 | Validación | Salida sin entrada activa | Se rechaza | [ ] | |
| 9.16 | Impresión | Imprimir recibo de entrada formato 58mm | Formato correcto | [ ] | |
| 9.17 | Impresión | Imprimir recibo de entrada formato 80mm | Formato correcto | [ ] | |
| 9.18 | Impresión | Imprimir factura de salida formato 58mm | Formato correcto con QR opcional | [ ] | |
| 9.19 | Impresión | Imprimir factura de salida formato 80mm | Formato correcto con QR opcional | [ ] | |

---

## 10. Turnos de caja

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 10.1 | Apertura | Abrir turno con base inicial | Se registra correctamente, estado "abierto" | [ ] | |
| 10.2 | Consulta | Obtener turno abierto actual | Datos del turno activo | [ ] | |
| 10.3 | Resumen | Obtener resumen del turno (totales en vivo) | Totales por método de pago y diferencia | [ ] | |
| 10.4 | Cierre | Cerrar turno con totales | Se registra, estado "cerrado", diferencia calculada | [ ] | |
| 10.5 | Validación | Abrir dos turnos simultáneos | Se rechaza, solo 1 abierto por usuario | [ ] | |
| 10.6 | Validación | Abrir turno con body vacío | HTTP 400 | [ ] | |
| 10.7 | Bloqueo | Intentar registrar ingreso/salida sin turno abierto | Bloqueado, modal para abrir turno | [ ] | |
| 10.8 | Bloqueo | Turno cerrado → intentar operar | Bloqueado, modal para abrir turno | [ ] | |

---

## 11. Reportes y dashboard

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 11.1 | Dashboard | Cargar dashboard | Muestra KPIs (vehículos activos, ingresos, ocupación) | [ ] | |
| 11.2 | Dashboard | Actividad reciente | Tabla con datos actualizados | [ ] | |
| 11.3 | Dashboard | Acciones rápidas | Enlaces funcionan correctamente | [ ] | |
| 11.4 | KPIs | Obtener KPIs del período | Ingresos totales, tickets, ticket promedio, ocupación | [ ] | |
| 11.5 | Ingresos | Reporte de ingresos por día | Datos correctos | [ ] | |
| 11.6 | Ingresos | Reporte de ingresos por método de pago | Datos correctos | [ ] | |
| 11.7 | Movimientos | Reporte de movimientos paginados | Navegación entre páginas funcional | [ ] | |
| 11.8 | Placas | Top placas frecuentes | Ranking correcto | [ ] | |
| 11.9 | Turnos | Reporte de turnos de caja | Datos correctos | [ ] | |
| 11.10 | Filtros | Filtrar por rango de fechas | Datos cambian según filtro | [ ] | |
| 11.11 | Exportación | Exportar movimientos a Excel | Archivo .xlsx válido con datos | [ ] | |
| 11.12 | Exportación | Exportar turnos a Excel | Archivo .xlsx válido | [ ] | |
| 11.13 | Exportación | Exportar reporte completo a PDF | Archivo .pdf con tabla formateada | [ ] | |
| 11.14 | Exportación | Abrir Excel generado | Datos correctos, formato OK | [ ] | |
| 11.15 | Exportación | Abrir PDF generado | Tabla legible, datos correctos | [ ] | |
| 11.16 | Gráficos | Gráfico de ingresos por día | Chart renderiza correctamente | [ ] | |
| 11.17 | Gráficos | Gráfico de ingresos por método | Chart renderiza correctamente | [ ] | |
| 11.18 | Sin datos | Exportar con rango sin movimientos | Archivo con headers solamente | [ ] | |

---

## 12. Navegación y frontend

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 12.1 | Menú | Navegar entre todas las pantallas | Todas cargan correctamente | [ ] | |
| 12.2 | Sidebar | Toggle sidebar en móvil | Funciona correctamente | [ ] | |
| 12.3 | Roles | Rol operator oculta menú admin en sidebar | Elementos admin no visibles | [ ] | |
| 12.4 | Rutas | Acceder a rutas protegidas sin sesión | Redirección a login | [ ] | |
| 12.5 | Modales | Abrir y cerrar modales (SweetAlert2) | Funcionan correctamente | [ ] | |
| 12.6 | Toasts | Mostrar mensajes de éxito/error | Se visualizan correctamente | [ ] | |
| 12.7 | Footer | Verificar footer | Enlaces correctos | [ ] | |
| 12.8 | i18n | Verificar traducciones (es.json) | Todos los textos en español, sin claves faltantes | [ ] | |
| 12.9 | Loading | Verificar spinners/loaders al cargar datos | Aparecen durante carga | [ ] | |
| 12.10 | Scroll | Scroll en tablas largas | Funcional | [ ] | |
| 12.11 | Recarga | Recargar página en cada módulo | El sistema sigue estable, sesión se mantiene | [ ] | |
| 12.12 | Consola | Revisar errores en consola del navegador | Sin errores críticos | [ ] | |

---

## 13. Seguridad

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 13.1 | JWT | Token inválido en request | HTTP 401 | [ ] | |
| 13.2 | JWT | Sin token en request protegido | HTTP 401 | [ ] | |
| 13.3 | JWT | Token expirado | HTTP 401, manejo correcto | [ ] | |
| 13.4 | SQL Injection | Intento de SQL Injection en login (`'; DROP TABLE users;--`) | Rechazado o sanitizado, sin efecto | [ ] | |
| 13.5 | XSS | Intento de XSS en campos de texto (`<script>alert(1)</script>`) | Sanitizado, sin ejecución | [ ] | |
| 13.6 | Roles | Operator intenta acceder a endpoint admin | HTTP 403 o 401 | [ ] | |
| 13.7 | Rate limit | 6+ logins fallidos consecutivos | Bloqueo temporal 15 min | [ ] | |
| 13.8 | Passwords | Verificar hash en BD | Passwords con prefijo bcrypt `$2a$` | [ ] | |
| 13.9 | Archivos | Acceder a `.env` vía HTTP (`curl localhost:3000/.env`) | HTTP 404, no accesible | [ ] | |
| 13.10 | Upload | Subir archivo > 2MB como logo | Rechazado con error | [ ] | |
| 13.11 | Upload | Subir archivo no imagen como logo | Rechazado | [ ] | |
| 13.12 | Sanitización | Inputs con caracteres especiales | Sanitizados correctamente | [ ] | |

---

## 14. Casos límite

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 14.1 | Duplicados | Placa duplicada en misma empresa | Se rechaza | [ ] | |
| 14.2 | Duplicados | Username duplicado en misma empresa | Se rechaza | [ ] | |
| 14.3 | Duplicados | NIT duplicado | Se rechaza | [ ] | |
| 14.4 | Flujo | Salida sin entrada previa | Error | [ ] | |
| 14.5 | Flujo | Entrada de vehículo ya dentro del parqueadero | Error "ya se encuentra" | [ ] | |
| 14.6 | Turno | Cerrar turno sin movimientos | Permite cerrar | [ ] | |
| 14.7 | Tarifa | Tarifa con precio 0 | Se rechaza | [ ] | |
| 14.8 | Inputs | Placa con caracteres especiales | Sanitizado | [ ] | |
| 14.9 | Fechas | Fecha desde > fecha hasta en reportes | Manejo correcto | [ ] | |
| 14.10 | Paginación | Paginación con página 0 | Retorna primera página | [ ] | |
| 14.11 | Paginación | Paginación con página negativa | Manejo correcto | [ ] | |
| 14.12 | IDs | ID no numérico en params | HTTP 400 o 404 | [ ] | |
| 14.13 | Seguridad | Intentar desactivar el propio admin | Se rechaza | [ ] | |
| 14.14 | Turno | Intentar cerrar turno ya cerrado | Se rechaza | [ ] | |

---

## 15. Manejo de errores

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 15.1 | API | Login con credenciales vacías | HTTP 400 | [ ] | |
| 15.2 | API | Ruta inexistente (`GET /api/nonexistent`) | HTTP 404 | [ ] | |
| 15.3 | API | Usuario inexistente | HTTP 404 | [ ] | |
| 15.4 | API | Vehículo inexistente | HTTP 404 | [ ] | |
| 15.5 | API | Body vacío en endpoints POST/PUT | HTTP 400 | [ ] | |
| 15.6 | BD | Simular error de base de datos | Se maneja con error visible, sin crash del servidor | [ ] | |
| 15.7 | Frontend | Error de red en petición API | Mensaje de error al usuario | [ ] | |
| 15.8 | Frontend | Token expirado en frontend | Redirección a login | [ ] | |

---

## 16. Rendimiento

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 16.1 | API | Tiempo de respuesta login | < 2 segundos | [ ] | |
| 16.2 | Frontend | Tiempo de carga del dashboard | < 3 segundos | [ ] | |
| 16.3 | Frontend | Tiempo de carga de reportes | < 5 segundos | [ ] | |
| 16.4 | Export | Exportar Excel con 1000+ registros | < 10 segundos | [ ] | |
| 16.5 | Export | Exportar PDF con 1000+ registros | < 10 segundos | [ ] | |
| 16.6 | Estrés | 50 requests simultáneos a `/api/dashboard/stats` | Sin errores 500 | [ ] | |
| 16.7 | DB Pool | Verificar pool de conexiones en db.js | Max 5 conexiones configuradas | [ ] | |
| 16.8 | Memoria | Verificar uso de memoria después de uso prolongado | Sin memory leaks | [ ] | |

---

## 17. Docker

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 17.1 | Build | Ejecutar `docker-compose up -d` | 2 contenedores levantados (web + db) | [ ] | |
| 17.2 | Estado | Verificar contenedores (`docker-compose ps`) | web: running, db: running | [ ] | |
| 17.3 | Logs | Revisar logs del contenedor web | Sin errores | [ ] | |
| 17.4 | Logs | Revisar logs del contenedor db | MariaDB lista | [ ] | |
| 17.5 | Acceso | Acceder a `http://localhost:3000` | Login visible | [ ] | |
| 17.6 | DB | Conexión a BD desde Docker | Conexión exitosa | [ ] | |
| 17.7 | Persistencia | Restart del contenedor db, verificar datos | Datos preservados (volumen) | [ ] | |
| 17.8 | Tests | Ejecutar suite de tests contra Docker | Todos pasan | [ ] | |
| 17.9 | Detener | `docker-compose down` | Contenedores detenidos limpiamente | [ ] | |
| 17.10 | Limpieza | `docker-compose down -v` | DB y volúmenes eliminados | [ ] | |

---

## 18. Build y compilación

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 18.1 | CSS | Ejecutar `npm run build:css` | `tailwind.css` minificado generado | [ ] | |
| 18.2 | Build | Ejecutar `npm run build` | Ejecutable en `dist/` generado | [ ] | |
| 18.3 | Verificar | Verificar `dist/parqueadero.exe` | Archivo existe y es ejecutable | [ ] | |
| 18.4 | Verificar | Verificar `dist/public/` | Archivos estáticos copiados | [ ] | |
| 18.5 | Verificar | Verificar `dist/schema.sql` | Archivo copiado | [ ] | |

---

## 19. Tests automatizados

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 19.1 | Unitarios | Ejecutar `node --test tests/*.test.js` | Tests unitarios pasan | [ ] | |
| 19.2 | API | Ejecutar `bash tests/test-api.sh` | 39+ tests de API pasan | [ ] | |
| 19.3 | API | Verificar cobertura: Auth | Login + me OK | [ ] | |
| 19.4 | API | Verificar cobertura: Vehicles | CRUD + historial + validación | [ ] | |
| 19.5 | API | Verificar cobertura: Users | CRUD + validación + roles | [ ] | |
| 19.6 | API | Verificar cobertura: Rates | 3 tipos + validación | [ ] | |
| 19.7 | API | Verificar cobertura: Companies | me + config + update | [ ] | |
| 19.8 | API | Verificar cobertura: Movements | entry + exit + validación | [ ] | |
| 19.9 | API | Verificar cobertura: Payments | bulk + validación | [ ] | |
| 19.10 | API | Verificar cobertura: Shifts | open + current + summary + close + validación | [ ] | |
| 19.11 | API | Verificar cobertura: Reports | kpis + income + movements + top-plates + shifts | [ ] | |
| 19.12 | API | Verificar cobertura: Dashboard | stats | [ ] | |
| 19.13 | API | Verificar cobertura: Error Handling | 400, 401, 404 | [ ] | |

---

## 20. Documentación

| # | Área | Acción | Resultado esperado | Estado | Observaciones |
|---|------|--------|-------------------|--------|---------------|
| 20.1 | README | Revisar README.md | Instalación, estructura, API documentada | [ ] | |
| 20.2 | Guía | Revisar GUIDE.md | Arquitectura, backend, frontend documentado | [ ] | |
| 20.3 | Manual | Revisar MANUAL_ADMIN.md | CRUD, configuración, migraciones, logs | [ ] | |
| 20.4 | Manual | Revisar MANUAL_OPERATOR.md | Entrada/salida, cobros, turnos | [ ] | |
| 20.5 | Manual | Revisar MANUAL_OWNER.md | Reportes, indicadores | [ ] | |
| 20.6 | Env | Verificar `.env.example` o documentación de variables | Variables documentadas | [ ] | |
| 20.7 | Git | Verificar `.gitignore` | .env, node_modules, dist excluidos | [ ] | |
| 20.8 | Código | Revisar TODOs pendientes en código | Sin TODOs sin resolver | [ ] | |

---

## Resumen

| Sección | Total puntos |
|---------|-------------|
| 1. Preparación del entorno | 8 |
| 2. Base de datos y migraciones | 17 |
| 3. Servidor backend | 8 |
| 4. Autenticación y acceso | 14 |
| 5. Configuración de empresa | 16 |
| 6. Gestión de usuarios | 11 |
| 7. Gestión de tarifas | 10 |
| 8. Gestión de vehículos | 13 |
| 9. Ingreso y salida | 19 |
| 10. Turnos de caja | 8 |
| 11. Reportes y dashboard | 18 |
| 12. Navegación y frontend | 12 |
| 13. Seguridad | 12 |
| 14. Casos límite | 14 |
| 15. Manejo de errores | 8 |
| 16. Rendimiento | 8 |
| 17. Docker | 10 |
| 18. Build y compilación | 5 |
| 19. Tests automatizados | 13 |
| 20. Documentación | 8 |
| **TOTAL** | **220** |
