import { describe, expect, it, vi } from "vitest";
import { createConnection, createServer } from "net";
import { once } from "events";
import { startSocketServer } from "../src/core/socket-server";
import type { Logger } from "../src/cli/types";
import type { Mock } from "vitest";

type SpyLogger = Logger & {
  info: Mock;
  warn: Mock;
  error: Mock;
};

function createTestLogger(): SpyLogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

async function canBindToLoopback(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const server = createServer();
    const handleError = (error: NodeJS.ErrnoException) => {
      server.close();
      if (error.code === "EACCES" || error.code === "EPERM") {
        resolve(false);
      } else {
        reject(error);
      }
    };
    server.once("error", handleError);
    server.listen(0, "127.0.0.1", () => {
      server.close();
      resolve(true);
    });
  });
}

const socketAvailable = await canBindToLoopback();

const runIfSocket = socketAvailable ? it : it.skip;

describe("startSocketServer", () => {
  runIfSocket("클라이언트에 메시지를 전송한다", async () => {
    const logger = createTestLogger();
    const handle = await startSocketServer({
      host: "127.0.0.1",
      port: 0,
      message: "SpecoDex Ready",
      logger,
    });

    const client = createConnection({ host: "127.0.0.1", port: handle.actualPort });
    const chunks: Buffer[] = [];
    client.on("data", (chunk) => {
      chunks.push(chunk);
    });

    await once(client, "end");
    const payload = Buffer.concat(chunks).toString("utf-8").trim();
    expect(payload).toBe("SpecoDex Ready");

    await handle.close();
    await handle.closed;
  });

  runIfSocket("최대 연결 수에 도달하면 자동으로 종료한다", async () => {
    const logger = createTestLogger();
    const handle = await startSocketServer({
      host: "127.0.0.1",
      port: 0,
      maxConnections: 1,
      logger,
    });

    const client = createConnection({ host: "127.0.0.1", port: handle.actualPort });
    client.end();

    await handle.closed;

    const infoMessages = logger.info.mock.calls.map((call) => call[0] as string);
    const hasMaxConnectionsLog = infoMessages.some(
      (message) => typeof message === "string" && message.includes("최대 연결 수(1)"),
    );
    expect(hasMaxConnectionsLog).toBe(true);
  });
});
