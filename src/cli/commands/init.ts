import { promises as fs } from "fs";
import { resolve } from "path";
import type { Command, Logger } from "../types.js";
import { scaffoldWorkspace } from "../../core/init.js";
import { installCodexCommands } from "../../core/codex-install.js";

export const initCommand: Command = {
  name: "init",
  description: "SpecoDex 워크스페이스를 초기화합니다.",
  configure(cli) {
    cli
      .argument("[project-name]", "생성할 프로젝트 디렉터리 이름")
      .option("--here", "현재 디렉터리에 초기화")
      .option("--dry-run", "파일을 생성하지 않고 예상 작업만 출력", false)
      .option("--force", "대상 디렉터리가 비어 있지 않아도 강제로 진행", false)
      .option("--skip-codex-install", "Codex 슬래시 명령 자동 설치를 건너뜁니다.", false);
  },
  async run(context) {
    const here = Boolean(context.options["here"]);
    const dryRunValue = context.options["dryRun"] ?? context.options["dry-run"];
    const dryRun = Boolean(dryRunValue);
    const force = Boolean(context.options["force"]);
    const skipCodexInstallOption = Boolean(
      context.options["skipCodexInstall"] ?? context.options["skip-codex-install"],
    );
    const skipCodexInstallEnv =
      process.env.SPECODEX_SKIP_CODEX_INSTALL === "1" ||
      process.env.SPECODEX_SKIP_CODEX_INSTALL?.toLowerCase() === "true";
    const skipCodexInstall = skipCodexInstallOption || skipCodexInstallEnv;
    const projectName = context.args[0] as string | undefined;

    if (here && projectName) {
      context.logger.warn(
        "--here 옵션과 프로젝트 이름은 동시에 사용할 수 없습니다. 이름을 무시합니다.",
      );
    }

    if (!here && !projectName) {
      throw new Error("프로젝트 이름을 지정하거나 --here 옵션을 사용하세요.");
    }

    const targetRoot = here
      ? context.projectRoot
      : resolve(context.projectRoot, projectName as string);

    await ensureTargetDirectory(targetRoot, { dryRun, force, logger: context.logger });
    await scaffoldWorkspace({ targetRoot, dryRun, logger: context.logger });

    context.logger.info("초기화가 완료되었습니다.");
    context.logger.info("다음 단계: Codex에서 /constitution을 실행해 헌장을 로드하세요.");
    if (!dryRun) {
      context.logger.info(
        "workspace에서 'bun install' 후 'bun run install:browsers'를 실행하는 것을 잊지 마세요.",
      );
    }

    await installCodex({ dryRun, skip: skipCodexInstall, logger: context.logger });
  },
};

async function installCodex(options: {
  dryRun: boolean;
  skip: boolean;
  logger: Logger;
}): Promise<void> {
  const { dryRun, skip, logger } = options;

  if (skip) {
    logger.info(
      "Codex 슬래시 명령 자동 설치를 건너뜁니다. 필요하면 'specodex install codex'를 실행하세요.",
    );
    return;
  }

  try {
    await installCodexCommands({ dryRun, force: false, logger });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Codex 슬래시 명령 설치에 실패했습니다: ${message}`);
    logger.info("필요하면 'specodex install codex --force' 명령으로 재시도하세요.");
  }
}

async function ensureTargetDirectory(
  targetRoot: string,
  options: { dryRun: boolean; force: boolean; logger: Logger },
): Promise<void> {
  const { dryRun, force, logger } = options;

  if (dryRun) {
    logger.info(`[dry-run] 대상 디렉터리 확인: ${targetRoot}`);
    return;
  }

  try {
    const stat = await fs.stat(targetRoot);
    if (!stat.isDirectory()) {
      throw new Error(`${targetRoot} 경로는 디렉터리가 아닙니다.`);
    }

    const entries = await fs.readdir(targetRoot);
    if (entries.length > 0 && !force) {
      throw new Error(`${targetRoot} 디렉터리가 비어 있지 않습니다. --force 옵션을 사용하세요.`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(targetRoot, { recursive: true });
      return;
    }
    throw error;
  }
}
