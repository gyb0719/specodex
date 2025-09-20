import { spawn } from "child_process";
import { once } from "events";
import type { Logger } from "../cli/types.js";
import type { TaskDefinition } from "./types.js";

interface RunTaskOptions {
  tasks: TaskDefinition[];
  dryRun: boolean;
  logger: Logger;
}

export async function executeTasks(options: RunTaskOptions): Promise<void> {
  const ordered = orderTasks(options.tasks);
  options.logger.info(`총 ${ordered.length}개의 작업을 실행합니다.`);

  for (const task of ordered) {
    await runTask(task, options);
  }
}

export function orderTasks(tasks: TaskDefinition[]): TaskDefinition[] {
  const result: TaskDefinition[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const lookup = new Map(tasks.map((task) => [task.id, task] as const));

  const visit = (task: TaskDefinition): void => {
    if (visited.has(task.id)) {
      return;
    }
    if (visiting.has(task.id)) {
      throw new Error(`순환 의존성이 감지되었습니다: ${task.id}`);
    }
    visiting.add(task.id);
    for (const dep of task.depends_on ?? []) {
      const dependency = lookup.get(dep);
      if (!dependency) {
        throw new Error(`${task.id} 작업이 존재하지 않는 의존성 ${dep}을 참조합니다.`);
      }
      visit(dependency);
    }
    visiting.delete(task.id);
    visited.add(task.id);
    result.push(task);
  };

  for (const task of tasks) {
    visit(task);
  }

  return result;
}

async function runTask(task: TaskDefinition, options: RunTaskOptions): Promise<void> {
  const { dryRun, logger } = options;
  logger.info(`작업 실행: ${task.id} - ${task.title}`);

  for (const [index, step] of task.steps.entries()) {
    if (dryRun) {
      logger.info(`  [건너뜀] ${task.id} 단계 ${index + 1}: ${step}`);
      continue;
    }

    logger.info(`  단계 ${index + 1}: ${step}`);
    await execShell(step, logger);
  }
}

async function execShell(command: string, logger: Logger): Promise<void> {
  const child = spawn(command, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  const [code] = (await once(child, "exit")) as [number | null, NodeJS.Signals | null];

  if (code && code !== 0) {
    logger.error(`명령이 실패했습니다: ${command} (exit code ${code})`);
    throw new Error(`명령 실패: ${command}`);
  }
}
