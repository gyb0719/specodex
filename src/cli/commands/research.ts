import { join } from "path";
import type { Command } from "../types.js";
import { runPlaywrightResearch } from "../../research/index.js";

export const researchCommand: Command = {
  name: "research",
  description: "Playwright MCP를 사용해 참고 자료를 수집합니다.",
  configure(cli) {
    cli
      .argument("<url>", "조사할 대상 URL")
      .option("--output <path>", "연구 로그 파일 경로 (기본: memory/research/<timestamp>.md)");
  },
  async run(context) {
    const targetUrl = context.args[0] as string;
    if (!targetUrl) {
      throw new Error("조사할 URL을 입력하세요.");
    }

    const outputOption = context.options["output"] as string | undefined;
    const outputPath = outputOption ? join(context.projectRoot, outputOption) : undefined;

    const options = {
      projectRoot: context.projectRoot,
      url: targetUrl,
      logger: context.logger,
    } as const;

    const storedPath = await runPlaywrightResearch(
      outputPath
        ? {
            ...options,
            outputPath,
          }
        : options,
    );

    context.logger.info(`연구 로그 경로: ${storedPath}`);
    context.logger.info(
      "수집한 정보를 명세/계획에 반영하고 필요하면 /specify 또는 /plan을 재실행하세요.",
    );
  },
};
