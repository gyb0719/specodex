import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initCommand } from "../src/cli/commands/init";
import * as codexInstall from "../src/core/codex-install";
import type { Logger } from "../src/cli/types";
import { rm } from "fs/promises";

const installSpy = vi.spyOn(codexInstall, "installCodexCommands");

function createLogger(): Logger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("initCommand Codex 설치", () => {
  beforeEach(() => {
    installSpy.mockClear();
  });

  afterEach(async () => {
    delete process.env.SPECODEX_SKIP_CODEX_INSTALL;
  });

  it("기본적으로 Codex 명령 설치를 실행한다", async () => {
    installSpy.mockResolvedValueOnce();
    const projectRoot = mkdtempSync(join(tmpdir(), "specodex-init-"));
    const logger = createLogger();

    await initCommand.run({
      projectRoot,
      args: ["demo"],
      options: {},
      logger,
    });

    expect(installSpy).toHaveBeenCalledWith({ dryRun: false, force: false, logger });
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("환경 변수로 설치를 건너뛸 수 있다", async () => {
    installSpy.mockResolvedValueOnce();
    process.env.SPECODEX_SKIP_CODEX_INSTALL = "1";
    const projectRoot = mkdtempSync(join(tmpdir(), "specodex-init-skip-"));
    const logger = createLogger();

    await initCommand.run({
      projectRoot,
      args: ["demo"],
      options: {},
      logger,
    });

    expect(installSpy).not.toHaveBeenCalled();
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("--skip-codex-install 옵션이 있으면 설치하지 않는다", async () => {
    installSpy.mockResolvedValueOnce();
    const projectRoot = mkdtempSync(join(tmpdir(), "specodex-init-option-"));
    const logger = createLogger();

    await initCommand.run({
      projectRoot,
      args: ["demo"],
      options: { skipCodexInstall: true },
      logger,
    });

    expect(installSpy).not.toHaveBeenCalled();
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("--dry-run일 때는 dryRun 플래그로 호출한다", async () => {
    installSpy.mockResolvedValueOnce();
    const projectRoot = mkdtempSync(join(tmpdir(), "specodex-init-dry-"));
    const logger = createLogger();

    await initCommand.run({
      projectRoot,
      args: ["demo"],
      options: { dryRun: true },
      logger,
    });

    expect(installSpy).toHaveBeenCalledWith({ dryRun: true, force: false, logger });
    await rm(projectRoot, { recursive: true, force: true });
  });
});
