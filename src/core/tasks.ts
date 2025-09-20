import { join, relative } from "path";
import { fileExists, readFile, writeFile } from "./file-utils.js";
import { loadPrompt, renderPrompt } from "./prompt.js";
import { packagePath } from "./paths.js";
import { loadTasks } from "./task-loader.js";

interface TaskOptions {
  projectRoot: string;
  featureId: string;
}

export interface TaskResult {
  prompt: string;
  existingContent: string | null;
  outputPath: string;
  targetRelativePath: string;
  templatePreview: string;
  planExists: boolean;
  planRelativePath: string;
  nextMessage: string;
}

const TASK_TEMPLATE_PATH = "templates/tasks/task-breakdown-template.md";
const TASK_PROMPT_PATH = "templates/tasks/tasks-prompt.md";

export async function prepareTasks(options: TaskOptions): Promise<TaskResult> {
  const { projectRoot, featureId } = options;
  const outputPath = join(projectRoot, "specs", featureId, "tasks.yaml");
  const planPath = join(projectRoot, "specs", featureId, "plan.md");
  const existingContent = (await fileExists(outputPath)) ? await readFile(outputPath) : null;
  const templatePreview = await readFile(packagePath(TASK_TEMPLATE_PATH));
  const promptTemplate = await loadPrompt(TASK_PROMPT_PATH);
  const relativePath = relative(projectRoot, outputPath);
  const planRelativePath = relative(projectRoot, planPath);

  const prompt = renderPrompt(promptTemplate, {
    FEATURE_ID: featureId,
    TARGET_PATH: relativePath,
    PLAN_PATH: planRelativePath,
    TEMPLATE: templatePreview,
  });

  return {
    prompt,
    existingContent,
    outputPath,
    targetRelativePath: relativePath,
    templatePreview,
    planExists: await fileExists(planPath),
    planRelativePath,
    nextMessage:
      "/implement를 실행해 작업 그래프를 수행하세요. 필요하면 --dry-run으로 먼저 확인하세요.",
  };
}

export async function updateTasks(
  projectRoot: string,
  path: string,
  content: string,
): Promise<void> {
  await writeFile(path, content);

  await loadTasks(projectRoot, path);
}
