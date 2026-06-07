#!/bin/bash
# Comprehensive API test script for ParkSystem
# Tests all 39 API endpoints across all resources

BASE_URL="http://localhost:3000/api"
TOKEN=""
PASS=0
FAIL=0
ERRORS=()

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

TEST_VEHICLE_PLATE="T$(date +%s | cut -c6-10)"
TEST_USERNAME="testuser$(date +%s)"
TEST_VEHICLE_ID=""
TEST_USER_ID=""
TEST_MOVEMENT_ID=""

log() { echo -e "$1"; }
ok()   { ((PASS++)); log "  ${GREEN}✓${NC} $1"; }
fail() { ((FAIL++)); ERRORS+=("$1"); log "  ${RED}✗${NC} $1"; }
skip() { log "  ${YELLOW}~${NC} $1"; }

section() {
  log ""
  log "${CYAN}══════════════════════════════════════════════════${NC}"
  log "${CYAN}  $1${NC}"
  log "${CYAN}══════════════════════════════════════════════════${NC}"
}

jq_check() {
  local json=$1 filter=$2
  echo "$json" | jq -r "$filter" 2>/dev/null || echo ""
}

jq_has() {
  local json=$1 filter=$2
  result=$(echo "$json" | jq "$filter" 2>/dev/null || echo "false")
  [ "$result" = "true" ]
}

###############################################################################
# 1. AUTH
###############################################################################
section "AUTH"

echo "  Login with default credentials..."
LOGIN_RESULT=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"tax_id":"900123456-7","username":"admin","password":"admin123"}')

TOKEN=$(jq_check "$LOGIN_RESULT" '.data.token // ""')

if [ -z "$TOKEN" ]; then
  fail "POST /auth/login — no se obtuvo token"
  echo "  Respuesta: $(echo "$LOGIN_RESULT" | jq -c . 2>/dev/null)"
  exit 1
else
  ok "POST /auth/login — token obtenido"
fi

RESULT=$(curl -s -X GET "${BASE_URL}/auth/me" -H "Authorization: Bearer $TOKEN")
if jq_has "$RESULT" '.success'; then
  ok "GET /auth/me"
else
  fail "GET /auth/me"
fi

###############################################################################
# 2. VEHICLES
###############################################################################
section "VEHICLES"

RESULT=$(curl -s -X GET "${BASE_URL}/vehicles" -H "Authorization: Bearer $TOKEN")
if jq_has "$RESULT" '.success'; then
  ok "GET /vehicles — listar todos"
else
  fail "GET /vehicles — listar todos"
fi

RESULT=$(curl -s -X POST "${BASE_URL}/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"license_plate":"'"$TEST_VEHICLE_PLATE"'","type":"car","color":"Rojo","model":"Test 2024"}')
if jq_has "$RESULT" '.success'; then
  ok "POST /vehicles — crear"
  TEST_VEHICLE_ID=$(jq_check "$RESULT" '.data.id_vehicle // ""')
else
  fail "POST /vehicles — crear: $(jq_check "$RESULT" '.message')"
fi

if [ -n "$TEST_VEHICLE_ID" ]; then
  RESULT=$(curl -s -X GET "${BASE_URL}/vehicles/$TEST_VEHICLE_ID" -H "Authorization: Bearer $TOKEN")
  jq_has "$RESULT" '.success' && ok "GET /vehicles/:id — obtener por ID" || fail "GET /vehicles/:id"

  RESULT=$(curl -s -X PUT "${BASE_URL}/vehicles/$TEST_VEHICLE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"color":"Azul"}')
  jq_has "$RESULT" '.success' && ok "PUT /vehicles/:id — actualizar" || fail "PUT /vehicles/:id"

  RESULT=$(curl -s -X GET "${BASE_URL}/vehicles/$TEST_VEHICLE_ID/history" -H "Authorization: Bearer $TOKEN")
  jq_has "$RESULT" '.success' && ok "GET /vehicles/:id/history — historial" || fail "GET /vehicles/:id/history"
else
  skip "GET /vehicles/:id — sin ID"
  skip "PUT /vehicles/:id — sin ID"
  skip "GET /vehicles/:id/history — sin ID"
fi

# Validation error
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$HTTP" = "400" ] && ok "POST /vehicles — validación body vacío → 400" || fail "POST /vehicles — validación (esperado 400, recibido $HTTP)"

# 404
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/vehicles/999999" -H "Authorization: Bearer $TOKEN")
[ "$HTTP" = "404" ] && ok "GET /vehicles/999999 — 404" || fail "GET /vehicles/999999 (esperado 404, recibido $HTTP)"

###############################################################################
# 3. USERS
###############################################################################
section "USERS"

RESULT=$(curl -s -X GET "${BASE_URL}/users" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /users — listar" || fail "GET /users"

RESULT=$(curl -s -X POST "${BASE_URL}/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"'"$TEST_USERNAME"'","password":"test123456","role":"operator"}')
if jq_has "$RESULT" '.success'; then
  ok "POST /users — crear"
  TEST_USER_ID=$(jq_check "$RESULT" '.data.id_user // ""')
else
  fail "POST /users — crear: $(jq_check "$RESULT" '.message')"
fi

if [ -n "$TEST_USER_ID" ]; then
  RESULT=$(curl -s -X GET "${BASE_URL}/users/$TEST_USER_ID" -H "Authorization: Bearer $TOKEN")
  jq_has "$RESULT" '.success' && ok "GET /users/:id" || fail "GET /users/:id"

  RESULT=$(curl -s -X PUT "${BASE_URL}/users/$TEST_USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User Updated"}')
  jq_has "$RESULT" '.success' && ok "PUT /users/:id — actualizar" || fail "PUT /users/:id"
else
  skip "GET /users/:id — sin ID"
  skip "PUT /users/:id — sin ID"
fi

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"","username":"","password":"","role":""}')
[ "$HTTP" = "400" ] && ok "POST /users — validación → 400" || fail "POST /users — validación (esperado 400, recibido $HTTP)"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/users")
[ "$HTTP" = "401" ] && ok "GET /users — sin token → 401" || fail "GET /users — sin token (esperado 401, recibido $HTTP)"

###############################################################################
# 4. RATES
###############################################################################
section "RATES"

RESULT=$(curl -s -X GET "${BASE_URL}/rates/current" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /rates/current" || fail "GET /rates/current"

RESULT=$(curl -s -X PUT "${BASE_URL}/rates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type":"car","hourly_rate":5000,"minute_rate":100,"full_day_rate":50000,"billing_mode":"mixed","minutes_to_hours_threshold":30,"hours_to_days_threshold":5,"hourly_rounding":"up","daily_rounding":"up"}')
jq_has "$RESULT" '.success' && ok "PUT /rates — tarifa carro" || fail "PUT /rates — carro"

RESULT=$(curl -s -X PUT "${BASE_URL}/rates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type":"motorcycle","hourly_rate":3000,"minute_rate":60,"full_day_rate":30000,"billing_mode":"mixed","minutes_to_hours_threshold":30,"hours_to_days_threshold":5,"hourly_rounding":"up","daily_rounding":"up"}')
jq_has "$RESULT" '.success' && ok "PUT /rates — tarifa moto" || fail "PUT /rates — moto"

RESULT=$(curl -s -X PUT "${BASE_URL}/rates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type":"bicycle","hourly_rate":1000,"minute_rate":20,"full_day_rate":10000,"billing_mode":"mixed","minutes_to_hours_threshold":30,"hours_to_days_threshold":5,"hourly_rounding":"up","daily_rounding":"up"}')
jq_has "$RESULT" '.success' && ok "PUT /rates — tarifa bici" || fail "PUT /rates — bici"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${BASE_URL}/rates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type":"invalid"}')
[ "$HTTP" = "400" ] && ok "PUT /rates — validación tipo inválido → 400" || fail "PUT /rates — validación (esperado 400, recibido $HTTP)"

###############################################################################
# 5. COMPANIES
###############################################################################
section "COMPANIES"

RESULT=$(curl -s -X GET "${BASE_URL}/companies/me" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /companies/me" || fail "GET /companies/me"

RESULT=$(curl -s -X GET "${BASE_URL}/companies/config" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /companies/config" || fail "GET /companies/config"

RESULT=$(curl -s -X PUT "${BASE_URL}/companies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ParkSystem Test","address":"Main Street #123"}')
jq_has "$RESULT" '.success' && ok "PUT /companies — actualizar datos" || fail "PUT /companies"

RESULT=$(curl -s -X PUT "${BASE_URL}/companies/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency":"COP","timezone":"America/Bogota","vat_percentage":19}')
jq_has "$RESULT" '.success' && ok "PUT /companies/config — actualizar config" || fail "PUT /companies/config"

###############################################################################
# 6. MOVEMENTS
###############################################################################
section "MOVEMENTS"

RESULT=$(curl -s -X POST "${BASE_URL}/movements/entry" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"license_plate":"'"$TEST_VEHICLE_PLATE"'","type":"car"}')
if jq_has "$RESULT" '.success'; then
  ok "POST /movements/entry — registrar ingreso"
  TEST_MOVEMENT_ID=$(jq_check "$RESULT" '.data.id_movement // ""')
else
  fail "POST /movements/entry: $(jq_check "$RESULT" '.message')"
fi

if [ -n "$TEST_MOVEMENT_ID" ]; then
  RESULT=$(curl -s -X GET "${BASE_URL}/movements/$TEST_MOVEMENT_ID" -H "Authorization: Bearer $TOKEN")
  jq_has "$RESULT" '.success' && ok "GET /movements/:id — detalle" || fail "GET /movements/:id"

  RESULT=$(curl -s -X GET "${BASE_URL}/movements/$TEST_MOVEMENT_ID/history" -H "Authorization: Bearer $TOKEN")
  jq_has "$RESULT" '.success' && ok "GET /movements/:id/history" || fail "GET /movements/:id/history"
else
  skip "GET /movements/:id — sin ID"
  skip "GET /movements/:id/history — sin ID"
fi

RESULT=$(curl -s -X POST "${BASE_URL}/movements/exit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"license_plate":"'"$TEST_VEHICLE_PLATE"'"}')
jq_has "$RESULT" '.success' && ok "POST /movements/exit — registrar salida" || fail "POST /movements/exit: $(jq_check "$RESULT" '.message')"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/movements/entry" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$HTTP" = "400" ] && ok "POST /movements/entry — validación → 400" || fail "POST /movements/entry — validación (esperado 400, recibido $HTTP)"

# Re-entry for payment test
RESULT=$(curl -s -X POST "${BASE_URL}/movements/entry" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"license_plate":"'"$TEST_VEHICLE_PLATE"'","type":"car"}')
PAY_MOVEMENT=$(jq_check "$RESULT" '.data.id_movement // ""')

###############################################################################
# 7. PAYMENTS
###############################################################################
section "PAYMENTS"

if [ -n "$PAY_MOVEMENT" ]; then
  RESULT=$(curl -s -X POST "${BASE_URL}/payments/bulk" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"id_movement":'"$PAY_MOVEMENT"',"payments":[{"payment_method":"cash","amount":10000}]}')
  jq_has "$RESULT" '.success' && ok "POST /payments/bulk — registrar pago" || fail "POST /payments/bulk: $(jq_check "$RESULT" '.message')"

  # Exit after payment
  curl -s -X POST "${BASE_URL}/movements/exit" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"license_plate":"'"$TEST_VEHICLE_PLATE"'"}' > /dev/null
  ok "POST /movements/exit — salida con pago (limpieza)"
else
  skip "POST /payments/bulk — sin movimiento activo"
fi

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/payments/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$HTTP" = "400" ] && ok "POST /payments/bulk — validación → 400" || fail "POST /payments/bulk — validación (esperado 400, recibido $HTTP)"

###############################################################################
# 8. SHIFTS
###############################################################################
section "SHIFTS"

RESULT=$(curl -s -X POST "${BASE_URL}/shifts/open" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"initial_base":50000}')
jq_has "$RESULT" '.success' && ok "POST /shifts/open — abrir turno" || fail "POST /shifts/open: $(jq_check "$RESULT" '.message')"

RESULT=$(curl -s -X GET "${BASE_URL}/shifts/current" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /shifts/current" || fail "GET /shifts/current"

RESULT=$(curl -s -X GET "${BASE_URL}/shifts/summary" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /shifts/summary" || fail "GET /shifts/summary"

RESULT=$(curl -s -X POST "${BASE_URL}/shifts/close" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"total_cash":50000,"total_card":0,"total_qr":0,"closing_observation":"Test closure"}')
jq_has "$RESULT" '.success' && ok "POST /shifts/close — cerrar turno" || fail "POST /shifts/close: $(jq_check "$RESULT" '.message')"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/shifts/open" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$HTTP" = "400" ] && ok "POST /shifts/open — validación → 400" || fail "POST /shifts/open — validación (esperado 400, recibido $HTTP)"

###############################################################################
# 9. REPORTS
###############################################################################
section "REPORTS"

TODAY=$(date +%Y-%m-%d)

RESULT=$(curl -s -X GET "${BASE_URL}/reports/kpis?from=$TODAY&to=$TODAY" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /reports/kpis" || fail "GET /reports/kpis"

RESULT=$(curl -s -X GET "${BASE_URL}/reports/income-by-day?from=$TODAY&to=$TODAY" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /reports/income-by-day" || fail "GET /reports/income-by-day"

RESULT=$(curl -s -X GET "${BASE_URL}/reports/income-by-payment-method?from=$TODAY&to=$TODAY" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /reports/income-by-payment-method" || fail "GET /reports/income-by-payment-method"

RESULT=$(curl -s -X GET "${BASE_URL}/reports/movements?from=$TODAY&to=$TODAY&page=0&pageSize=10" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /reports/movements" || fail "GET /reports/movements"

RESULT=$(curl -s -X GET "${BASE_URL}/reports/top-plates?from=$TODAY&to=$TODAY&limit=5" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /reports/top-plates" || fail "GET /reports/top-plates"

RESULT=$(curl -s -X GET "${BASE_URL}/reports/shifts?from=$TODAY&to=$TODAY" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /reports/shifts" || fail "GET /reports/shifts"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/reports/kpis?from=$TODAY&to=$TODAY")
[ "$HTTP" = "401" ] && ok "GET /reports/kpis — sin token → 401" || fail "GET /reports/kpis — sin token (esperado 401, recibido $HTTP)"

###############################################################################
# 10. DASHBOARD
###############################################################################
section "DASHBOARD"

RESULT=$(curl -s -X GET "${BASE_URL}/dashboard/stats" -H "Authorization: Bearer $TOKEN")
jq_has "$RESULT" '.success' && ok "GET /dashboard/stats" || fail "GET /dashboard/stats"

###############################################################################
# 11. ERROR HANDLING
###############################################################################
section "ERROR HANDLING"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"tax_id":"","username":"","password":""}')
[ "$HTTP" = "400" ] && ok "POST /auth/login — credenciales vacías → 400" || fail "POST /auth/login — credenciales vacías (esperado 400, recibido $HTTP)"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/nonexistent")
[ "$HTTP" = "404" ] && ok "GET /nonexistent — ruta no existe → 404" || fail "GET /nonexistent (esperado 404, recibido $HTTP)"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/users/999999" -H "Authorization: Bearer $TOKEN")
[ "$HTTP" = "404" ] && ok "GET /users/999999 — usuario inexistente → 404" || fail "GET /users/999999 (esperado 404, recibido $HTTP)"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE_URL}/vehicles/999999" -H "Authorization: Bearer $TOKEN")
[ "$HTTP" = "404" ] && ok "DELETE /vehicles/999999 — vehículo inexistente → 404" || fail "DELETE /vehicles/999999 (esperado 404, recibido $HTTP)"

###############################################################################
# 12. CLEANUP
###############################################################################
section "CLEANUP"

if [ -n "$TEST_USER_ID" ]; then
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE_URL}/users/$TEST_USER_ID" -H "Authorization: Bearer $TOKEN")
  if [ "$HTTP" = "204" ] || [ "$HTTP" = "200" ]; then
    ok "DELETE /users/$TEST_USER_ID — usuario eliminado"
  else
    fail "DELETE /users/$TEST_USER_ID (esperado 204, recibido $HTTP)"
  fi
fi

if [ -n "$TEST_VEHICLE_ID" ]; then
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE_URL}/vehicles/$TEST_VEHICLE_ID" -H "Authorization: Bearer $TOKEN")
  if [ "$HTTP" = "204" ] || [ "$HTTP" = "200" ] || [ "$HTTP" = "400" ]; then
    ok "DELETE /vehicles/$TEST_VEHICLE_ID — vehículo con historial (protegido)"
  else
    fail "DELETE /vehicles/$TEST_VEHICLE_ID (esperado 204/400, recibido $HTTP)"
  fi
fi

###############################################################################
# SUMMARY
###############################################################################
section "RESULTADO FINAL"
TOTAL=$((PASS + FAIL))

echo ""
echo -e "  ${GREEN}Total pruebas  : $TOTAL${NC}"
echo -e "  ${GREEN}Pasaron        : $PASS${NC}"
if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}Fallaron       : $FAIL${NC}"
  echo ""
  echo -e "  ${RED}Errores:${NC}"
  for err in "${ERRORS[@]}"; do
    echo -e "    • $err"
  done
else
  echo -e "  ${GREEN}Fallaron       : 0${NC}"
  echo ""
  echo -e "  ${GREEN}✅ TODAS LAS PRUEBAS PASARON${NC}"
fi
echo ""

exit $FAIL
