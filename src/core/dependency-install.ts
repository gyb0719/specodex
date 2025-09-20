import { spawn, spawnSync } from "child_process";
import { join } from "path";
import { existsSync } from "fs";
import type { Logger } from "../cli/types.js";

interface DependencyInstallOptions {
  projectRoot: string;
  dryRun: boolean;
  skip: boolean;
  logger: Logger;
}

type PackageManager = {
  command: string;
  args: string[];
  cwd: string;
  display: string;
};

const SKIP_ENV = "SPECODEX_SKIP_AUTO_INSTALL";

export async function installProjectDependencies(options: DependencyInstallOptions): Promise<void> {
  const { projectRoot, dryRun, skip, logger } = options;

  if (dryRun) {
    logger.info(`[dry-run] 의존성을 설치할 위치: ${projectRoot}`);
    return;
  }

  if (skip || shouldSkipViaEnv()) {
    logger.info(
      "의존성 자동 설치를 건너뜁니다. 필요하면 프로젝트 디렉터리에서 'bun install' 또는 'npm install'을 실행하세요.",
    );
    return;
  }

  const manager = detectPackageManager(projectRoot);
  if (!manager) {
    logger.warn(
      "사용 가능한 패키지 매니저를 찾을 수 없습니다. 'bun install' 또는 'npm install'을 수동으로 실행하세요.",
    );
    return;
  }

  logger.info(`패키지 설치를 실행합니다: ${manager.display}`);

  await runCommand(manager, logger);
}

function shouldSkipViaEnv(): boolean {
  const value = process.env[SKIP_ENV];
  if (!value) {
    return false;
  }
  return value === "1" || value.toLowerCase() === "true";
}

function detectPackageManager(projectRoot: string): PackageManager | null {
  if (commandExists("bun")) {
    return {
      command: "bun",
      args: ["install"],
      cwd: projectRoot,
      display: "bun install",
    };
  }

  if (existsSync(join(projectRoot, "package-lock.json")) || commandExists("npm")) {
    return {
      command: "npm",
      args: ["install"],
      cwd: projectRoot,
      display: "npm install",
    };
  }

  return null;
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ["--version"], {
    stdio: "ignore",
  });
  return result.status === 0;
}

function runCommand(manager: PackageManager, logger: Logger): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(manager.command, manager.args, {
      cwd: manager.cwd,
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", (error) => {
      logger.error(`의존성 설치 명령 실행에 실패했습니다: ${error.message}`);
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        const message = `${manager.display} 명령이 종료 코드 ${code}로 실패했습니다.`;
        logger.error(message);
        reject(new Error(message));
      }
    });
  });
}
export const dependencyInstallInternals = {
  detectPackageManager,
  commandExists,
};
