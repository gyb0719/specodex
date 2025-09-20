export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface CommandContext {
  projectRoot: string;
  args: string[];
  options: Record<string, unknown>;
  logger: Logger;
}

export interface Command {
  name: string;
  description: string;
  run(context: CommandContext): Promise<void>;
  configure?: (cli: import("commander").Command) => void;
}
