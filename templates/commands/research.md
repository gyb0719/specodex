---
description: "Playwright MCP를 통해 참고 자료를 조사하고 `memory/research/`에 로그를 남김"
---

1. `/research <url>` 형태로 호출합니다. URL이 없으면 사용자에게 조사 대상 링크 또는 검색 키워드를 요청합니다.
2. `specodex research <url>`을 실행해 Playwright MCP 세션을 트리거합니다.
   - 최초 실행 전에는 `scripts/bootstrap.sh`를 안내해 환경 변수를 설정했는지 확인합니다.
3. 실행이 끝나면 `memory/research/`에 생성된 `.md`, `.json`, `.png` 파일을 확인합니다.
4. 명세/계획에 반영해야 할 근거, 인사이트, TODO를 요약해 공유합니다.
5. 필요한 경우 `/specify` 또는 `/plan` 명령을 다시 실행해 조사 결과를 반영하도록 사용자에게 안내합니다.
