import { mapToRecord } from '@songsofdoom/common';
import type { ReadonlyGameState } from '../state/gamestate';
import { type Step, CallStep, ComputeStep, isProcedureDefinition } from './steps';

export enum ProcedureId {
	Unimplemented = 'unimplemented',

	// Core
	TriggerCapability = 'triggerCapability',
	EmitEvent = 'emitEvent',
	ResolveTarget = 'resolveTarget',

	// Game sequence
	Chapter = 'chapter',
	ChapterStartPhase = 'chapterStartPhase',
	FocusPhase = 'focusPhase',
	TurnsPhase = 'turnsPhase',
	DrawPhase = 'drawPhase',
	EncounterPhase = 'encounterPhase',
	ChapterEndPhase = 'chapterEndPhase',
	Turn = 'turn',
	TurnStartPhase = 'turnStartPhase',
	TurnPlayerActionsPhase = 'turnPlayerActionsPhase',
	TurnCreatureActionsPhase = 'turnCreatureActionsPhase',
	TurnEndPhase = 'turnEndPhase',

	// Effects
	DrawFocus = 'drawFocus'
}

/** Terminal status of a procedure execution. */
export type ProcedureStatus = 'ongoing' | 'complete' | 'cancelled';

/** State for a procedure execution. */
export interface ProcedureState {
	/**
	 * The current step of the procedure. The procedure executes the corresponding logic
	 * from the {@link ProcedureDefinition#steps} map, which should update this field to
	 * progress through the procedure.
	 *
	 * The engine normalizes this to `undefined` before invoking callbacks, so
	 * `{ ...state, field: x }` auto-advances. Callbacks only set `step` for
	 * explicit stay/jump. All journal entries carry a resolved concrete step.
	 */
	step?: string;

	/**
	 * Execution status:
	 * - `'ongoing'` — procedure is still running (default).
	 * - `'complete'` — finished successfully; engine pops and resumes parent.
	 * - `'cancelled'` — aborted (e.g. invalid target, immobilised); engine props and
	 *   parent's {@link CallStep#then} decides whether to propagate or ignore.
	 */
	status: ProcedureStatus;

	/**
	 * The full game state snapshot at this step.
	 */
	game: ReadonlyGameState;
}

/**
 * Properties for the {@link ProcedureDefinition} constructor.
 */
export interface ProcedureDefinitionProps<S extends ProcedureState> {
	/**
	 * A unique identifier for this procedure.
	 */
	id: ProcedureId;

	/**
	 * The discrete steps that the procedure is composed of.
	 * Each value can be a {@link Step} instance, a plain function
	 * (automatically wrapped in a {@link ComputeStep}), or a
	 * {@link ProcedureDefinition} (automatically wrapped in a {@link CallStep}).
	 */
	steps: Record<string, Step<S> | ((state: S) => S | undefined) | ProcedureDefinition<any>>;

	/**
	 * Default initial state for the procedure. Can be overriden by caller-provided
	 * parameters.
	 */
	defaults?: Partial<S> | ((game: ReadonlyGameState) => Partial<S>);
}

/**
 * Definition of a procedure, which the engine executes against an append-only journal.
 *
 * A procedure is a collection of steps, each with logic that updates the procedure
 * state and advances to the next step. The engine processes steps sequentially,
 * appending a {@link JournalEntry} for each one. When it hits an {@link InputStep} it
 * pauses — the caller inspects the latest journal entry to determine what input is
 * needed, collects it, and calls {@link supplyInput} to resume.
 *
 * ## Encapsulation
 *
 * Every procedure knows its own sensible defaults (e.g. `effectIndex: 0`). Callers
 * should NOT set these — they are internal implementation details. Use
 * {@link createState} with only the fields that vary per invocation:
 *
 * ```typescript
 * procedure.createState(game, { subjectId: 'plr1', capabilityRef: myRef });
 * ```
 */
export class ProcedureDefinition<S extends ProcedureState> {
	/**
	 * A unique identifier for this procedure.
	 */
	readonly id: ProcedureId;

	/**
	 * The discrete steps that the procedure is composed of.
	 */
	readonly steps: Record<string, Step<S>>;

	/**
	 * Default initial state for the procedure. Can be overriden by caller-provided
	 * parameters.
	 */
	private readonly _defaultsFactory: (game: ReadonlyGameState) => Partial<S>;

	/** First step in insertion order, used by {@link createState}. */
	private readonly _firstStep: string;

	constructor({ id, steps, defaults }: ProcedureDefinitionProps<S>) {
		this.id = id;
		this.steps = mapToRecord(steps, {
			mapValues: (step) =>
				isProcedureDefinition(step)
					? new CallStep({ procedureId: step.id })
					: typeof step === 'function'
						? new ComputeStep({ logic: step as unknown as (state: S) => S | undefined })
						: step
		}) as Record<string, Step<S>>;

		const stepKeys = Object.keys(this.steps);
		if (stepKeys.length === 0) {
			throw new Error('ProcedureDefinition must have at least one step.');
		}
		this._firstStep = stepKeys[0];
		this._defaultsFactory =
			typeof defaults === 'function' ? defaults : () => defaults ?? ({} as Partial<S>);
	}

	/**
	 * Creates the initial {@link ProcedureState} for this procedure.
	 *
	 * Applies the procedure's internal defaults first, then the caller's
	 * `parameters` on top. Callers should only provide invocation-specific
	 * fields — never internal bookkeeping like loop indices.
	 *
	 * @param game - The game state snapshot at invocation time.
	 * @param parameters - Invocation-specific fields (e.g. `subjectId`).
	 */
	createState(game: ReadonlyGameState, parameters?: Partial<S>): S {
		return {
			step: this._firstStep,
			status: 'ongoing',
			game,
			...this._defaultsFactory(game),
			...parameters
		} as S;
	}
}
