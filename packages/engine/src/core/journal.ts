import type { ProcedureState } from './procedure';
import type { ProcedureId } from './procedureid';

/**
 * A single entry in the append-only execution journal.
 *
 * Every time the engine advances a procedure (logic step, input received,
 * delegation started, etc.), it appends one {@link JournalEntry} to the journal.
 * The journal is the **durable source of truth** — server restarts rebuild engine
 * state from it, and the caller can derive client-facing events from it.
 */
export interface JournalEntry {
	/**
	 * Which procedure produced this entry.
	 * Used by the engine to look up the {@link ProcedureDefinition} in its registry.
	 */
	readonly procedureId: ProcedureId;

	/**
	 * The state of the procedure **after** this step executed.
	 * `step` is always a concrete string here — `undefined` is only used
	 * transiently as an auto-advance sentinel in callback results.
	 */
	readonly state: ProcedureState;

	/**
	 * Index into the journal of the parent procedure's entry, or `undefined`
	 * for the root procedure. Together with the sequential journal, this lets
	 * clients reconstruct the execution tree.
	 */
	parentIndex?: number;

	/**
	 * @internal Engine-private. The parent {@link ForEachStep}'s step ID when
	 * this entry is a loop body step.
	 */
	_loopParentStepId?: string;

	/**
	 * @internal Engine-private. Remaining items in the active
	 * {@link ForEachStep} queue.
	 */
	_loopQueue?: unknown[];
}
