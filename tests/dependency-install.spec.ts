import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { join } from "path";
import { mkdtempSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { EventEmitter } from "events";
import type { Logger } from "../src/cli/types";

vi.mock("child_process", () => {
  return {
    spawn: vi.fn(),
    spawnSync: vi.fn(),
  };
});

import * as childProcess from "child_process";
import {
  dependencyInstallInternals,
  installProjectDependencies,
} from "../src/core/dependency-install";

const spawnMock = childProcess.spawn as unknown as vi.Mock;
const spawnSyncMock = childProcess.spawnSync as unknown as vi.Mock;

function createLogger(): Logger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("installProjectDependencies", () => {
  const originalEnv = process.env.SPECODEX_SKIP_AUTO_INSTALL;

  beforeEach(() => {
    process.env.SPECODEX_SKIP_AUTO_INSTALL = undefined;
    spawnMock.mockReset();
    spawnSyncMock.mockReset();
  });

  afterEach(() => {
    process.env.SPECODEX_SKIP_AUTO_INSTALL = originalEnv;
  });

  it("skips when dryRun is true", async () => {
    const logger = createLogger();
    await installProjectDependencies({
      projectRoot: ".",
      dryRun: true,
      skip: false,
      logger,
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("skips when skip flag is true", async () => {
    const logger = createLogger();
    await installProjectDependencies({
      projectRoot: ".",
      dryRun: false,
      skip: true,
      logger,
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("skips when environment variable is set", async () => {
    process.env.SPECODEX_SKIP_AUTO_INSTALL = "1";
    const logger = createLogger();
    await installProjectDependencies({
      projectRoot: ".",
      dryRun: false,
      skip: false,
      logger,
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("uses bun when available", async () => {
    const logger = createLogger();
    const temp = mkdtempSync(join(tmpdir(), "specodex-deps-"));

    spawnSyncMock.mockReturnValueOnce({ status: 0 } as childProcess.SpawnSyncReturns<number>);
    spawnMock.mockImplementationOnce(() => {
      const emitter = new EventEmitter();
      queueMicrotask(() => {
        emitter.emit("exit", 0);
      });
      return emitter as unknown as childProcess.ChildProcess;
    });

    await installProjectDependencies({
      projectRoot: temp,
      dryRun: false,
      skip: false,
      logger,
    });

    expect(spawnMock).toHaveBeenCalledWith("bun", ["install"], expect.anything());
  });

  it("falls back to npm", async () => {
    const logger = createLogger();
    const temp = mkdtempSync(join(tmpdir(), "specodex-deps-npm-"));
    mkdirSync(temp, { recursive: true });

    spawnSyncMock
      .mockReturnValueOnce({ status: 1 } as childProcess.SpawnSyncReturns<number>)
      .mockReturnValueOnce({ status: 0 } as childProcess.SpawnSyncReturns<number>);
    spawnMock.mockImplementationOnce(() => {
      const emitter = new EventEmitter();
      queueMicrotask(() => {
        emitter.emit("exit", 0);
      });
      return emitter as unknown as childProcess.ChildProcess;
    });

    await installProjectDependencies({
      projectRoot: temp,
      dryRun: false,
      skip: false,
      logger,
    });

    expect(spawnMock).toHaveBeenCalledWith("npm", ["install"], expect.anything());
  });
});

describe("dependencyInstallInternals.detectPackageManager", () => {
  it("prefers bun when available", () => {
    const detect = dependencyInstallInternals.detectPackageManager;
    spawnSyncMock.mockReturnValueOnce({ status: 0 });
    const mock = vi.spyOn(dependencyInstallInternals, "commandExists").mockReturnValueOnce(true);
    const result = detect("/tmp/foo");
    expect(result?.command).toBe("bun");
    mock.mockRestore();
  });
});
