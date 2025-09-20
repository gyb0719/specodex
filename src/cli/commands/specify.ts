import { join } from "path";
import type { Command } from "../types.js";
import { prepareSpecification, updateSpecification } from "../../core/specification.js";

export const specifyCommand: Command = {
  name: "specify",
  description: "기능 명세를 생성하거나 업데이트합니다.",
  configure(cli) {
    cli
      .argument("<feature-id>", "기능 식별자 (예: 001-create-taskify)")
      .option("--apply <file>", "Codex가 생성한 명세 파일을 적용")
      .option("--output <path>", "명세 파일 저장 위치 (기본: specs/<feature>/spec.md)");
  },
  async run(context) {
    const featureId = context.args[0] as string;
    const applyPath = context.options["apply"] as string | undefined;
    const customOutput = context.options["output"] as string | undefined;

    const result = await prepareSpecification({
      projectRoot: context.projectRoot,
      featureId,
    });

    const targetPath = customOutput ? join(context.projectRoot, customOutput) : result.outputPath;

    if (!applyPath) {
      context.logger.info(`생성 대상 파일: ${result.targetRelativePath}`);
      context.logger.info("Codex에 전달할 프롬프트:");
      context.logger.info(result.prompt);
      context.logger.info("위 템플릿 구조를 준수해 명세를 작성하세요.");

      if (result.existingContent) {
        context.logger.info("현재 명세 내용 (참고용):");
        context.logger.info(result.existingContent);
      }

      context.logger.info("Codex 출력이 준비되면 --apply 옵션으로 반영하세요.");
      return;
    }

    const data = await readExternalFile(applyPath);
    await updateSpecification(targetPath, data);

    context.logger.info(`명세가 업데이트되었습니다: ${targetPath}`);
    context.logger.info(result.nextMessage);
  },
};

async function readExternalFile(path: string): Promise<string> {
  const fs = await import("fs/promises");
  return fs.readFile(path, "utf-8");
}
