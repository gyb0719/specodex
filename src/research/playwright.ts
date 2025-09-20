import { spawn } from "child_process";
import { once } from "events";
import { join } from "path";
import type { Logger } from "../cli/types.js";

interface PlaywrightOptions {
  projectRoot: string;
  url: string;
  logger: Logger;
  outputPath?: string;
}

export async function runPlaywrightResearch(options: PlaywrightOptions): Promise<string> {
  const { projectRoot, url, logger } = options;
  const scriptPath = join(projectRoot, "scripts", "run-playwright.sh");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultOutput =
    options.outputPath ?? join(projectRoot, "memory", "research", `${timestamp}.md`);
  const screenshotPath = defaultOutput.replace(/\.md$/, ".png");
  const metadataPath = defaultOutput.replace(/\.md$/, ".json");

  logger.info(`Playwright MCP 연구를 실행합니다: ${url}`);

  const child = spawn(scriptPath, [url], {
    cwd: projectRoot,
    env: {
      ...process.env,
      SPECODEX_OUTPUT_FILE: defaultOutput,
      SPECODEX_SCREENSHOT_FILE: screenshotPath,
      SPECODEX_METADATA_FILE: metadataPath,
    },
    stdio: "inherit",
  });

  const [code] = (await once(child, "exit")) as [number | null, NodeJS.Signals | null];

  if (code && code !== 0) {
    throw new Error(`Playwright MCP 스크립트가 실패했습니다 (exit code ${code}).`);
  }

  logger.info(`연구 로그가 저장되었습니다: ${defaultOutput}`);
  return defaultOutput;
}
