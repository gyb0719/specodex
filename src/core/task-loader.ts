import { promises as fs } from "fs";
import { isAbsolute, join } from "path";
import YAML from "yaml";
import type { LoadedTasks, TaskDefinition } from "./types";

export async function loadTasks(projectRoot: string, tasksPath: string): Promise<LoadedTasks> {
  const resolvedPath = isAbsolute(tasksPath) ? tasksPath : join(projectRoot, tasksPath);
  const file = await fs.readFile(resolvedPath, "utf-8");
  const parsed = YAML.parse(file) as TaskDefinition[] | null;

  if (!parsed || !Array.isArray(parsed)) {
    throw new Error("작업 파일이 비어 있거나 배열 형식이 아닙니다.");
  }

  parsed.forEach((task, index) => validateTask(task, index));

  ensureUniqueIds(parsed);
  ensureDependenciesExist(parsed);

  return { tasks: parsed, path: resolvedPath };
}

function validateTask(task: TaskDefinition, index: number): void {
  if (!task.id) {
    throw new Error(`${index + 1}번째 작업에 id가 없습니다.`);
  }
  if (!task.title) {
    throw new Error(`${task.id} 작업에 title이 없습니다.`);
  }
  if (!Array.isArray(task.steps) || task.steps.length === 0) {
    throw new Error(`${task.id} 작업에 실행 단계(steps)가 없습니다.`);
  }
  if (task.depends_on && !Array.isArray(task.depends_on)) {
    throw new Error(`${task.id} 작업의 depends_on은 배열이어야 합니다.`);
  }
}

function ensureUniqueIds(tasks: TaskDefinition[]): void {
  const ids = new Set<string>();
  tasks.forEach((task) => {
    if (ids.has(task.id)) {
      throw new Error(`중복된 작업 ID가 발견되었습니다: ${task.id}`);
    }
    ids.add(task.id);
  });
}

function ensureDependenciesExist(tasks: TaskDefinition[]): void {
  const ids = new Set(tasks.map((task) => task.id));
  tasks.forEach((task) => {
    (task.depends_on ?? []).forEach((dep) => {
      if (!ids.has(dep)) {
        throw new Error(`${task.id} 작업이 존재하지 않는 의존성 ${dep}을 참조합니다.`);
      }
    });
  });
}
