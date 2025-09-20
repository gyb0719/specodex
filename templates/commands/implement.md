---
description: "`specs/<feature>/tasks.yaml`의 작업 그래프를 따라 구현/검증 절차를 실행"
---

1. `/implement <feature-id>` 또는 `/implement` (기본 경로 사용) 형태로 호출합니다.
   - 인자가 없으면 직전 `/tasks`에서 사용한 feature-id와 경로를 확인합니다.
2. 기본 경로는 `specs/<feature-id>/tasks.yaml`입니다. 사용자에게 경로를 확인받고 존재 여부를 검사합니다.
3. 사전 점검: 필요한 도구가 설치되어 있는지 `tasks.yaml`의 `requires`/`notes` 섹션을 확인합니다.
4. `specodex implement --tasks <tasks-path>`를 실행해 작업을 순차/병렬로 수행합니다.
   - 검증만 하고 싶다면 `--dry-run` 플래그를 먼저 사용하도록 안내합니다.
5. 실행 로그를 점검하고 실패한 작업은 원인, 재시도 여부, 되돌아가야 할 단계(`/plan` 또는 `/tasks`)를 명확히 적습니다.
6. 최종 답변에는 수행 결과 요약(성공/실패 작업, 산출물 위치), 추가 테스트/검증 권장 사항, 후속 단계 제안을 포함합니다.
