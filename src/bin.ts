#!/usr/bin/env bun
import { buildCli } from "./cli/index";

async function main() {
  const cli = buildCli();
  await cli.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
