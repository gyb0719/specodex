# 작업 분해

## 작업 지도
- [ ] 작업 식별자는 `TASK-###` 형식을 사용합니다.
- [ ] 선행 작업은 `depends_on` 키로 연결합니다.

## 예시
```yaml
- id: TASK-001
  title: CLI 진입점 초기화
  depends_on: []
  steps:
    - bun install
    - bun run lint
- id: TASK-002
  title: 명세 파서 구현
  depends_on: [TASK-001]
  steps:
    - 작성한 템플릿을 로딩
    - Vitest로 파서 단위 테스트 실행
```

## 완료 조건
- 모든 작업에 예상 산출물과 검증 방법을 명시합니다.
- 병렬 실행 가능 여부를 `parallel: true`로 표시합니다.
