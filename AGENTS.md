# Repository Guidelines

## 프로젝트 구조와 모듈 구성
- 루트에는 `README.md`, `AGENTS.md`, 비교 연구용 서브모듈 `spec-kit/`가 있습니다. `spec-kit/`는 참조 전용이므로 수정하지 마세요.
- `src/`는 Bun 기반 CLI 핵심 코드를 보관합니다. `src/bin.ts`가 진입점이며 `src/cli/commands/`에서 슬래시 명령 로직을, `src/core/`에서 명세 처리 파이프라인을, `src/research/`에서 Playwright MCP 연동을 관리합니다.
- 템플릿과 거버넌스 아티팩트는 `templates/`와 `memory/`에 위치합니다. 명세·계획·작업 템플릿은 각각 `templates/spec/`, `templates/plan/`, `templates/tasks/`에 배치하고, 조직 헌장은 `memory/constitution.md`로 통합 관리합니다.
- Codex 슬래시 명령 템플릿은 `templates/commands/`에 있으며, `bun install`/`npm install` 또는 `specodex init` 실행 시 자동으로 `~/.codex/commands/specodex/`에 설치됩니다. 재설치가 필요하면 `specodex install codex`를 사용하세요.
- 자동화 스크립트는 `scripts/`에 저장하며 POSIX(`*.sh`)와 PowerShell(`*.ps1`) 버전을 쌍으로 유지합니다. 테스트 리소스는 `tests/` 아래 `*.spec.ts` 패턴으로 정리합니다.
- 실제 명세 예시는 `specs/`에 보관합니다. `specs/example/tasks.yaml`은 구현 예시이며 필요 시 기능별 디렉터리를 추가하세요.

## SpecoDex CLI 명령 흐름
- `specodex init [project]` : 프로젝트 구조와 템플릿을 부트스트랩합니다. 완료 후 `/constitution` 안내가 출력됩니다.
- `specodex constitution` : Codex에 전달할 헌장 프롬프트를 보여주고, `--apply`로 결과를 반영합니다. 완료 시 `/specify` 실행을 안내합니다.
- `specodex install codex [--force] [--dry-run]` : Codex CLI에 `/constitution`, `/specify` 등 슬래시 명령 템플릿을 재설치합니다. 자동 설치를 건너뛰려면 `specodex init ... --skip-codex-install` 또는 `SPECODEX_SKIP_CODEX_INSTALL=1`을 사용하세요.
- `specodex specify <feature>` → `specodex plan <feature>` → `specodex tasks <feature>` : 명세·계획·작업을 순차적으로 생성하며 각 단계가 끝날 때마다 다음 명령을 실행하라는 메시지가 출력됩니다.
- `specodex research <url>` : Playwright MCP 스크립트를 호출해 `memory/research/`에 로그를 남기고, 명세·계획을 업데이트하라고 안내합니다.
- `specodex implement [--tasks ...] [--dry-run]` : 작업 그래프를 실행하고 검증 후 필요한 단계로 되돌아가라고 안내합니다.

## 빌드·테스트·개발 명령
- `bun install` : 의존성을 설치합니다. 템플릿을 추가하거나 업데이트한 뒤 반드시 실행하세요.
- `bun run dev` : CLI를 감시 없이 실행해 새로운 명령을 빠르게 검증합니다.
- `bun run build` : TypeScript 코드를 `dist/`로 컴파일해 배포 가능한 CLI를 생성합니다.
- `bun run lint` : ESLint와 Prettier 조합으로 정적 품질 검사를 수행합니다.
- `bun run test` : Vitest 기반 단위·통합 테스트를 실행합니다. 스냅샷 민감 테스트는 `bun run test -- --runInBand`로 순차 처리하세요.
- `scripts/bootstrap.sh` : Playwright MCP 연동에 필요한 환경 변수와 캐시 디렉터리를 초기화합니다.
- `scripts/run-playwright.sh <url>` : Playwright CLI가 설치되어 있다는 전제하에 조사 결과를 `memory/research/`에 남깁니다.

## 코딩 스타일과 네이밍 규칙
- TypeScript는 2칸 스페이스 인덴트를 사용합니다. ESLint(`@eslint/js` + `typescript-eslint`)와 Prettier를 통과하지 못한 코드는 커밋하지 마세요.
- 슬래시 명령 구현 파일은 `camelCase` 파일명(`/implement` → `implement.ts`), 핵심 서비스 클래스는 `PascalCase`(`PlanCompiler`)를 사용합니다.
- 템플릿 파일은 `kebab-case.md`를 유지하고, 명세 문서에서 불확실한 요구는 `[CLARIFY: …]` 마커로 표기합니다.

## 테스트 가이드라인
- 기본 테스트 프레임워크는 Vitest이며, CLI 명령 회귀 검증을 위해 Playwright MCP 시뮬레이터 테스트를 병행합니다.
- 테스트 파일은 `tests/<모듈>-*.spec.ts` 규칙을 따릅니다. 신규 기능은 명령 분기 기준 80% 이상 커버리지를 목표로 합니다.
- 외부 API 호출 테스트는 `mocks/` 디렉터리의 고정 응답을 사용하고, `bun run test --coverage` 결과를 PR에 첨부하세요.

## 커밋 및 풀 리퀘스트 지침
- 커밋 메시지는 Conventional Commits 규칙을 따르며 예시는 `feat: plan compiler 추가`입니다. 작업 중 커밋은 로컬에서 rebase로 정리한 뒤 푸시하세요.
- PR 본문에는 변경 목적, 영향받는 경로 예시(`src/core`, `templates/plan`)와 검증 로그(`bun run test`)를 포함하고, 관련 이슈는 `Fixes #123` 형태로 연결합니다.
- CLI 출력이나 템플릿 구조가 변하면 `docs/` 또는 `memory/constitution.md` 변경 사항을 스크린샷이나 diff로 공유해 리뷰어가 상황을 빠르게 이해할 수 있게 하세요.

## 에이전트 전용 지침
- Codex 에이전트는 작업 시작 시 `memory/constitution.md`를 세션 컨텍스트에 로드하고, 문서를 갱신하면 세션을 재시작하세요.
- Playwright MCP 연구 세션은 `specodex research <url>` 또는 `scripts/run-playwright.sh <url>`로 실행하고, 결과는 명세·계획 단계에 반영합니다.
- `/tasks` 또는 `/implement` 실행이 실패하면 로그를 통해 실패한 작업을 파악하고, `/plan`이나 `/specify` 단계로 돌아가 수정하세요.
