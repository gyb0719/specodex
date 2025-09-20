import { fileURLToPath } from "url";
import { join } from "path";

const PACKAGE_ROOT = fileURLToPath(new URL("../..", import.meta.url));

export function packagePath(...segments: string[]): string {
  return join(PACKAGE_ROOT, ...segments);
}
