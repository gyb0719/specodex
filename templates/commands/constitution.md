---
description: "Codex에서 프로젝트 헌장을 생성하거나 개정할 때 따르는 표준 절차"
---

1. `specodex constitution` 명령을 실행해 Codex에 전달할 프롬프트와 현재 `memory/constitution.md` 내용을 확인합니다.
2. 출력된 프롬프트와 템플릿 규칙(`templates/constitution/constitution-prompt.md`)을 기준으로 헌장을 작성합니다.
   - 기존 항목을 유지하면 `[KEEP]`, 수정하면 `[UPDATE]` 태그를 유지합니다.
   - 누락된 정보는 `[CLARIFY: 항목]` 형태로 표시하고 후속 질문을 남깁니다.
3. 새로운 헌장을 `memory/constitution.md`에 작성하거나 덮어씁니다. (필요 시 `cat <<'EOF' > memory/constitution.md` 방식 사용)
4. 변경분을 검토한 뒤 `specodex constitution --apply memory/constitution.md`를 실행해 저장을 확인하고 다음 안내 메시지를 기록합니다.
5. 최종 답변에는 버전 변동, 핵심 원칙 변경사항, 후속 TODO를 요약합니다.
