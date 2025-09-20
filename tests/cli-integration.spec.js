import { describe, expect, it, beforeAll } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI_ENTRY = join(PROJECT_ROOT, "src", "bin.ts");
const BUN_BIN = process.env.BUN_BIN ?? "bun";
function runCli(args, cwd = PROJECT_ROOT) {
    const result = spawnSync(BUN_BIN, [CLI_ENTRY, ...args], {
        cwd,
        encoding: "utf-8",
    });
    if (result.error) {
        throw result.error;
    }
    return result;
}
describe("SpecoDex CLI", () => {
    beforeAll(() => {
        const version = spawnSync(BUN_BIN, ["--version"], { encoding: "utf-8" });
        if (version.status === 127) {
            throw new Error("bun 바이너리를 찾을 수 없습니다. 테스트를 실행하기 전에 PATH를 확인하세요.");
        }
    });
    it("init --dry-run은 생성 작업을 출력한다", () => {
        const result = runCli(["init", "demo", "--dry-run"]);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain("[dry-run] 디렉터리 생성: memory");
    });
    it("init --here는 기본 구조를 실제로 생성한다", () => {
        const tempRoot = mkdtempSync(join(tmpdir(), "specodex-cli-"));
        const result = runCli(["init", "--here"], tempRoot);
        expect(result.status).toBe(0);
        const constitutionPath = join(tempRoot, "memory", "constitution.md");
        expect(existsSync(constitutionPath)).toBe(true);
        rmSync(tempRoot, { recursive: true, force: true });
    });
});
//# sourceMappingURL=cli-integration.spec.js.map