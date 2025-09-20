import { promises as fs } from "fs";
import { resolve } from "path";
import type { Command, Logger } from "../types";
import { scaffoldWorkspace } from "../../core/init";

export const initCommand: Command = {
  name: "init",
  description: "SpecoDex 워크스페이스를 초기화합니다.",
  configure(cli) {
    cli
      .argument("[project-name]", "생성할 프로젝트 디렉터리 이름")
      .option("--here", "현재 디렉터리에 초기화")
      .option("--dry-run", "파일을 생성하지 않고 예상 작업만 출력", false)
      .option("--force", "대상 디렉터리가 비어 있지 않아도 강제로 진행", false);
  },
  async run(context) {
    const here = Boolean(context.options["here"]);
    const dryRunValue = context.options["dryRun"] ?? context.options["dry-run"];
    const dryRun = Boolean(dryRunValue);
    const force = Boolean(context.options["force"]);
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
  },
};

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
