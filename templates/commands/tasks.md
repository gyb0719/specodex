---
description: "구현 계획을 실행 가능한 작업 그래프로 변환하고 `specs/<feature>/tasks.yaml`로 저장"
---

1. `/tasks <feature-id>` 형태로 호출합니다. 인자가 없으면 사용자와 상의해 확정합니다.
2. `specodex tasks <feature-id>`를 실행해 생성 대상 경로, 계획 파일(`specs/<feature-id>/plan.md`), 템플릿을 확인합니다.
   - 계획 문서가 없다면 `/plan`으로 돌아가 작성하도록 안내합니다.
3. 계획의 단계와 의존성을 기반으로 작업을 분해합니다.
   - 각 작업에 고유 ID, 의존성, 성공 기준, 산출물 요약을 포함합니다.
   - 병렬 가능 여부와 위험 요소가 있으면 메모를 남깁니다.
4. 결과를 `specs/<feature-id>/tasks.yaml`에 저장합니다.
5. `specodex tasks <feature-id> --apply specs/<feature-id>/tasks.yaml`를 실행해 YAML 구문 검사를 통과하고 `/implement` 안내를 확인합니다.
6. 응답에는 주요 작업 흐름, 블로킹 이슈, 건너뛴 작업(있다면)과 이유를 요약합니다.
