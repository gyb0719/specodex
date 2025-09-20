---
description: "명세를 바탕으로 기술 구현 계획을 수립하고 `specs/<feature>/plan.md`에 반영"
---

1. `/plan <feature-id>` 형태로 호출합니다. 인자가 없으면 현재 대화 맥락에서 feature-id를 파악해 확인합니다.
2. `specodex plan <feature-id>`를 실행해 계획 템플릿, 참조할 `specs/<feature-id>/spec.md`, 기존 계획 파일을 확인합니다.
   - 명세가 없다면 `/specify`로 돌아가도록 사용자에게 안내하고 절차를 중단합니다.
3. 헌장과 명세를 근거로 구현 전략, 데이터 모델, 검증 전략을 정리합니다. 템플릿(`templates/plan/implementation-plan-template.md`)의 섹션을 유지하고 근거를 명시합니다.
4. 결과를 `specs/<feature-id>/plan.md`에 저장합니다.
5. `specodex plan <feature-id> --apply specs/<feature-id>/plan.md`를 실행해 CLI 후속 안내(`/tasks`)를 출력합니다.
6. 최종 응답에는 아키텍처 개요, 주요 의사결정, 추적해야 할 리스크 또는 전제 조건을 포함합니다.
