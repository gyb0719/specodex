# SpecoDex Development Blueprint

## 1. 비전과 성공 지표
- **핵심 목표**: Codex 에이전트가 명세 중심 워크플로를 통해 품질·속도·일관성을 체감할 수준으로 향상되도록 지원하는 도구 제공.
- **정량 지표**
  - 최초 명세 작성부터 기능 구현 완료까지 평균 작업 시간 30% 단축.
  - Codex 세션당 재시도 명령 수 25% 감소.
  - Vitest + 시나리오 테스트 통과율 95% 이상 유지.
  - 사용자 피드백 기반 “Codex 응답 품질 향상 체감” 긍정 응답 80% 이상.
- **정성 지표**: 명세 정확도, 계획 재사용성, 병렬 작업 지원, 자동 문서화 만족도.

## 2. 팀 운영 원칙
- `memory/constitution.md`에 정의된 명세 우선·테스트 우선·자동화 존중 원칙을 소스 오브 트루스로 사용.
- 주요 의사결정은 PR 설명과 헌장 업데이트로 기록하고, 각 단계 완료 시 `AGENTS.md`와 동기화.
- 커뮤니티 기여 수용 프로세스: 이슈 템플릿 → 명세 초안 → 계획 승인 → 구현.

## 3. 사용자 페르소나 및 핵심 시나리오
1. **솔로 개발자**: 사이드 프로젝트를 빠르게 부트스트랩, 템플릿 기반으로 반복 실행.
2. **에이전트 오케스트레이터**: Codex, Playwright MCP, 외부 연구 도구를 조합해 팀 작업 관리.
3. **엔터프라이즈 거버너**: 조직 표준(보안·성능·테스트)을 강제하고 감사 로그 확보.
- 대표 시나리오
  - `/constitution` 업데이트로 조직 규칙 반영.
  - `/specify`로 요구 수집 → `/plan`에서 기술 결정 → `/tasks`가 실행 그래프 생성 → `/implement`가 실제 명령 수행.
  - Playwright MCP를 통한 연구 로그 자동 첨부.

## 4. 워크플로 개요
1. **Discovery**: `scripts/run-playwright.sh`로 참고 자료 수집, `memory/research` 저장.
2. **Specification**: 템플릿 기반 명세 작성, `[CLARIFY]` 마커 해소.
3. **Planning**: 계획 템플릿을 채우고 아키텍처·위험·테스트 기준 확정.
4. **Task Orchestration**: YAML 작업 그래프 작성, 병렬/순차 구분.
5. **Implementation**: CLI가 작업 그래프 실행, Codex 명령 자동화.
6. **Audit & Feedback**: 테스트·커버리지·Codex 세션 로그를 수집해 대시보드화.

## 5. 시스템 아키텍처
- **CLI 계층 (`src/cli`)**: Commander 기반 명령 등록, 로거, 옵션 파싱, 에이전트 친화적 UX.
- **명세 엔진 (`src/core/spec`)**: 템플릿 로더, 명세 검증기, [CLARIFY] 추적(추후 구현).
- **계획 컴파일러 (`src/core/plan`)**: 요구사항 → 아키텍처 결정 매핑, 위험 분석, 테스트 전략 생성.
- **작업 오케스트레이터 (`src/core/task-runner.ts`)**: YAML 파서, 위상 정렬, dry-run/실행, 실패 롤백 훅.
- **연구 브리지 (`scripts/run-playwright.sh`, 추후 TS 래퍼)**: Playwright MCP 호출 → 요약 → `memory/research` 기록 → 명세/계획에 자동 주입.
- **메모리 계층 (`memory/`)**: 헌장, 연구 로그, 과거 결정 아카이브. 버전 관리와 Codex 세션 로딩 지원.
- **관측 모듈 (`src/telemetry`, 예정)**: 실행 시간, 실패율, Codex API 사용량을 수집해 개선 여부 판단.

## 6. 핵심 CLI 명령
- **/constitution**: Codex 세션이 따라야 할 품질·보안·협업 원칙을 자연어로 정의하고 `memory/constitution.md`를 갱신합니다. 모든 워크플로는 이 문서를 읽고 시작합니다.
- **/specify**: 사용자 요구를 구조화된 명세로 변환합니다. Clarify 마커를 남겨 Codex가 질문을 만들도록 유도하고 `specs/<feature>/spec.md`를 생성합니다.
- **/plan**: 확정된 명세를 기반으로 기술 스택, 데이터 흐름, 테스트 전략을 결정하여 `specs/<feature>/plan.md`에 기록합니다. Codex는 이 단계를 통해 구현 결정을 정당화합니다.
- **/tasks**: 계획을 실행 가능한 YAML 그래프로 정리해 `specs/<feature>/tasks.yaml`을 생성합니다. 의존성, 병렬 가능 여부, 성공 조건을 명시해 Codex 작업을 세분화합니다.
- **/research**: Playwright MCP를 호출해 참고 자료와 코드 스니펫을 수집하고 `memory/research/`에 로그를 남깁니다. 결과를 명세·계획 단계에 반영합니다.
- **/implement**: 지정한 작업 그래프를 순차/병렬로 실행합니다. `--dry-run`으로 명령만 검토하거나 실 실행 시 로그와 실패 지점을 보고합니다.

## 7. 템플릿 및 아티팩트 전략
- 템플릿 버전은 `templates/<type>/manifest.json`(예정)으로 관리하고, CLI가 버전 호환성 검사.
- 명세/계획 문서는 링크 가능한 단락 ID를 포함해 Codex가 부분 재생성 가능하도록 설계.
- 작업 YAML은 `id`, `title`, `depends_on`, `steps`, `parallel`, `estimated_minutes`, `success_metrics` 필드를 표준화.
- 템플릿 변경 시 마이그레이션 스크립트 제공 (`scripts/migrate-templates.sh`, 예정).

## 8. Codex 통합 전략
- **세션 부트스트랩**: `scripts/bootstrap.sh` 실행 → 환경 변수 설정 → Codex가 `/constitution` 로드.
- **연구 명령**: `specodex research <url>` 또는 `scripts/run-playwright.sh <url>`로 Playwright MCP 로그를 수집하고, 결과를 명세/계획 입력으로 사용.
- **프롬프트 패키지**: 각 명령 실행 시 Codex에 주입할 “프롬프트 번들”을 `src/prompts/`에 JSON 형태로 저장.
- **실행 기록**: Codex 명령 입력/출력을 `memory/transcripts/`에 저장, 실패 패턴 분석에 활용.
- **성능 향상 메커니즘**
  - 명세/계획/작업 단계 분리를 통해 Codex가 초점 있는 작업을 수행.
  - 명시적 Clarify 태그로 질문 생성 → Codex가 추론 대신 질문 유도.
  - 작업 오케스트레이터가 failed command 재시도를 자동화하여 Codex의 반복 작업 감소.
- **벤치마크 절차**: 동일 기능을 SpecoDex 사용 전/후 Codex로 구현, 실행 시간·명령 수·테스트 통과율 비교.

## 9. 품질 보증 및 테스트 전략
- **유닛 테스트**: Vitest로 파서·정렬·옵션 처리 검증 (`tests/**/*`).
- **통합 테스트**: Bun + fixtures로 명령 실행 end-to-end 시뮬레이션.
- **시나리오 테스트**: 실제 Codex 세션을 재현하는 녹화 프롬프트 + 기대 결과.
- **커버리지 목표**: 명령/실행 경로 80%, 템플릿 파서 90%, 실패 처리 100% 케이스.
- **품질 게이트**: `bun run lint`, `bun run test`, `bun run build`를 PR 체크에 통합.
- **벤치마크 파이프라인**: GitHub Actions에서 SpecoDex vs baseline 실행, 퍼포먼스 지표를 README 배지로 표시.

## 10. 보안 및 구성 유의사항
- Playwright MCP 토큰, API 키는 `.env`에 저장하고 `.gitignore`에서 제외.
- 외부 명령 실행 시 `allowlist` 적용, 사용자가 명시하지 않은 삭제/네트워크 명령 금지.
- 템플릿 내 민감 데이터 금지 경고 추가, PR 시 자동 검사.

## 11. 로드맵
1. **알파 (주차 1-2)**: CLI 명령 골격, 템플릿 버전 0.1, Dry-run 지원, 단순 로그.
2. **베타 (주차 3-5)**: Codex 프롬프트 번들, Playwright MCP 자동화, `/audit` 프로토타입, 템플릿 마이그레이션 스크립트.
3. **RC (주차 6-7)**: 텔레메트리 수집, GitHub Actions 벤치마크, 문서 사이트 공개.
4. **GA (주차 8)**: 커뮤니티 피드백 반영, 장기 지원 브랜치, 버전 1.0 발표.

## 12. 오픈 소스 커뮤니티 전략
- **기여 가이드**: `CONTRIBUTING.md`에 명세→계획→작업 프로세스 명시, 샘플 이슈/PR 템플릿 제공.
- **릴리스 정책**: SemVer, Release Notes에 명세/계획/작업 변경 요약 포함.
- **커뮤니케이션 채널**: GitHub Discussions, 월간 로드맵 업데이트, 벤치마크 공유.
- **교육 자료**: 튜토리얼(Quickstart, Enterprise Playbook), 데모 영상, Codex 세션 녹화 공개.

---
본 문서는 SpecoDex 구현 전반의 기준 문서로, 모든 기능·정책·프로세스 결정 시 참조해야 합니다. 변경 사항이 생길 경우 PR에 근거를 명시하고 헌장 및 AGENTS.md와 함께 업데이트하세요.
