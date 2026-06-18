/**
 * Interface for logging step execution in the engine.
 *
 * Implementations can write to files, in-memory buffers, or external
 * services. The engine calls these hooks during {@link Engine#run} so
 * failures can be diagnosed even when journal persistence hasn't caught up.
 */
export interface StepLogger {
	/**
	 * Called after a step completes successfully or pauses for input.
	 *
	 * @param info - Context about the executed step.
	 * @param result - Optional result summary (e.g. next step, "awaiting input").
	 */
	logStep(info: StepLogInfo, result?: string): void;

	/**
	 * Called when a step throws an error.
	 *
	 * @param info - Context about the step that failed.
	 * @param error - The thrown error.
	 */
	logError(info: StepLogInfo, error: unknown): void;
}

/** Context passed to every {@link StepLogger} hook. */
export interface StepLogInfo {
	/** The procedure that owns this step. */
	procedureId: string;
	/** The step key within the procedure. */
	step: string;
	/** The concrete step type (ComputeStep, InputStep, CallStep, ForEachStep). */
	stepType: string;
	/** Index of the current journal entry before this step executes. */
	journalIndex: number;
	/** Whether this is a loop body step. */
	isLoopBody: boolean;
}

/** A no-op logger used when none is provided. */
export const noopLogger: StepLogger = {
	logStep: () => {},
	logError: () => {}
};
