import { promises as fs } from "fs";
import { join } from "path";
import type { Command } from "../types";
import { prepareConstitution, updateConstitution } from "../../core/constitution";

export const constitutionCommand: Command = {
  name: "constitution",
  description: "프로젝트 헌장을 준비하거나 업데이트합니다.",
  configure(cli) {
    cli
      .option("--apply <file>", "Codex가 생성한 헌장 파일 경로를 적용")
      .option("--output <path>", "헌장 파일 저장 위치 (기본: memory/constitution.md)");
  },
  async run(context) {
    const applyPath = context.options["apply"] as string | undefined;
    const customOutput = context.options["output"] as string | undefined;

    const result = await prepareConstitution({ projectRoot: context.projectRoot });
    const targetPath = customOutput ? join(context.projectRoot, customOutput) : result.outputPath;

    if (!applyPath) {
      context.logger.info("Codex에 전달할 프롬프트:");
      context.logger.info(result.prompt);

      if (result.existingContent) {
        context.logger.info("현재 헌장 내용 (변경 전 참고용):");
        context.logger.info(result.existingContent);
      } else {
        context.logger.info("현재 헌장이 존재하지 않습니다. 새로 생성하세요.");
      }

      context.logger.info("Codex 결과가 생성되면 --apply 옵션으로 해당 파일을 적용하세요.");
      return;
    }

    const data = await fs.readFile(applyPath, "utf-8");
    await updateConstitution(targetPath, data);

    context.logger.info(`헌장이 업데이트되었습니다: ${targetPath}`);
    context.logger.info(result.nextMessage);
  },
};
