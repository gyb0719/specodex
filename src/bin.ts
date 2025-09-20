#!/usr/bin/env node
import { buildCli } from "./cli/index.js";

async function main() {
  const cli = buildCli();
  await cli.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
