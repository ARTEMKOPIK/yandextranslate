import log from 'electron-log';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: string;
  data?: unknown;
}

export class Logger {
  private static instance: Logger;

  private constructor() {
    // Configure electron-log
    log.transports.file.level = 'info';
    log.transports.console.level = 'debug';

    // Set log file location to user data directory
    const userDataPath = app.getPath('userData');
    const logsPath = path.join(userDataPath, 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
    }

    // Configure file transport with rotation
    log.transports.file.resolvePathFn = () => path.join(logsPath, 'app.log');
    log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB

    // Set log format
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
    log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

    // Initialize logger
    log.info('Logger initialized', { logsPath });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  error(message: string, context?: string, data?: unknown): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    log.error(logMessage, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    log.warn(logMessage, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    log.info(logMessage, data);
  }

  debug(message: string, context?: string, data?: unknown): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    log.debug(logMessage, data);
  }

  getLogsPath(): string {
    return path.join(app.getPath('userData'), 'logs');
  }

  getLogFilePath(): string {
    return path.join(this.getLogsPath(), 'app.log');
  }

  async getLogs(limit?: number): Promise<string> {
    try {
      const logFile = this.getLogFilePath();

      if (!fs.existsSync(logFile)) {
        return '';
      }

      const content = fs.readFileSync(logFile, 'utf-8');

      if (limit) {
        const lines = content.split('\n');
        return lines.slice(-limit).join('\n');
      }

      return content;
    } catch (error) {
      this.error('Failed to read log file', 'Logger', error);
      return '';
    }
  }

  async clearLogs(): Promise<void> {
    try {
      const logFile = this.getLogFilePath();

      if (fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '');
        this.info('Logs cleared', 'Logger');
      }
    } catch (error) {
      this.error('Failed to clear logs', 'Logger', error);
      throw error;
    }
  }

  async rotateLogs(): Promise<void> {
    try {
      const logFile = this.getLogFilePath();
      const logsPath = this.getLogsPath();

      if (!fs.existsSync(logFile)) {
        return;
      }

      const stats = fs.statSync(logFile);
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (stats.size > maxSize) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const archiveFile = path.join(logsPath, `app.${timestamp}.log`);

        fs.renameSync(logFile, archiveFile);
        this.info('Log file rotated', 'Logger', { archiveFile });

        // Clean up old log files (keep last 10)
        this.cleanupOldLogs();
      }
    } catch (error) {
      this.error('Failed to rotate logs', 'Logger', error);
    }
  }

  private cleanupOldLogs(): void {
    try {
      const logsPath = this.getLogsPath();
      const files = fs
        .readdirSync(logsPath)
        .filter((f) => f.startsWith('app.') && f.endsWith('.log') && f !== 'app.log')
        .map((f) => ({
          name: f,
          path: path.join(logsPath, f),
          time: fs.statSync(path.join(logsPath, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the 10 most recent archived logs
      const maxArchives = 10;
      if (files.length > maxArchives) {
        files.slice(maxArchives).forEach((file) => {
          fs.unlinkSync(file.path);
          this.info('Deleted old log file', 'Logger', { file: file.name });
        });
      }
    } catch (error) {
      this.error('Failed to cleanup old logs', 'Logger', error);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
