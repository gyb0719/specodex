#!/usr/bin/env bash
set -euo pipefail

# Playwright MCP 연동을 위한 환경 변수를 초기화합니다.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
CACHE_DIR="$PROJECT_ROOT/.specodex-cache"

mkdir -p "$CACHE_DIR/playwright"

export SPECODEX_CACHE_DIR="$CACHE_DIR"
export SPECODEX_RESEARCH_DIR="$PROJECT_ROOT/memory/research"

mkdir -p "$SPECODEX_RESEARCH_DIR"

echo "[bootstrap] 캐시 디렉터리: $SPECODEX_CACHE_DIR"
echo "[bootstrap] 연구 디렉터리: $SPECODEX_RESEARCH_DIR"
echo "Playwright MCP 연동 준비가 완료되었습니다."
