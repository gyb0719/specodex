# SpecoDex Release Checklist

1. **준비**
   - `bun run lint`
   - `bun x vitest --run --reporter=verbose`
   - `bun run build`
   - `bun x playwright install chromium`
2. `package.json` `version` 필드 업데이트 및 CHANGELOG 작성(필요 시).
3. Git 태그 생성:
   ```bash
   git commit -am "chore: release vX.Y.Z"
   git tag vX.Y.Z
   git push origin main --tags
   ```
4. GitHub Actions `Release` 워크플로가 실행되는지 확인하고, 생성된 `specodex-dist.tar.gz`를 검토합니다.
5. GitHub Release 페이지에서 릴리스 노트 작성: 주요 변경 사항, 명세/계획/작업 업데이트, 연구 필수 안내.
6. README와 `docs/examples`가 최신 상태인지 확인하여 사용자 온보딩을 지원합니다.
