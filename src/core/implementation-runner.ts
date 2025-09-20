import { loadTasks } from "./task-loader";
import { executeTasks } from "./task-runner";
import type { Logger } from "../cli/types";

interface ImplementationOptions {
  projectRoot: string;
  tasksPath: string;
  dryRun: boolean;
  logger: Logger;
}

export async function runImplementation(options: ImplementationOptions): Promise<void> {
  const { projectRoot, tasksPath, dryRun, logger } = options;

  logger.info(`작업 파일을 로드합니다: ${tasksPath}`);
  const { tasks, path } = await loadTasks(projectRoot, tasksPath);
  logger.info(`작업 파일 경로: ${path}`);

  if (tasks.length === 0) {
    logger.warn("실행할 작업이 없습니다.");
    return;
  }

  await executeTasks({
    tasks,
    dryRun,
    logger,
  });
}
