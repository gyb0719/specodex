import { promises as fs } from "fs";
import os from "os";
import { dirname, join, relative } from "path";
import type { Logger } from "../cli/types.js";
import { packagePath } from "./paths.js";

interface InstallOptions {
  dryRun: boolean;
  force: boolean;
  logger: Logger;
  quiet?: boolean;
}

const TEMPLATE_DIR = "templates/commands";

export async function installCodexCommands(options: InstallOptions): Promise<void> {
  const { dryRun, force, logger, quiet = false } = options;
  const homeDir = os.homedir();

  if (!homeDir) {
    throw new Error("홈 디렉터리를 확인할 수 없습니다.");
  }

  const codexRoot = join(homeDir, ".codex");
  const commandsRoot = join(codexRoot, "commands", "specodex");
  const sourceDir = packagePath(TEMPLATE_DIR);

  if (dryRun) {
    if (!quiet) {
      logger.info(`[dry-run] Codex 명령 설치 경로: ${commandsRoot}`);
    }
  } else {
    await fs.mkdir(commandsRoot, { recursive: true });
    if (!quiet) {
      logger.info(`설치 경로: ${commandsRoot}`);
    }
  }

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const templateFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".md"));

  if (templateFiles.length === 0) {
    logger.warn("설치할 명령 템플릿이 없습니다.");
    return;
  }

  for (const file of templateFiles) {
    const sourcePath = join(sourceDir, file);
    const destPath = join(commandsRoot, file);
    const displayName = relative(commandsRoot, destPath) || file;

    if (dryRun) {
      if (!quiet) {
        logger.info(`[dry-run] ${displayName} ← ${relative(process.cwd(), sourcePath)}`);
        if (!force && (await exists(destPath))) {
          logger.warn(
            `[dry-run] ${displayName}가 이미 존재합니다. --force 없이 실행 시 건너뜁니다.`,
          );
        }
      }
      continue;
    }

    const alreadyExists = await exists(destPath);
    if (alreadyExists && !force) {
      if (!quiet) {
        logger.warn(`${displayName}가 이미 있어 건너뜁니다. 덮어쓰려면 --force 옵션을 사용하세요.`);
      }
      continue;
    }

    const data = await fs.readFile(sourcePath);
    await fs.mkdir(dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, data);

    if (!quiet) {
      logger.info(
        alreadyExists ? `${displayName}를 덮어썼습니다.` : `${displayName}을(를) 설치했습니다.`,
      );
    }
  }

  if (!dryRun && !quiet) {
    logger.info("Codex를 재시작하면 /constitution, /specify 등 명령이 나타납니다.");
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function ensureCodexCommandsInstalled(options: {
  logger: Logger;
  quiet?: boolean;
}): Promise<void> {
  const { logger, quiet = false } = options;
  const homeDir = os.homedir();

  if (!homeDir) {
    if (!quiet) {
      logger.warn("홈 디렉터리를 확인할 수 없어 Codex 명령 설치를 건너뜁니다.");
    }
    return;
  }

  const commandsRoot = join(homeDir, ".codex", "commands", "specodex");
  const sourceDir = packagePath(TEMPLATE_DIR);

  let needsInstall = false;

  try {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        continue;
      }
      const sourcePath = join(sourceDir, entry.name);
      const destPath = join(commandsRoot, entry.name);
      const sourceData = await fs.readFile(sourcePath, "utf-8");
      let destData: string | null = null;
      try {
        destData = await fs.readFile(destPath, "utf-8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }

      if (destData === null || destData !== sourceData) {
        needsInstall = true;
        break;
      }
    }
  } catch (error) {
    if (!quiet) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Codex 명령 상태 확인 중 오류가 발생했습니다: ${message}`);
    }
    return;
  }

  if (!needsInstall) {
    return;
  }

  try {
    await installCodexCommands({ dryRun: false, force: true, logger, quiet });
  } catch (error) {
    if (!quiet) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Codex 명령 자동 설치에 실패했습니다: ${message}`);
    }
  }
}
