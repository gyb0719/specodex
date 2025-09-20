#!/usr/bin/env node
/* eslint-env node */
import process from "process";
import { homedir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";

const skipValue = process.env["SPECODEX_SKIP_CODEX_INSTALL"];
if (skipValue === "1" || (skipValue && skipValue.toLowerCase() === "true")) {
  process.exit(0);
}

async function main() {
  const homeDir = homedir();
  if (!homeDir) {
    return;
  }

  const templateDir = getTemplateDir();
  const destDir = join(homeDir, ".codex", "commands", "specodex");

  await mkdir(destDir, { recursive: true });

  const entries = await readdir(templateDir, { withFileTypes: true });
  let updated = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const sourcePath = join(templateDir, entry.name);
    const destPath = join(destDir, entry.name);
    const sourceContent = await readFile(sourcePath, "utf-8");

    let shouldWrite = false;
    try {
      const existing = await readFile(destPath, "utf-8");
      if (existing !== sourceContent) {
        shouldWrite = true;
      }
    } catch (error) {
      if (error && error.code === "ENOENT") {
        shouldWrite = true;
      } else {
        throw error;
      }
    }

    if (shouldWrite) {
      await writeFile(destPath, sourceContent, { encoding: "utf-8" });
      updated += 1;
    }
  }

  if (updated > 0) {
    process.stdout.write(
      `SpecoDex: 설치된 Codex 슬래시 명령 템플릿 ${updated}개를 갱신했습니다.\n`,
    );
  }
}

function getTemplateDir() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  return join(scriptDir, "..", "templates", "commands");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`SpecoDex: Codex 슬래시 명령 설치 실패 - ${message}\n`);
});
