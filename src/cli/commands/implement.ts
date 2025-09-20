import type { Command } from "../types.js";
import { runImplementation } from "../../core/implementation-runner.js";

export const implementCommand: Command = {
  name: "implement",
  description: "작업 계획 YAML을 읽어 순차 실행합니다.",
  configure(cli) {
    cli
      .option("--tasks <path>", "실행할 작업 파일 경로", "specs/example/tasks.yaml")
      .option("--dry-run", "명령을 실행하지 않고 계획만 출력", false);
  },
  async run(context) {
    const tasksPath =
      (context.options["tasks"] as string | undefined) ?? "specs/example/tasks.yaml";
    const dryRunValue = context.options["dryRun"] ?? context.options["dry-run"];
    const dryRun = Boolean(dryRunValue);

    await runImplementation({
      projectRoot: context.projectRoot,
      tasksPath,
      dryRun,
      logger: context.logger,
    });

    context.logger.info(
      "테스트 및 로그를 확인하고 필요하면 /specify 또는 /plan 단계로 돌아가 수정하세요.",
    );
  },
};
