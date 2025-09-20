import { join } from "path";
import type { Command } from "../types.js";
import { preparePlan, updatePlan } from "../../core/plan.js";

export const planCommand: Command = {
  name: "plan",
  description: "기술 구현 계획을 생성하거나 업데이트합니다.",
  configure(cli) {
    cli
      .argument("<feature-id>", "기능 식별자 (예: 001-create-taskify)")
      .option("--apply <file>", "Codex가 생성한 계획 파일을 적용")
      .option("--output <path>", "계획 파일 저장 위치 (기본: specs/<feature>/plan.md)");
  },
  async run(context) {
    const featureId = context.args[0] as string;
    const applyPath = context.options["apply"] as string | undefined;
    const customOutput = context.options["output"] as string | undefined;

    const result = await preparePlan({ projectRoot: context.projectRoot, featureId });
    const targetPath = customOutput ? join(context.projectRoot, customOutput) : result.outputPath;

    if (!result.specExists) {
      context.logger.warn(
        `명세 파일이 존재하지 않습니다: ${result.specRelativePath}. /specify로 명세를 먼저 생성하세요.`,
      );
    }

    if (!applyPath) {
      context.logger.info(`생성 대상 파일: ${result.targetRelativePath}`);
      context.logger.info("Codex에 전달할 프롬프트:");
      context.logger.info(result.prompt);

      if (result.existingContent) {
        context.logger.info("현재 계획 내용 (참고용):");
        context.logger.info(result.existingContent);
      }

      context.logger.info("Codex 출력이 준비되면 --apply 옵션으로 반영하세요.");
      return;
    }

    const data = await readExternalFile(applyPath);
    await updatePlan(targetPath, data);

    context.logger.info(`계획이 업데이트되었습니다: ${targetPath}`);
    context.logger.info(result.nextMessage);
  },
};

async function readExternalFile(path: string): Promise<string> {
  const fs = await import("fs/promises");
  return fs.readFile(path, "utf-8");
}
