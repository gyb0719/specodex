import { join, relative } from "path";
import { fileExists, readFile, writeFile } from "./file-utils";
import { loadPrompt, renderPrompt } from "./prompt";
import { packagePath } from "./paths";

interface PlanOptions {
  projectRoot: string;
  featureId: string;
}

export interface PlanResult {
  prompt: string;
  existingContent: string | null;
  outputPath: string;
  targetRelativePath: string;
  templatePreview: string;
  planTemplatePath: string;
  specExists: boolean;
  specRelativePath: string;
  nextMessage: string;
}

const PLAN_TEMPLATE_PATH = "templates/plan/implementation-plan-template.md";
const PLAN_PROMPT_PATH = "templates/plan/plan-prompt.md";

export async function preparePlan(options: PlanOptions): Promise<PlanResult> {
  const { projectRoot, featureId } = options;
  const outputPath = join(projectRoot, "specs", featureId, "plan.md");
  const specPath = join(projectRoot, "specs", featureId, "spec.md");
  const existingContent = (await fileExists(outputPath)) ? await readFile(outputPath) : null;
  const templatePreview = await readFile(packagePath(PLAN_TEMPLATE_PATH));
  const promptTemplate = await loadPrompt(PLAN_PROMPT_PATH);
  const relativePath = relative(projectRoot, outputPath);
  const specRelativePath = relative(projectRoot, specPath);

  const prompt = renderPrompt(promptTemplate, {
    FEATURE_ID: featureId,
    TARGET_PATH: relativePath,
    SPEC_PATH: specRelativePath,
    TEMPLATE: templatePreview,
  });

  return {
    prompt,
    existingContent,
    outputPath,
    targetRelativePath: relativePath,
    templatePreview,
    planTemplatePath: packagePath(PLAN_TEMPLATE_PATH),
    specExists: await fileExists(specPath),
    specRelativePath,
    nextMessage: "/tasks를 실행해 계획을 실행 가능한 작업으로 분해하세요.",
  };
}

export async function updatePlan(path: string, content: string): Promise<void> {
  await writeFile(path, content);
}
