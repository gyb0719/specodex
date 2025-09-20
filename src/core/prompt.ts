import { readFile } from "./file-utils";
import { packagePath } from "./paths";

export async function loadPrompt(relativePath: string): Promise<string> {
  return readFile(packagePath(relativePath));
}

export function renderPrompt(template: string, replacements: Record<string, string>): string {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key) => {
    const value = replacements[key];
    return value !== undefined ? value : match;
  });
}
