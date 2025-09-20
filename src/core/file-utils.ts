import { promises as fs } from "fs";
import { dirname } from "path";

export async function ensureDir(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path));
  await fs.writeFile(path, content, "utf-8");
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function readFile(path: string): Promise<string> {
  return fs.readFile(path, "utf-8");
}
