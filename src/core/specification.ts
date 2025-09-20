import { join, relative } from "path";
import { fileExists, readFile, writeFile } from "./file-utils.js";
import { loadPrompt, renderPrompt } from "./prompt.js";
import { packagePath } from "./paths.js";

interface SpecificationOptions {
  projectRoot: string;
  featureId: string;
}

export interface SpecificationResult {
  prompt: string;
  existingContent: string | null;
  outputPath: string;
  templatePath: string;
  templatePreview: string;
  targetRelativePath: string;
  nextMessage: string;
}

const SPEC_TEMPLATE_PATH = "templates/spec/feature-spec-template.md";
const SPEC_PROMPT_PATH = "templates/spec/spec-prompt.md";

export async function prepareSpecification(
  options: SpecificationOptions,
): Promise<SpecificationResult> {
  const { projectRoot, featureId } = options;
  const outputPath = join(projectRoot, "specs", featureId, "spec.md");
  const existingContent = (await fileExists(outputPath)) ? await readFile(outputPath) : null;
  const templatePreview = await readFile(packagePath(SPEC_TEMPLATE_PATH));
  const promptTemplate = await loadPrompt(SPEC_PROMPT_PATH);
  const relativePath = relative(projectRoot, outputPath);

  const prompt = renderPrompt(promptTemplate, {
    FEATURE_ID: featureId,
    TARGET_PATH: relativePath,
    TEMPLATE: templatePreview,
  });

  return {
    prompt,
    existingContent,
    outputPath,
    templatePath: packagePath(SPEC_TEMPLATE_PATH),
    templatePreview,
    targetRelativePath: relativePath,
    nextMessage: "/plan을 실행해 기술 스택과 구현 전략을 정리하세요.",
  };
}

export async function updateSpecification(path: string, content: string): Promise<void> {
  await writeFile(path, content);
}
