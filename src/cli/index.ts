import { Command as Commander } from "commander";
import { constitutionCommand } from "./commands/constitution.js";
import { implementCommand } from "./commands/implement.js";
import { specifyCommand } from "./commands/specify.js";
import { researchCommand } from "./commands/research.js";
import { planCommand } from "./commands/plan.js";
import { tasksCommand } from "./commands/tasks.js";
import { createLogger } from "./logger.js";
import type { Command } from "./types.js";
import { initCommand } from "./commands/init.js";
import { socketCommand } from "./commands/socket.js";
import { installCommand } from "./commands/install.js";

const registeredCommands: Command[] = [
  initCommand,
  installCommand,
  constitutionCommand,
  specifyCommand,
  planCommand,
  tasksCommand,
  researchCommand,
  implementCommand,
  socketCommand,
];

export function buildCli(): Commander {
  const program = new Commander();
  program
    .name("specodex")
    .description("SpecoDex CLI: Codex 에이전트용 명세 중심 워크플로")
    .version("0.1.0");

  registeredCommands.forEach((command) => {
    const sub = program.command(command.name).description(command.description);
    command.configure?.(sub);
    sub.action(async (...cliArgs: unknown[]) => {
      const commandInstance = cliArgs[cliArgs.length - 1] as Commander;
      const logger = createLogger();
      try {
        await command.run({
          projectRoot: process.cwd(),
          args: process.argv.slice(3),
          options: commandInstance.opts<Record<string, unknown>>(),
          logger,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(message);
        process.exitCode = 1;
      }
    });
  });

  return program;
}

export function listCommands(): Command[] {
  return [...registeredCommands];
}
