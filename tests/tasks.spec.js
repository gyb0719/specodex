import { describe, expect, it } from "vitest";
import { tmpdir } from "os";
import { join } from "path";
import { promises as fs } from "fs";
import { updateTasks } from "../src/core/tasks";
async function createTempProject() {
    const dir = await fs.mkdtemp(join(tmpdir(), "specodex-test-"));
    await fs.mkdir(join(dir, "specs", "demo"), { recursive: true });
    return dir;
}
describe("updateTasks", () => {
    it("유효한 작업 그래프를 저장하고 검증한다", async () => {
        const projectRoot = await createTempProject();
        const target = join(projectRoot, "specs", "demo", "tasks.yaml");
        const content = `
- id: TASK-001
  title: 설치
  steps:
    - bun install
- id: TASK-002
  title: 테스트
  depends_on: [TASK-001]
  steps:
    - bun run test
`;
        await updateTasks(projectRoot, target, content);
        const saved = await fs.readFile(target, "utf-8");
        expect(saved).toContain("TASK-002");
    });
    it("검증에 실패하면 예외를 던진다", async () => {
        const projectRoot = await createTempProject();
        const target = join(projectRoot, "specs", "demo", "tasks.yaml");
        const invalid = `
- title: 누락된 ID
  steps:
    - echo fail
`;
        await expect(updateTasks(projectRoot, target, invalid)).rejects.toThrow();
    });
});
//# sourceMappingURL=tasks.spec.js.map