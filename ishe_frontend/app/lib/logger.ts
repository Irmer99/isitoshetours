type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

const isDev = import.meta.env.DEV;

function formatMessage(level: LogLevel, message: string, context?: LogContext) {
  const prefix = context?.component ? `[${context.component}]` : "";
  const action = context?.action ? `→ ${context.action}` : "";
  return `${prefix} ${action} ${message}`.trim();
}

function log(level: LogLevel, message: string, context?: LogContext, extra?: unknown) {
  if (!isDev && level === "debug") return;

  const formatted = formatMessage(level, message, context);
  const args = extra !== undefined ? [formatted, extra] : [formatted];

  switch (level) {
    case "debug":
      console.debug(...args);
      break;
    case "info":
      console.info(...args);
      break;
    case "warn":
      console.warn(...args);
      break;
    case "error":
      console.error(...args);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext, extra?: unknown) =>
    log("debug", message, context, extra),
  info: (message: string, context?: LogContext, extra?: unknown) =>
    log("info", message, context, extra),
  warn: (message: string, context?: LogContext, extra?: unknown) =>
    log("warn", message, context, extra),
  error: (message: string, context?: LogContext, extra?: unknown) =>
    log("error", message, context, extra),
};
