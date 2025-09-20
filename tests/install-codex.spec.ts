import { mkdtempSync } from "fs";
import { promises as fs } from "fs";
import os from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installCodexCommands } from "../src/core/codex-install";
import { packagePath } from "../src/core/paths";

const logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

async function listTemplateFiles(): Promise<string[]> {
  const sourceDir = packagePath("templates/commands");
  const entries = await fs.readdir(sourceDir);
  return entries.filter((name) => name.endsWith(".md")).sort();
}

describe("installCodexCommands", () => {
  let tempHome: string;

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.values(logger).forEach((fn) => fn.mockClear());
    tempHome = mkdtempSync(join(os.tmpdir(), "specodex-home-"));
    vi.spyOn(os, "homedir").mockReturnValue(tempHome);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (tempHome) {
      await fs.rm(tempHome, { recursive: true, force: true });
    }
  });

  it("copies command templates into the Codex directory", async () => {
    await installCodexCommands({ dryRun: false, force: true, logger });

    const expectedFiles = await listTemplateFiles();
    const destDir = join(tempHome, ".codex", "commands", "specodex");
    const actualFiles = await fs.readdir(destDir);

    expect(actualFiles.sort()).toEqual(expectedFiles);
  });

  it("skips existing files unless force is provided", async () => {
    await installCodexCommands({ dryRun: false, force: true, logger });

    const destDir = join(tempHome, ".codex", "commands", "specodex");
    const targetFile = join(destDir, "specify.md");
    await fs.writeFile(targetFile, "overridden");

    await installCodexCommands({ dryRun: false, force: false, logger });
    const contentAfterSkip = await fs.readFile(targetFile, "utf-8");
    expect(contentAfterSkip).toBe("overridden");

    await installCodexCommands({ dryRun: false, force: true, logger });
    const templatePath = join(packagePath("templates/commands"), "specify.md");
    const expectedContent = await fs.readFile(templatePath, "utf-8");
    const contentAfterForce = await fs.readFile(targetFile, "utf-8");
    expect(contentAfterForce).toBe(expectedContent);
  });

  it("performs a dry run without writing files", async () => {
    await installCodexCommands({ dryRun: true, force: false, logger });

    const destDir = join(tempHome, ".codex", "commands", "specodex");
    const exists = await fs
      .stat(destDir)
      .then(() => true)
      .catch((error: NodeJS.ErrnoException) =>
        error.code === "ENOENT" ? false : Promise.reject(error),
      );

    expect(exists).toBe(false);
  });
});
