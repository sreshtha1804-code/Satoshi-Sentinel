#!/usr/bin/env bash
# Smoke-tests every Satoshi Sentinel backend endpoint against a running
# server. Run this after `uvicorn app.main:app --reload` is up.
#
# Usage: ./scripts/smoke_test.sh [base_url]
# Default base_url: http://localhost:8000

set -uo pipefail

BASE_URL="${1:-http://localhost:8000}"
PASS=0
FAIL=0

check() {
  local label="$1"
  local expected_status="$2"
  local actual_status="$3"
  if [ "$actual_status" = "$expected_status" ]; then
    echo "[PASS] $label (status $actual_status)"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $label (expected $expected_status, got $actual_status)"
    FAIL=$((FAIL + 1))
  fi
}

echo "Testing backend at $BASE_URL"
echo "================================================"

# 1. Health
status=$(curl -s -o /tmp/sentinel_smoke_health.json -w "%{http_code}" "$BASE_URL/api/health")
check "GET /api/health" "200" "$status"
cat /tmp/sentinel_smoke_health.json; echo

# 2. Generic analyze - benign message
status=$(curl -s -o /tmp/sentinel_smoke_analyze.json -w "%{http_code}" -X POST "$BASE_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"type":"message","content":"Hey, sent you the money for dinner last night, on-chain since Lightning was down."}')
check "POST /api/analyze (benign message)" "200" "$status"
cat /tmp/sentinel_smoke_analyze.json; echo

# 3. Generic analyze - high-risk message
status=$(curl -s -o /tmp/sentinel_smoke_risky.json -w "%{http_code}" -X POST "$BASE_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"type":"message","content":"URGENT giveaway! Send bitcoin to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh to claim your reward now!"}')
check "POST /api/analyze (high-risk message)" "200" "$status"
cat /tmp/sentinel_smoke_risky.json; echo

# 4. Security gate - seed phrase should be rejected with 400
status=$(curl -s -o /tmp/sentinel_smoke_seed.json -w "%{http_code}" -X POST "$BASE_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"type":"message","content":"abandon ability able about above absent absorb abstract absurd abuse access accident"}')
check "POST /api/analyze (seed phrase -> rejected)" "400" "$status"
cat /tmp/sentinel_smoke_seed.json; echo

# 5. /api/analyze/message
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/analyze/message" \
  -H "Content-Type: application/json" \
  -d '{"content":"This is the official support team, please confirm your recovery phrase."}')
check "POST /api/analyze/message" "200" "$status"

# 6. /api/analyze/address
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/analyze/address" \
  -H "Content-Type: application/json" \
  -d '{"content":"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}')
check "POST /api/analyze/address" "200" "$status"

# 7. /api/analyze/nostr
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/analyze/nostr" \
  -H "Content-Type: application/json" \
  -d '{"content":"npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6"}')
check "POST /api/analyze/nostr" "200" "$status"

# 8. /api/ai/explain
status=$(curl -s -o /tmp/sentinel_smoke_explain.json -w "%{http_code}" -X POST "$BASE_URL/api/ai/explain" \
  -H "Content-Type: application/json" \
  -d '{"input_type":"message","local_score":80,"findings":[{"type":"urgency_language","severity":"high","title":"Urgency language","description":"test","evidence":"test"}]}')
check "POST /api/ai/explain" "200" "$status"
cat /tmp/sentinel_smoke_explain.json; echo

# 9. Bitcoin address lookup (public data may be unavailable offline - status should still be 200)
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/bitcoin/address/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")
check "GET /api/bitcoin/address/{address}" "200" "$status"

# 10. Bitcoin transaction lookup
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/bitcoin/transaction/0000000000000000000000000000000000000000000000000000000000000000")
check "GET /api/bitcoin/transaction/{txid}" "200" "$status"

# 11. Nostr profile lookup (structural hex check; relay lookup may time out gracefully)
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/nostr/profile/npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6")
check "GET /api/nostr/profile/{pubkey}" "200" "$status"

echo "================================================"
echo "Passed: $PASS   Failed: $FAIL"
[ "$FAIL" -eq 0 ]
