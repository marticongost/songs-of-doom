/* eslint-disable @typescript-eslint/no-explicit-any */
import type { JournalEntry } from './journal';
import type { ProcedureDefinition, ProcedureId, ProcedureState } from './procedure';
import { CallStep, ComputeStep, DispatchStep, ForEachStep, InputStep, type Step } from './steps';

type ProcedureRegistry = Partial<Record<ProcedureId, ProcedureDefinition<any>>>;

/**
 * Drives procedure execution against an append-only journal.
 *
 * Loop bodies: {@link ForEachStep} body steps are stored in the same journal
 * as top-level entries, distinguished by {@link JournalEntry._loopParentStepId}
 * and {@link JournalEntry._loopQueue} — no separate stack needed.
 */
export class Engine {
	private _journal: JournalEntry[];
	readonly procedureRegistry: ProcedureRegistry;

	private constructor(procedureRegistry: ProcedureRegistry, journal: JournalEntry[]) {
		this.procedureRegistry = procedureRegistry;
		this._journal = journal;
	}

	get journal(): ReadonlyArray<JournalEntry> {
		return this._journal;
	}

	get currentEntry(): JournalEntry | undefined {
		return this._journal.at(-1);
	}

	static create(
		procedureRegistry: ProcedureRegistry,
		procedureId: ProcedureId,
		initialState: ProcedureState
	): Engine {
		if (!procedureRegistry[procedureId]) {
			throw new Error(`Cannot create engine: unknown procedure "${procedureId}".`);
		}
		return new Engine(procedureRegistry, [{ procedureId, state: initialState }]);
	}

	static fromJSON(procedureRegistry: ProcedureRegistry, json: EngineSnapshot): Engine {
		return new Engine(procedureRegistry, [...json.journal]);
	}

	run(): boolean {
		while (true) {
			const entry = this.currentEntry;
			if (!entry) return true;

			const { procedureId, state } = entry;

			// --- Terminal state ---
			if (state.status !== 'ongoing') {
				if (entry.parentIndex !== undefined) {
					this._resumeParent(entry.parentIndex, state);
					continue;
				}
				return true;
			}

			// --- Resolve step source ---
			let step: Step<any>;
			let stepMap: Record<string, Step<any>>;
			let onComplete: (s: ProcedureState) => void;

			if (this._isLoopBodyStep(entry)) {
				const forEachStep = this._resolveForEachStep(entry);
				if (state.step === undefined) {
					// Auto-advance signal from a nested loop completion —
					// advance to the next iteration of this loop.
					this._advanceLoopIteration(forEachStep, state);
					continue;
				}
				step = forEachStep.steps[state.step!];
				stepMap = forEachStep.steps;
				onComplete = (s) => this._advanceLoopIteration(forEachStep, s);
			} else {
				const procedure = this._requireProcedure(procedureId);
				step = procedure.steps[state.step!];
				stepMap = procedure.steps;
				onComplete = (s) =>
					this._journal.push({
						procedureId,
						state: { ...s, status: 'complete' } as ProcedureState
					});
			}

			// --- Resolve DispatchStep chains ---
			step = this._resolveStep(step, state);

			// --- Dispatch ---
			if (step instanceof ComputeStep) {
				const result = step.logic({ ...state, step: undefined });
				this._processStepResult(procedureId, state, result, stepMap, onComplete);
			} else if (step instanceof InputStep) {
				return false;
			} else if (step instanceof CallStep) {
				this.executeCallStep(step, state);
			} else if (step instanceof ForEachStep) {
				this._enterForEachStep(step, state);
			} else {
				throw new Error(`Engine invariant: unknown step at "${procedureId}.${state.step}".`);
			}
		}
	}

	// -------------------------------------------------------------------
	// Step resolution
	// -------------------------------------------------------------------

	/**
	 * Unwraps {@link DispatchStep} chains to find the concrete step to execute.
	 *
	 * The factory on each `DispatchStep` receives the current procedure state
	 * and must be deterministic — see {@link DispatchStepProps.factory}.
	 */
	private _resolveStep(step: Step<any>, state: ProcedureState): Step<any> {
		while (step instanceof DispatchStep) {
			step = step.factory(state);
		}
		return step;
	}

	// -------------------------------------------------------------------
	// Step result processing
	// -------------------------------------------------------------------

	private _requireProcedure(id: ProcedureId): ProcedureDefinition<any> {
		const p = this.procedureRegistry[id];
		if (!p) throw new Error(`Engine invariant: unknown procedure "${id}".`);
		return p;
	}

	private _processStepResult(
		procedureId: ProcedureId,
		state: ProcedureState,
		result: ProcedureState | undefined,
		stepMap: Record<string, Step<any>>,
		onComplete: (s: ProcedureState) => void
	): void {
		if (result === undefined || result.step === undefined) {
			const base = result ?? state;
			const next = this._nextStepKey(stepMap, state.step!);
			if (next !== undefined) {
				this._journal.push({
					procedureId,
					state: { ...base, step: next, status: 'ongoing' } as ProcedureState
				});
			} else {
				onComplete(base);
			}
			return;
		}
		this._journal.push({ procedureId, state: result as ProcedureState });
	}

	private _nextStepKey(stepMap: Record<string, unknown>, current: string): string | undefined {
		const keys = Object.keys(stepMap);
		const idx = keys.indexOf(current);
		return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : undefined;
	}

	// -------------------------------------------------------------------
	// Loop body helpers
	// -------------------------------------------------------------------

	private _isLoopBodyStep(entry: JournalEntry): boolean {
		if (!entry._loopParentStepId) return false;
		// step: undefined means auto-advance — still a body step, the
		// dispatch will call _advanceLoopIteration directly.
		if (entry.state.step === undefined) return true;
		const forEachStep = this._resolveForEachStep(entry);
		return entry.state.step! in forEachStep.steps;
	}

	private _resolveForEachStep(entry: JournalEntry): ForEachStep<any, any, any> {
		const parentStepId = entry._loopParentStepId!;

		// Try top-level procedure steps first.
		const topStep = this._requireProcedure(entry.procedureId).steps[parentStepId];
		if (topStep instanceof ForEachStep) return topStep;

		// Walk journal backwards to find the containing ForEachStep
		// (needed for nested loops, where the parent is itself a body step
		// of an outer ForEachStep).
		const idx = this._journal.indexOf(entry);
		for (let i = idx - 1; i >= 0; i--) {
			const candidate = this._journal[i];
			if (candidate._loopParentStepId) {
				const container = this._resolveForEachStep(candidate);
				const step = container.steps[parentStepId];
				if (step instanceof ForEachStep) return step;
			}
		}

		throw new Error(`Engine invariant: _loopParentStepId "${parentStepId}" is not a ForEachStep.`);
	}

	private _enterForEachStep(step: ForEachStep<any, any, any>, state: ProcedureState): void {
		const parentStepId = state.step;
		const allItems = step.items(state);
		const queue: unknown[] = step.where
			? allItems.filter((item) => step.where!(state, item))
			: [...allItems];

		if (queue.length === 0) {
			const ns = step.then
				? step.then(state)
				: ({ ...state, status: 'complete' } as ProcedureState);
			this._journal.push({
				procedureId: this.currentEntry!.procedureId,
				state: ns as ProcedureState
			});
			return;
		}

		const currentItem = queue.shift();
		this._journal.push({
			procedureId: this.currentEntry!.procedureId,
			state: {
				...state,
				[step.name]: currentItem,
				step: step.firstBodyStep,
				status: 'ongoing'
			} as ProcedureState,
			_loopParentStepId: parentStepId,
			_loopQueue: queue
		});
	}

	private _advanceLoopIteration(step: ForEachStep<any, any, any>, bodyState: ProcedureState): void {
		const entry = this.currentEntry!;
		const queue = (entry._loopQueue ?? []) as unknown[];
		const where = step.where;

		let nextItem: unknown | undefined;
		while (queue.length > 0) {
			const c = queue.shift()!;
			if (!where || where(bodyState, c)) {
				nextItem = c;
				break;
			}
		}

		const procedureId = entry.procedureId;

		if (nextItem === undefined) {
			const ns = step.then
				? step.then({ ...bodyState, step: entry._loopParentStepId!, game: bodyState.game })
				: ({
						...bodyState,
						step: entry._loopParentStepId!,
						game: bodyState.game,
						status: 'complete'
					} as ProcedureState);

			// Find the containing loop's entry so we can carry forward
			// its _loopQueue and _loopParentStepId.
			const idx = this._journal.indexOf(entry);
			let containerEntry: JournalEntry | undefined;
			for (let i = idx - 1; i >= 0; i--) {
				const c = this._journal[i];
				if (c._loopParentStepId && c.state.step === entry._loopParentStepId) {
					containerEntry = c;
					break;
				}
			}

			this._journal.push({
				procedureId,
				state: {
					...ns,
					// For nested loops, signal auto-advance in the containing
					// loop instead of staying at this loop's own step ID.
					step: containerEntry ? undefined : ns.step
				} as ProcedureState,
				_loopParentStepId: containerEntry?._loopParentStepId,
				_loopQueue: containerEntry?._loopQueue
			});
			return;
		}

		this._journal.push({
			procedureId,
			state: {
				...bodyState,
				[step.name]: nextItem,
				step: step.firstBodyStep,
				status: 'ongoing'
			} as ProcedureState,
			_loopParentStepId: entry._loopParentStepId,
			_loopQueue: queue
		});
	}

	// -------------------------------------------------------------------
	// CallStep
	// -------------------------------------------------------------------

	private executeCallStep(step: CallStep<any, any>, parentState: ProcedureState): void {
		const pid =
			typeof step.procedureId === 'function' ? step.procedureId(parentState) : step.procedureId;
		const proc = this._requireProcedure(pid);
		const child = proc.createState(parentState.game, step.parameters(parentState));
		this._journal.push({
			procedureId: pid,
			state: child as ProcedureState,
			parentIndex: this._journal.length - 1
		});
	}

	private _resumeParent(parentIndex: number, childState: ProcedureState): void {
		const parentEntry = this._journal[parentIndex];
		const parentStepId = parentEntry.state.step;

		let parentStep: Step<any>;
		if (parentEntry._loopParentStepId) {
			parentStep = this._resolveForEachStep(parentEntry).steps[parentStepId!];
		} else {
			parentStep = this._requireProcedure(parentEntry.procedureId).steps[parentStepId!];
		}

		if (!(parentStep instanceof CallStep)) {
			throw new Error(`Engine invariant: parent step "${parentStepId}" is not a CallStep.`);
		}

		const result = parentStep.then({ ...parentEntry.state, step: undefined }, childState);
		this._journal.push({ procedureId: parentEntry.procedureId, state: result as ProcedureState });
	}

	// -------------------------------------------------------------------
	// Input
	// -------------------------------------------------------------------

	supplyInput(input: Record<string, unknown>): void {
		const last = this.currentEntry;
		if (!last) throw new Error('Cannot supply input: journal is empty.');

		const { procedureId, state } = last;

		// --- Resolve step source ---
		let step: Step<any>;
		let stepMap: Record<string, Step<any>>;
		let onComplete: (s: ProcedureState) => void;

		if (this._isLoopBodyStep(last)) {
			const forEachStep = this._resolveForEachStep(last);
			if (state.step === undefined) {
				throw new Error(
					`Loop body step is undefined — input should have been supplied to a concrete step.`
				);
			}
			step = forEachStep.steps[state.step!];
			stepMap = forEachStep.steps;
			onComplete = (s) => this._advanceLoopIteration(forEachStep, s);
		} else {
			const proc = this._requireProcedure(procedureId);
			step = proc.steps[state.step!];
			stepMap = proc.steps;
			onComplete = (s) =>
				this._journal.push({ procedureId, state: { ...s, status: 'complete' } as ProcedureState });
		}

		// --- Resolve DispatchStep chains ---
		step = this._resolveStep(step, state);

		if (!(step instanceof InputStep)) throw new Error(`Step "${state.step}" is not an InputStep.`);
		const result = step.then({ ...state, step: undefined }, input as any);
		this._processStepResult(procedureId, state, result, stepMap, onComplete);
	}

	toJSON(): EngineSnapshot {
		return { journal: [...this._journal] };
	}
}

export interface EngineSnapshot {
	readonly journal: ReadonlyArray<JournalEntry>;
}
