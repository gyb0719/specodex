# Meeting Room Demo

SpecoDex CLI를 사용해 생성한 샘플 산출물입니다. 회의실 예약 MVP를 가정한 `001-demo` 기능에 대한 명세/계획/작업/YAML과 Playwright 연구 로그를 포함합니다.

## 포함된 파일
- `spec.md` – `/specify 001-demo` 결과로 생성된 기능 명세
- `plan.md` – `/plan 001-demo` 결과로 생성된 구현 계획
- `tasks.yaml` – `/tasks 001-demo` 결과로 생성된 작업 그래프
- `research.md` – `/research https://example.com` 결과로 생성된 Playwright 로그
- `research.json` – Playwright에서 추출한 헤딩/링크 메타데이터
- `research.png` – 조사 대상 페이지 스크린샷

## 재현 방법
```bash
./src/bin.ts init demo-e2e
cd demo-e2e
../src/bin.ts constitution --apply <헌장>
../src/bin.ts specify 001-demo --apply spec.md
../src/bin.ts plan 001-demo --apply plan.md
../src/bin.ts tasks 001-demo --apply tasks.yaml
../src/bin.ts implement --tasks specs/001-demo/tasks.yaml
../src/bin.ts research https://example.com
```

이 예시는 Codex 세션에서 SpecoDex 워크플로가 어떻게 작동하는지 문서화할 때 참고 자료로 활용할 수 있습니다.
