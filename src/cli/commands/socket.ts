import type { Command } from "../types.js";
import { startSocketServer } from "../../core/socket-server.js";

function parseNumberOption(value: unknown, optionName: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${optionName} 옵션은 숫자여야 합니다.`);
  }
  return parsed;
}

export const socketCommand: Command = {
  name: "socket",
  description: "간단한 TCP 소켓 서버를 열어 연결을 수신합니다.",
  configure(cli) {
    cli
      .option("--host <host>", "바인딩할 호스트 이름 (기본: 127.0.0.1)")
      .option("--port <port>", "수신할 포트 번호 (기본: 0으로 임의 포트)")
      .option("--message <message>", "클라이언트 연결 시 전송할 메시지")
      .option("--duration <seconds>", "지정한 초 후 자동 종료")
      .option("--max-connections <count>", "연결을 처리한 뒤 자동 종료할 최대 연결 수");
  },
  async run(context) {
    const host = (context.options["host"] as string | undefined) ?? "127.0.0.1";
    const portValue = parseNumberOption(context.options["port"], "--port");
    const port = portValue !== undefined ? portValue : 0;

    const durationSeconds = parseNumberOption(context.options["duration"], "--duration");
    const durationMs = durationSeconds !== undefined ? durationSeconds * 1000 : undefined;

    const maxConnectionsValue = parseNumberOption(
      context.options["maxConnections"] ?? context.options["max-connections"],
      "--max-connections",
    );

    const message = context.options["message"] as string | undefined;

    const handle = await startSocketServer({
      host,
      port,
      ...(message !== undefined ? { message } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
      ...(maxConnectionsValue !== undefined ? { maxConnections: maxConnectionsValue } : {}),
      logger: context.logger,
    });

    context.logger.info(
      durationMs
        ? `소켓 서버가 ${durationSeconds}초 동안 실행됩니다. 조기 종료하려면 Ctrl+C를 누르세요.`
        : `소켓 서버가 실행 중입니다. 종료하려면 Ctrl+C를 누르세요.`,
    );

    if (!durationMs && maxConnectionsValue === undefined) {
      context.logger.info(
        "자동 종료 조건이 지정되지 않았습니다. --duration 또는 --max-connections 옵션을 고려하세요.",
      );
    }

    await handle.closed;
  },
};
