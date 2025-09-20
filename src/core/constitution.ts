import { join } from "path";
import { fileExists, readFile, writeFile } from "./file-utils.js";
import { loadPrompt } from "./prompt.js";

interface ConstitutionOptions {
  projectRoot: string;
}

export interface ConstitutionResult {
  prompt: string;
  existingContent: string | null;
  outputPath: string;
  nextMessage: string;
}

const CONSTITUTION_PATH = "memory/constitution.md";
const PROMPT_PATH = "templates/constitution/constitution-prompt.md";

export async function prepareConstitution(
  options: ConstitutionOptions,
): Promise<ConstitutionResult> {
  const { projectRoot } = options;
  const outputPath = join(projectRoot, CONSTITUTION_PATH);
  const prompt = await loadPrompt(PROMPT_PATH);
  const existingContent = (await fileExists(outputPath)) ? await readFile(outputPath) : null;

  return {
    prompt,
    existingContent,
    outputPath,
    nextMessage: "/specify를 실행해서 구현하고자 하는 내용을 설명하세요.",
  };
}

export async function updateConstitution(path: string, content: string): Promise<void> {
  await writeFile(path, content);
}
