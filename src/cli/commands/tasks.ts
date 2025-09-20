import { join } from "path";
import type { Command } from "../types.js";
import { prepareTasks, updateTasks } from "../../core/tasks.js";

export const tasksCommand: Command = {
  name: "tasks",
  description: "구현 계획을 실행 가능한 작업 그래프로 변환합니다.",
  configure(cli) {
    cli
      .argument("<feature-id>", "기능 식별자 (예: 001-create-taskify)")
      .option("--apply <file>", "Codex가 생성한 작업 파일을 적용")
      .option("--output <path>", "작업 파일 저장 위치 (기본: specs/<feature>/tasks.yaml)");
  },
  async run(context) {
    const featureId = context.args[0] as string;
    const applyPath = context.options["apply"] as string | undefined;
    const customOutput = context.options["output"] as string | undefined;

    const result = await prepareTasks({ projectRoot: context.projectRoot, featureId });
    const targetPath = customOutput ? join(context.projectRoot, customOutput) : result.outputPath;

    if (!result.planExists) {
      context.logger.warn(
        `계획 파일이 존재하지 않습니다: ${result.planRelativePath}. /plan으로 계획을 먼저 생성하세요.`,
      );
    }

    if (!applyPath) {
      context.logger.info(`생성 대상 파일: ${result.targetRelativePath}`);
      context.logger.info("Codex에 전달할 프롬프트:");
      context.logger.info(result.prompt);

      if (result.existingContent) {
        context.logger.info("현재 작업 그래프 (참고용):");
        context.logger.info(result.existingContent);
      }

      context.logger.info("Codex 출력이 준비되면 --apply 옵션으로 반영하세요.");
      return;
    }

    const data = await readExternalFile(applyPath);
    await updateTasks(context.projectRoot, targetPath, data);

    context.logger.info(`작업 그래프가 업데이트되었습니다: ${targetPath}`);
    context.logger.info(result.nextMessage);
  },
};

async function readExternalFile(path: string): Promise<string> {
  const fs = await import("fs/promises");
  return fs.readFile(path, "utf-8");
}
