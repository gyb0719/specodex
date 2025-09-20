---
description: "기능 명세를 수집하고 `specs/<feature>/spec.md`에 기록하는 Codex slash 명령"
---

1. 이 명령은 `/specify <feature-id>` 형태로 사용합니다. 인자가 없으면 사용자의 설명을 바탕으로 케밥 케이스 feature-id를 정하고 먼저 확인을 받습니다.
2. `specodex specify <feature-id>`를 실행해 제공된 프롬프트, 템플릿 미리보기, 기존 명세(있다면)를 확인합니다.
3. 템플릿 구조(`templates/spec/feature-spec-template.md`)를 그대로 따르며 최신 헌장(`memory/constitution.md`)과 사용자가 전달한 요구를 반영해 명세 초안을 작성합니다.
   - 불명확한 요구는 `[CLARIFY: ...]` 표기 후 질문을 포함합니다.
   - 의존하는 외부 시스템/데이터는 명시하고, 범위를 벗어나는 항목은 "Out of Scope"에 기록합니다.
4. 결과를 `specs/<feature-id>/spec.md`로 저장합니다. 필요 시 디렉터리를 생성하세요.
5. `specodex specify <feature-id> --apply specs/<feature-id>/spec.md`를 실행해 CLI 후속 안내(`/plan`)를 확인합니다.
6. 최종 응답에는 명세 요약, 핵심 요구사항 목록, 추가 질문/후속 작업을 포함합니다.
