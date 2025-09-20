<img width="1024" height="1024" alt="IMG_4459" src="https://github.com/user-attachments/assets/6c649a98-b3d6-4b33-90c8-594871070df5" />
# SpecoDex

![CI](https://github.com/ai-code-lab/specodex/actions/workflows/ci.yml/badge.svg)

SpecoDex는 Codex 에이전트 전용 명세 중심 워크플로 프레임워크입니다. `/constitution → /specify → /plan → /tasks → /implement`의 5단계와 Playwright MCP 기반 `/research` 단계를 묶어, 팀이 명세와 계획을 신뢰 가능한 핵심 산출물로 유지하도록 돕습니다. 이 저장소는 MIT 라이선스로 배포됩니다.

## 주요 특징
- **명세 우선 흐름**: 명세·계획·작업을 CLI 명령으로 강제 실행하고 각 단계 완료 시 다음 명령을 안내합니다.
- **Playwright 연구 포함**: `specodex research <url>`로 참고 사이트를 조사하고 스크린샷·헤딩·링크를 `memory/research/`에 자동 기록합니다.
- **템플릿 & 헌장 관리**: `templates/`와 `memory/constitution.md`에 팀 표준을 정의하고 모든 세션에서 재사용합니다.
- **터미널 친화적 구현 실행**: `specs/<feature>/tasks.yaml`을 위상 정렬 후 순차/병렬 실행하며 dry-run 옵션을 제공합니다.
- **테스트 및 문서 자동화**: Vitest 테스트, ESLint/Prettier 규칙, AGENTS/Docs 가이드가 포함되어 빠른 온보딩을 돕습니다.

## 필수 요구
- [Bun](https://bun.sh/) v1.2 이상
- Node.js 18 이상 (Bun 포함됨)
- Playwright CLI (`bun x playwright install chromium` 필수)
- macOS 또는 Linux (Windows는 WSL2 권장)

## 설치

> **중요**: Playwright 연구 명령이 필수이므로 최초 세팅 시 반드시 브라우저를 설치하세요.
> ```bash
> bun install
> bun x playwright install chromium
> ```

## 빌드 & 테스트
```bash
# 정적 분석
bun run lint

# 유닛 & 통합 테스트
bun x vitest --run --reporter=verbose

# 배포용 번들 생성
bun run build
```

## 빠른 시작
```bash
# 워크스페이스 초기화
./src/bin.ts init my-feature
cd my-feature
bun install
bun run install:browsers

# 1. 헌장 업데이트
../src/bin.ts constitution
# Codex가 생성한 헌장을 --apply로 반영
../src/bin.ts constitution --apply ./constitution.md

# 2~4. 명세/계획/작업 생성
../src/bin.ts specify 001-demo [--apply spec.md]
../src/bin.ts plan 001-demo [--apply plan.md]
../src/bin.ts tasks 001-demo [--apply tasks.yaml]

# 5. 구현 실행
../src/bin.ts implement --tasks specs/001-demo/tasks.yaml

# Playwright 연구 (필수 단계 중 하나)
../src/bin.ts research https://example.com
```
각 단계 실행 후 CLI가 다음 명령을 안내합니다. 실패 시 로그를 참고해 `/specify` 또는 `/plan` 단계로 되돌아가 수정하세요.

## CLI 요약
| 명령 | 설명 |
|------|------|
| `init` | 템플릿·헌장·샘플 명세를 포함한 워크스페이스 초기화 |
| `constitution` | 헌장 프롬프트 출력 및 Codex 결과 적용 |
| `specify` | 기능 명세 생성/적용 |
| `plan` | 구현 계획 생성/적용 |
| `tasks` | YAML 작업 그래프 생성/적용 |
| `research` | Playwright MCP로 참고 자료 수집 |
| `implement` | 작업 그래프 실행 (dry-run 지원) |

## 연구 로그 예시
```
memory/research/
 ├── 2025-09-20T03-45-39-076Z.md
 ├── 2025-09-20T03-45-39-076Z.json
 └── 2025-09-20T03-45-39-076Z.png
```
- `.md`: 페이지 제목, 헤딩 요약, 주요 링크 목록
- `.json`: Playwright 메타데이터 (헤딩·링크 배열 등)
- `.png`: 전체 페이지 스크린샷

### 예제 패키지
- `docs/examples/meeting-room-demo/`에는 회의실 예약 MVP 사례의 명세·계획·작업 YAML과 Playwright 로그가 포함되어 있어 실제 산출물 구조를 확인할 수 있습니다.

## 디렉터리 구조
```
src/
 ├── cli/commands/     # CLI 명령 구현
 ├── core/             # 명세/계획/작업 로직 및 실행 엔진
 └── research/         # Playwright MCP 브리지
scripts/               # bootstrap & run-playwright 스크립트
memory/                # 헌장 및 연구 로그 저장소
templates/             # 명세/계획/작업 템플릿
specs/                 # 기능별 산출물 (spec/plan/tasks)
docs/                  # 워크플로 문서, 청사진
```

## 기여
- `AGENTS.md`에서 프로젝트 구조, 스타일, 테스트 가이드를 확인하세요.
- 작업 전 `/constitution`을 최신 상태로 유지하고, PR에서 명세/계획/작업 변경을 명시하세요.
- Playwright 조사 결과는 PR 설명이나 연구 로그 링크로 공유해주세요.
- 릴리스 절차는 `docs/release-checklist.md`를 참고하세요.

## 라이선스
MIT License.
