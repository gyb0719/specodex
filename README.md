# SpecoDex

[CI](https://github.com/ai-code-lab/specodex/actions/workflows/ci.yml/badge.svg)

<p align="center">
  <img src="docs/assets/specodex-buddy.svg" alt="SpecoDex mascot" width="160">
</p>

SpecoDex는 명세 → 계획 → 작업 → 구현 흐름을 자동화하는 CLI입니다. 초보자도 `specodex` 한 번 설치하면, 기능 아이디어를 헌장/명세/계획/작업 파일로 바꾸고, Codex 에이전트가 일관되게 따라갈 수 있도록 도와줍니다.

---

## 🚀 5분 만에 시작하기

1. **필수 도구 설치**
   ```bash
   # Node 18+은 필수, Bun과 Playwright는 선택/권장
   brew install node bun # macOS 예시
   bun x playwright install chromium
   ```
2. **SpecoDex 설치 방법을 고르세요**
   ```bash
   npm install -g specodex     # 전역 설치
   # 또는 한번만 실행하고 싶다면
   npx specodex --help
   # GitHub 최신 버전을 바로 실행하고 싶다면
   npx github:ai-code-lab/specodex init demo-app
   ```
3. **프로젝트 부트스트랩**
   ```bash
   npx github:ai-code-lab/specodex init demo-app
   ```
   위 명령 한 번이면 다음이 자동으로 진행됩니다.
   - `demo-app/` 디렉터리에 템플릿과 샘플 아티팩트 생성
   - Codex 슬래시 명령 템플릿(`/.codex/commands/specodex/`) 동기화
   - 의존성 설치 (`bun install` → 실패 시 `npm install`)

4. **Codex에서 워크플로 계속**
   Codex 세션을 `demo-app` 루트에서 시작하면 곧바로 `/constitution`, `/specify`, `/plan`, `/tasks`, `/implement` 슬래시 명령을 사용할 수 있습니다. 각 명령은 헌장 작성 → 명세 → 계획 → 작업 → 구현까지 순차적으로 안내합니다.

> CLI에서 수동으로 각 단계를 실행하고 싶다면 다음 명령을 순서대로 사용할 수 있습니다.
> ```bash
> specodex constitution
> specodex specify <feature>
> specodex plan <feature>
> specodex tasks <feature>
> specodex implement --tasks specs/<feature>/tasks.yaml
> ```

---

## 🤖 SpecoDex 핵심 흐름

| 단계 | 명령                             | 목적                          | Codex에게 넘길 산출물                       |
| ---- | -------------------------------- | ----------------------------- | ------------------------------------------- |
| 0    | `specodex init`                  | 템플릿과 샘플, 연구 폴더 생성 | `memory/`, `templates/`, `specs/` 기본 구조 |
| 1    | `specodex constitution`          | 팀 헌장 초안/적용             | `memory/constitution.md`                    |
| 2    | `specodex specify <feature>`     | 기능 명세 작성                | `specs/<feature>/spec.md`                   |
| 3    | `specodex plan <feature>`        | 구현 계획 정리                | `specs/<feature>/plan.md`                   |
| 4    | `specodex tasks <feature>`       | 작업 그래프 생성              | `specs/<feature>/tasks.yaml`                |
| 5    | `specodex research <url>`        | 참고 사이트 캡처 + 요약       | `memory/research/<timestamp>.*`             |
| 6    | `specodex implement --tasks ...` | 작업 순서대로 실행            | 터미널 로그 + 작업 상태                     |

> 실행 중 문제가 생기면 산출물을 다시 Codex에 주고 `/specify` 또는 `/plan`을 갱신하세요.

---

## 🧰 설치 옵션 요약

- **전역 설치**: `npm install -g specodex` 또는 `bun install -g specodex`
- **프로젝트 로컬 설치**: `npm install specodex --save-dev`
- **즉시 실행**: `npx specodex --help`
- **GitHub 최신 실행**: `npx github:ai-code-lab/specodex init <project>`

SpecoDex 번들은 순수 ESM이므로 Node 18 이상이면 어디서든 실행됩니다. Bun을 사용하면 `bun specodex ...` 형식으로도 호출할 수 있습니다.

### Codex 슬래시 명령 설치

`specodex init`을 실행하면 Codex CLI용 슬래시 명령 템플릿이 자동으로 `~/.codex/commands/specodex/`에 설치됩니다. 설치를 건너뛰려면 `specodex init ... --skip-codex-install` 또는 환경 변수 `SPECODEX_SKIP_CODEX_INSTALL=1`을 사용하세요.

재설치가 필요할 때는 수동으로 아래 명령을 실행할 수 있습니다.

```bash
specodex install codex            # ~/.codex/commands/specodex/에 템플릿 복사
specodex install codex --dry-run  # 실제 복사 없이 경로만 확인
specodex install codex --force    # 기존 파일을 덮어쓰고 재설치
```

저장소 의존성을 `bun install` 또는 `npm install`로 설치하면 `postinstall` 훅이 자동으로 실행되어 템플릿을 최신 상태로 동기화합니다. 설치 후 Codex 세션을 재시작하면 새로운 슬래시 명령을 바로 사용할 수 있습니다. 자동 동기화를 건너뛰려면 환경 변수 `SPECODEX_SKIP_CODEX_INSTALL=1`을 설정하세요.

---

## 🔍 개발자용 가이드

### 로컬 작업 명령

```bash
bun install              # 의존성 설치
bun run lint             # ESLint + Prettier 체크
bun x vitest run         # 전체 테스트 (watch 비활성)
bun run build            # dist/ ESM 번들 생산
```

### 디렉터리 구조 미리보기

```
src/                    # TypeScript 소스 (CLI + 파이프라인)
dist/                   # tsc 결과물 (npm 패키지 발행용)
templates/              # 명세/계획/작업 템플릿
memory/                 # 헌장과 연구 로그 저장소
specs/                  # 실제 기능별 산출물 예시
scripts/                # Playwright, 부트스트랩 스크립트
```

### Playwright 연구 로그

`specodex research <url>`은 다음 파일을 생성합니다.

- `<timestamp>.md`: 제목/헤딩/링크 요약
- `<timestamp>.json`: 구조화된 메타데이터
- `<timestamp>.png`: 전체 페이지 스크린샷

---

## 🤝 기여하기

1. 이슈 또는 논의에서 아이디어를 공유하세요.
2. `specodex init`으로 샌드박스를 생성한 뒤 변경을 테스트합니다.
3. 변경 전에 `bun x vitest run`으로 회귀 테스트를 돌립니다.
4. PR에는 목적, 영향받는 경로, 테스트 로그(`bun x vitest run`)를 포함하고 필요한 경우 연구 로그를 첨부하세요.

스타와 피드백은 SpecoDex를 더 나은 명세 도구로 만드는 데 큰 힘이 됩니다!

---

## 📄 라이선스

MIT © SpecoDex Contributors
