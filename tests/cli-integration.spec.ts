import { describe, expect, it, beforeAll } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST_ENTRY = join(PROJECT_ROOT, "dist", "bin.js");
const SOURCE_ENTRY = join(PROJECT_ROOT, "src", "bin.ts");
const HAS_DIST_BUILD = existsSync(DIST_ENTRY);

const CLI_ENTRY = HAS_DIST_BUILD ? DIST_ENTRY : SOURCE_ENTRY;
const RUNTIME_BIN = HAS_DIST_BUILD ? process.execPath : (process.env.BUN_BIN ?? "bun");

function runCli(args: string[], cwd = PROJECT_ROOT, env: NodeJS.ProcessEnv = process.env) {
  const result = spawnSync(RUNTIME_BIN, [CLI_ENTRY, ...args], {
    cwd,
    encoding: "utf-8",
    env: env,
  });
  if (result.error) {
    throw result.error;
  }
  return result;
}

describe("SpecoDex CLI", () => {
  beforeAll(() => {
    if (!HAS_DIST_BUILD) {
      const version = spawnSync(RUNTIME_BIN, ["--version"], { encoding: "utf-8" });
      if (version.status === 127) {
        throw new Error(
          "bun 바이너리를 찾을 수 없습니다. 테스트를 실행하기 전에 PATH를 확인하세요.",
        );
      }
    }
  });

  it("init --dry-run은 생성 작업을 출력한다", () => {
    const env = { ...process.env, SPECODEX_SKIP_CODEX_INSTALL: "1" };
    const result = runCli(["init", "demo", "--dry-run"], PROJECT_ROOT, env);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[dry-run] 디렉터리 생성: memory");
  });

  it("init --here는 기본 구조를 실제로 생성한다", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "specodex-cli-"));
    const env = { ...process.env, SPECODEX_SKIP_CODEX_INSTALL: "1" };
    const result = runCli(["init", "--here"], tempRoot, env);
    expect(result.status).toBe(0);
    const constitutionPath = join(tempRoot, "memory", "constitution.md");
    expect(existsSync(constitutionPath)).toBe(true);
    rmSync(tempRoot, { recursive: true, force: true });
  });
});
