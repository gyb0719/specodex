import chalk from "chalk";
import type { Logger } from "./types";

export function createLogger(verbose = true): Logger {
  return {
    info(message) {
      if (verbose) {
        console.log(chalk.blue("[info]"), message);
      }
    },
    warn(message) {
      console.warn(chalk.yellow("[warn]"), message);
    },
    error(message) {
      console.error(chalk.red("[error]"), message);
    },
  };
}
