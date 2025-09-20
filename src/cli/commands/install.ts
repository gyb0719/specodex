import type { Command } from "../types.js";
import { installCodexCommands } from "../../core/codex-install.js";

export const installCommand: Command = {
  name: "install",
  description: "Codex 등 에이전트 환경에 SpecoDex 슬래시 명령을 설치합니다.",
  configure(cli) {
    cli
      .argument("<target>", "설치 대상 (현재는 codex만 지원)")
      .option("--dry-run", "실제로 파일을 생성하지 않고 작업만 출력", false)
      .option("--force", "기존 파일이 있어도 덮어쓰기", false);
  },
  async run(context) {
    const target = context.args[0] as string | undefined;
    const dryRunValue = context.options["dryRun"] ?? context.options["dry-run"];
    const dryRun = Boolean(dryRunValue);
    const force = Boolean(context.options["force"]);

    if (!target) {
      throw new Error("설치 대상을 지정하세요. 예: specodex install codex");
    }

    if (target !== "codex") {
      throw new Error(`알 수 없는 설치 대상입니다: ${target}. 현재는 codex만 지원합니다.`);
    }

    await installCodexCommands({ dryRun, force, logger: context.logger });

    if (dryRun) {
      context.logger.info("[dry-run] 설치 시뮬레이션이 완료되었습니다.");
    } else {
      context.logger.info(
        "설치가 완료되었습니다. Codex를 재시작하면 새 슬래시 명령을 사용할 수 있습니다.",
      );
    }
  },
};
