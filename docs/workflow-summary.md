# SpecoDex Codex Workflow

## 핵심 단계 요약
1. **부트스트랩 & 헌장 적용**
   - `scripts/bootstrap.sh` 실행 후 `/constitution`으로 `memory/constitution.md`를 최신화하고 Codex 세션에 로드합니다.
2. **컨텍스트 조사 (선택)**
   - 외부 레퍼런스가 필요하면 `specodex research <url>` 또는 `scripts/run-playwright.sh <url>`로 Playwright MCP 로그를 수집합니다.
3. **명세 작성**
   - `/specify`로 요구 사항을 정규화한 명세(`specs/<feature>/spec.md`)로 변환하고 Clarify 마커를 처리합니다.
4. **기술 계획 수립**
   - `/plan`이 스택·데이터 흐름·테스트 전략을 정의해 `specs/<feature>/plan.md`에 기록합니다.
5. **작업 그래프 생성**
   - `/tasks`가 계획을 실행 가능한 YAML(`specs/<feature>/tasks.yaml`)로 분해해 의존성과 성공 기준을 명시합니다.
6. **구현 실행**
   - `/implement`가 작업 그래프를 순차/병렬로 수행하며 `--dry-run`으로 사전 검토, 실패 시 로그 보고를 제공합니다.
7. **검증 및 반복**
   - 테스트·커버리지 결과를 확인하고 필요 시 명세/계획을 갱신해 반복합니다.

## 세션 안내 메시지 규칙
- `/constitution` 완료 후: `"/specify를 실행해서 구현하고자 하는 내용을 설명하세요."`
- `/specify` 완료 후: `"/plan을 실행해 기술 스택과 구현 전략을 정리하세요."`
- `/plan` 완료 후: `"/tasks를 실행해 계획을 실행 가능한 작업으로 분해하세요."`
- `/tasks` 완료 후: `"/implement를 실행해 작업 그래프를 수행하세요. 필요하면 --dry-run으로 먼저 확인하세요."`
- `/implement` 완료 후: `"테스트 및 로그를 확인하고 필요하면 /specify 또는 /plan 단계로 돌아가 수정하세요."`

## Codex 성능 향상 포인트
- 단계별 산출물을 명확히 정의해 Codex가 집중할 작업을 줄이고, Clarify 마커로 질문 생성을 유도합니다.
- Playwright MCP 연구 스크립트로 추가 컨텍스트를 자동 수집해 Codex가 더 정확한 판단을 내리게 합니다.
- `/tasks`가 작업을 세분화하고 `/implement`가 실패 재시도를 관리해 불필요한 명령 반복을 줄입니다.
