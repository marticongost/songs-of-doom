import { type StepLogInfo, type StepLogger } from '@songsofdoom/engine';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Writes step execution logs to a file under the given directory.
 *
 * Creates the directory on first use (if it doesn't exist) and appends
 * timestamped log entries to `{logsDir}/{gameId}.log`.
 */
export class FileStepLogger implements StepLogger {
	private readonly logPath: string;
	private initialized = false;

	/**
	 * @param gameId - The game identifier, used as the log file name.
	 * @param logsDir - Absolute path to the directory where log files are stored.
	 */
	constructor(gameId: string, logsDir: string) {
		this.logPath = join(logsDir, `${gameId}.log`);
	}

	private ensureDir(): void {
		if (this.initialized) return;
		mkdirSync(this.logPath.replace(/\/[^/]+$/, ''), { recursive: true });
		this.initialized = true;
	}

	private write(line: string): void {
		this.ensureDir();
		appendFileSync(this.logPath, line + '\n', 'utf-8');
	}

	private ts(): string {
		return new Date().toISOString();
	}

	logStep(info: StepLogInfo, result?: string): void {
		const suffix = result ? ` result=${result}` : '';
		this.write(
			`${this.ts()} [${info.procedureId}] step="${info.step}" ` +
				`type=${info.stepType} journalIndex=${info.journalIndex} ` +
				`loop=${info.isLoopBody}` +
				suffix
		);
	}

	logError(info: StepLogInfo, error: unknown): void {
		const message = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack : undefined;
		let line =
			`${this.ts()} [${info.procedureId}] ERROR  step="${info.step}" ` +
			`type=${info.stepType} journalIndex=${info.journalIndex} ` +
			`message="${message}"`;
		if (stack) {
			line += `\n${stack}`;
		}
		this.write(line);
	}
}
