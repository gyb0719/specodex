import net from "net";
import { once } from "events";
import type { Logger } from "../cli/types.js";

export interface SocketServerOptions {
  host: string;
  port: number;
  message?: string;
  durationMs?: number;
  maxConnections?: number;
  allowHalfOpen?: boolean;
  logger: Logger;
}

export interface SocketServerHandle {
  actualPort: number;
  close(): Promise<void>;
  closed: Promise<void>;
}

export async function startSocketServer(options: SocketServerOptions): Promise<SocketServerHandle> {
  const {
    host,
    port,
    message,
    durationMs,
    maxConnections,
    allowHalfOpen = false,
    logger,
  } = options;

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`유효하지 않은 포트 값입니다: ${port}`);
  }

  if (maxConnections !== undefined && (!Number.isInteger(maxConnections) || maxConnections <= 0)) {
    throw new Error(`maxConnections 값은 양의 정수여야 합니다: ${maxConnections}`);
  }

  const server = net.createServer({ allowHalfOpen }, (socket) => {
    const remoteAddress = socket.remoteAddress ?? "unknown";
    const remotePort = socket.remotePort ?? "-";
    logger.info(`클라이언트 연결: ${remoteAddress}:${remotePort}`);

    if (message) {
      socket.write(message);
      if (!message.endsWith("\n")) {
        socket.write("\n");
      }
    }

    socket.end();
  });

  let connectionCount = 0;
  if (maxConnections !== undefined) {
    server.maxConnections = maxConnections;
  }

  const listeningPromise = new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });

  await listeningPromise;

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  logger.info(`소켓 서버를 열었습니다: ${host}:${actualPort}`);

  const closed = once(server, "close").then(() => {
    logger.info("소켓 서버가 종료되었습니다.");
  });

  server.on("connection", () => {
    connectionCount += 1;
    if (maxConnections !== undefined && connectionCount >= maxConnections) {
      logger.info(`최대 연결 수(${maxConnections})에 도달하여 서버를 종료합니다.`);
      setImmediate(() => {
        server.close();
      });
    }
  });

  server.on("error", (error) => {
    logger.error(`소켓 서버 오류: ${error.message}`);
  });

  if (durationMs !== undefined) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      throw new Error(`durationMs 값은 양수여야 합니다: ${durationMs}`);
    }
    const timer = setTimeout(() => {
      logger.info(`지정된 지속 시간(${durationMs}ms) 경과로 서버를 종료합니다.`);
      server.close();
    }, durationMs);
    // 유지되지 않도록 unref 사용 (가용한 경우)
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  }

  const handle: SocketServerHandle = {
    actualPort,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
    closed,
  };

  return handle;
}
