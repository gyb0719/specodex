import { promises as fs } from "fs";
import { dirname, join, relative } from "path";
import type { Logger } from "../cli/types.js";
import { packagePath } from "./paths.js";

export interface InitOptions {
  targetRoot: string;
  dryRun: boolean;
  logger: Logger;
}

const DIRECTORIES = [
  "memory",
  "memory/research",
  "templates/spec",
  "templates/plan",
  "templates/tasks",
  "specs/example",
  "scripts",
  "tests",
  "docs",
];

export async function scaffoldWorkspace(options: InitOptions): Promise<void> {
  const { targetRoot, dryRun, logger } = options;

  logger.info(`프로젝트 루트: ${targetRoot}`);

  for (const dir of DIRECTORIES) {
    const fullPath = join(targetRoot, dir);
    if (dryRun) {
      logger.info(`[dry-run] 디렉터리 생성: ${dir}`);
      continue;
    }
    await fs.mkdir(fullPath, { recursive: true });
  }

  await copyFile("templates/bootstrap/README.md", join(targetRoot, "README.md"), options);
  await copyFile(
    "templates/bootstrap/constitution.md",
    join(targetRoot, "memory/constitution.md"),
    options,
  );
  await copyFile(
    "templates/bootstrap/specs/example/spec.md",
    join(targetRoot, "specs/example/spec.md"),
    options,
  );
  await copyFile(
    "templates/bootstrap/specs/example/plan.md",
    join(targetRoot, "specs/example/plan.md"),
    options,
  );
  await copyFile(
    "templates/bootstrap/specs/example/tasks.yaml",
    join(targetRoot, "specs/example/tasks.yaml"),
    options,
  );

  await copyFile("templates/bootstrap/package.json", join(targetRoot, "package.json"), options);

  await copyFile(
    "templates/spec/feature-spec-template.md",
    join(targetRoot, "templates/spec/feature-spec-template.md"),
    options,
  );
  await copyFile(
    "templates/plan/implementation-plan-template.md",
    join(targetRoot, "templates/plan/implementation-plan-template.md"),
    options,
  );
  await copyFile(
    "templates/tasks/task-breakdown-template.md",
    join(targetRoot, "templates/tasks/task-breakdown-template.md"),
    options,
  );

  await copyFile("scripts/bootstrap.sh", join(targetRoot, "scripts/bootstrap.sh"), options, {
    makeExecutable: true,
  });
  await copyFile(
    "scripts/run-playwright.sh",
    join(targetRoot, "scripts/run-playwright.sh"),
    options,
    { makeExecutable: true },
  );

  if (!dryRun) {
    const gitkeep = join(targetRoot, "memory/research/.gitkeep");
    await fs.writeFile(gitkeep, "");
  } else {
    logger.info("[dry-run] memory/research/.gitkeep 생성");
  }
}

interface CopyOptions {
  makeExecutable?: boolean;
}

async function copyFile(
  sourceRelative: string,
  destination: string,
  options: InitOptions,
  copyOptions: CopyOptions = {},
): Promise<void> {
  const { dryRun, logger } = options;
  const source = packagePath(sourceRelative);
  const rel = relative(options.targetRoot, destination);

  if (dryRun) {
    logger.info(`[dry-run] 파일 복사: ${rel} ← ${sourceRelative}`);
    return;
  }

  const data = await fs.readFile(source);
  await fs.mkdir(dirname(destination), { recursive: true });
  await fs.writeFile(destination, data);

  if (copyOptions.makeExecutable) {
    await fs.chmod(destination, 0o755);
  }

  logger.info(`파일 생성: ${rel}`);
}
