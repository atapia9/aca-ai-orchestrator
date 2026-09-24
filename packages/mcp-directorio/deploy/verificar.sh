#!/usr/bin/env bash
# Verifica una instancia ya desplegada del servidor HTTP.
# Uso: deploy/verificar.sh https://mcp.acambaro.com.mx "$MCP_TOKEN"

set -euo pipefail

URL="${1:?Uso: verificar.sh <url-base> <token>}"
TOKEN="${2:?Uso: verificar.sh <url-base> <token>}"

echo "== GET /salud =="
curl -sf -o /dev/null -w "status: %{http_code}\n" "$URL/salud"

echo "== POST /mcp sin token (debe dar 401) =="
curl -s -o /dev/null -w "status: %{http_code}\n" -X POST "$URL/mcp" \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"verificar.sh","version":"0"}}}'

echo "== POST /mcp con token (initialize) =="
curl -sf -X POST "$URL/mcp" \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"verificar.sh","version":"0"}}}'
echo
echo "Listo."
