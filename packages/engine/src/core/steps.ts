/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PlayerId } from '../state/identifiers';
import type { Field } from './input';
import { type ProcedureId, type ProcedureState, ProcedureDefinition } from './procedure';

/** Each of the discrete steps in a {@link ProcedureDefinition procedure}. */
export abstract class Step<S extends ProcedureState> {}

// === Compute step ===

export interface ComputeStepProps<S extends ProcedureState> {
	/**
	 * Computes the next procedure state.
	 *
	 * Receives the **full** current procedure state (not just `game`), so
	 * logic can read procedure fields like loop indices, configuration, etc.
	 *
	 * @returns The next state (may change `step` for non-sequential jumps),
	 * or `undefined` to auto-advance to the next step in insertion order.
	 */
	logic: (state: S) => S | undefined;
}

export class ComputeStep<S extends ProcedureState> extends Step<S> {
	logic: (state: S) => S | undefined;
	constructor({ logic }: ComputeStepProps<S>) {
		super();
		this.logic = logic;
	}
}

// === Input shape helper ===

/**
 * Derives the expected input payload shape from an array of {@link Field} definitions.
 *
 * Maps each field's `name` to its value type, respecting the `required` flag:
 * - `required: true` (default) → `T` — player must provide a value
 * - `required: false` → `T | null` — player may explicitly choose nothing
 *
 * `undefined` is never part of the input shape — it represents the pre-input
 * state of optional {@link ProcedureState} fields.
 *
 * @example
 * ```typescript
 * const fields = [new TargetField({ name: 'target', target: ... }), new BooleanField({ name: 'confirm', required: false })] as const;
 * type Shape = FieldsShape<typeof fields>;
 * // Shape = { target: EntityId[]; confirm: boolean | null }
 * ```
 */
export type FieldsShape<Fields extends ReadonlyArray<Field<any, string, boolean>>> = {
	[F in Fields[number] as F['name']]: F extends Field<infer T, string, infer R>
		? R extends true
			? T
			: T | null
		: never;
};

/** Union of field-name literal types from an array of {@link Field} definitions. */
export type FieldNames<Fields extends ReadonlyArray<Field<any, string, boolean>>> =
	Fields[number]['name'];

// === Input step ===

/**
 * Properties for creating an {@link InputStep}.
 *
 * Fields can be static (known at design time) or dynamic (computed from
 * runtime state). In either case, `then` receives the current procedure
 * state and the player's supplied values, and must return the next state
 * (setting the next `step`, merging input values, etc.).
 *
 * @example
 * ```typescript
 * // Single field, static
 * input({
 *   fields: [new TargetField({ name: 'destinationId', target: ... })],
 *   then: (state, inputs) => ({ ...state, step: 'next', destinationId: inputs.destinationId })
 * });
 *
 * // Multiple fields, static
 * input({
 *   fields: [new TargetField({ name: 'target', ... }), new BooleanField({ name: 'confirm' })] as const,
 *   then: (state, inputs) => ({ ...state, step: 'next', ...inputs })
 * });
 *
 * // Single field, dynamic (depends on runtime state)
 * input({
 *   fields: (state) => [new TargetField({ name: 'target', target: state.someTarget })],
 *   then: (state, inputs) => ({ ...state, step: 'next', target: inputs.target })
 * });
 *
 * // Multiple fields, dynamic
 * input({
 *   fields: (state) => [new TargetField({ name: 'target', ... }), new ResultField({ name: 'result' })],
 *   then: (state, inputs) => ({ ...state, step: 'next', ...inputs })
 * });
 * ```
 */
export interface InputStepProps<
	S extends ProcedureState,
	Fields extends ReadonlyArray<Field<any, string, boolean>>
> {
	/**
	 * Field definitions — either a static array or a factory that receives
	 * the current procedure state and returns the field definitions.
	 *
	 * Use `as const` on static arrays to preserve literal name/value types
	 * for {@link FieldsShape} inference.
	 */
	fields: Fields | ((state: S) => Fields);

	/**
	 * Called when the player supplies input values.
	 *
	 * Receives the current procedure state and the collected input values
	 * (keyed by field name). Must return the next state — set `step` to
	 * the next step id, merge any relevant input values, and set `status`
	 * to `'complete'` if this is the last step.
	 *
	 * If not set, defaults to applying all fields to the state and advancing to the next
	 * step.
	 */
	then?: (state: S, inputs: FieldsShape<Fields>) => S;

	/**
	 * Optionally specify the player to request input from. If omitted, defaults to the
	 * active player.
	 */
	playerId?: PlayerId;
}

/**
 * A step that requests input from a player.
 *
 * Use the `input` helper from {@link instructions} to create instances with
 * pre-bound state type.
 */
export class InputStep<
	S extends ProcedureState,
	const Fields extends ReadonlyArray<Field<any, string, boolean>> = ReadonlyArray<
		Field<any, string, boolean>
	>
> extends Step<S> {
	/** Produces the field definitions, potentially using runtime state. */
	private readonly _fieldsFactory: (state: S) => Fields;

	/** Called when the player supplies input. Returns the next state. */
	readonly then: (state: S, inputs: FieldsShape<Fields>) => S;

	/**
	 * The player to request input from. If omitted, defaults to the active player.
	 */
	readonly playerId?: PlayerId;

	constructor({ fields, then, playerId }: InputStepProps<S, Fields>) {
		super();
		this._fieldsFactory = typeof fields === 'function' ? fields : () => fields;
		this.then = then ?? ((state, inputs) => ({ ...state, ...inputs, step: undefined }));
		this.playerId = playerId;
	}

	/** Returns the field definitions for the given state snapshot. */
	getFields(state: S): Fields {
		return this._fieldsFactory(state);
	}
}

// === Call step ===

export interface CallStepProps<S extends ProcedureState, C extends ProcedureState> {
	/** Id of the procedure to invoke, or a function producing it from parent state. */
	procedureId: ProcedureId | ((state: S) => ProcedureId);

	/**
	 * Invocation-specific parameters for the child procedure.
	 *
	 * The engine resolves the target {@link ProcedureDefinition}, then calls
	 * `definition.createState(game, parameters)`. The procedure applies its
	 * own internal defaults, so callers only provide fields that vary per
	 * invocation (e.g. `{ effect }`, `{ amount }`).
	 *
	 * Pass a plain object for static parameters, or a function `(state) => ({…})`
	 * when parameters depend on the parent state.
	 *
	 * Omit when the procedure's own defaults are sufficient.
	 */
	parameters?: Partial<C> | ((state: S) => Partial<C>);

	/**
	 * Called when the child procedure finishes (status 'complete' or 'cancelled').
	 * Returns the parent state to continue with.
	 */
	then?: (state: S, childResult: C) => S;
}

export class CallStep<S extends ProcedureState, C extends ProcedureState> extends Step<S> {
	readonly procedureId: ProcedureId | ((state: S) => ProcedureId);
	readonly parameters: (state: S) => Partial<C>;
	readonly then: (state: S, childResult: C) => S;

	constructor({ procedureId, parameters, then }: CallStepProps<S, C>) {
		super();
		this.procedureId = procedureId;
		this.parameters =
			parameters === undefined || parameters === null
				? () => ({})
				: typeof parameters === 'function'
					? parameters
					: () => parameters;
		this.then = then ?? ((state) => state);
	}
}

// === Dispatch step ===

/**
 * Properties for creating a {@link DispatchStep}.
 */
export interface DispatchStepProps<S extends ProcedureState> {
	/**
	 * Factory that receives the current procedure state and returns the
	 * {@link Step} to execute in its place.
	 *
	 * The returned step is executed immediately — no journal entry is created
	 * for the dispatch itself. Only the resolved step's execution is recorded.
	 *
	 * The factory **must** be deterministic from state so that replay (e.g.
	 * resuming after an {@link InputStep} pause) produces the same step.
	 *
	 * Can return any step type, including another {@link DispatchStep} for
	 * composition, or a {@link CallStep} (via {@link dynamicCall}) to delegate
	 * to a child procedure.
	 */
	factory: (state: S) => Step<S>;
}

/**
 * A step that delegates to another step decided at runtime.
 *
 * Unlike {@link CallStep}, which invokes a child procedure with its own
 * journal entries, `DispatchStep` runs the produced step **inline** within
 * the same procedure — no extra journal entry, no parent-child relationship.
 *
 * Use the `dispatch` helper from {@link instructions} to create instances with
 * pre-bound state type.
 *
 * @example
 * ```typescript
 * const { dispatch } = instructions<MyState>();
 *
 * // Conditional input: ask the player only when needed
 * maybeAskPlayer: dispatch((state) =>
 *     state.needsConfirmation
 *         ? new InputStep({ ... })
 *         : new ComputeStep({ logic: (s) => ({ ...s, step: 'next' }) })
 * )
 * ```
 */
export class DispatchStep<S extends ProcedureState> extends Step<S> {
	readonly factory: (state: S) => Step<S>;

	constructor({ factory }: DispatchStepProps<S>) {
		super();
		this.factory = factory;
	}
}

// === ForEach step ===

/**
 * State type for loop body steps.
 *
 * Replaces the parent procedure's `step` field with the body's `BodyStepId`
 * union so that body step transitions are validated — returning
 * `step: 'invalid'` is a compile error.
 */
export type ForEachBodyState<S extends ProcedureState, BodyStepId extends string> = Omit<
	S,
	'step'
> & { step: BodyStepId };

/**
 * Properties for creating a {@link ForEachStep}.
 *
 * @typeParam N — Name of a field on `S` that holds the current item each iteration.
 *              Must be a key of `S` whose value type is the iteration item type.
 * @typeParam BodyStepId — Union of step IDs in the loop body.
 *
 * @example
 * ```typescript
 * forEach({
 *   name: 'currentEnemy',
 *   items: (state) => state.enemies,
 *   where: (state, enemy) => !enemy.isDefeated,
 *   steps: {
 *     process: compute((state) => ({ ...state, step: 'done' }))
 *   },
 *   then: (state) => ({ ...state, step: 'done' })
 * });
 * ```
 */
export interface ForEachStepProps<
	S extends ProcedureState,
	N extends keyof S & string,
	BodyStepId extends string
> {
	/**
	 * Name of the state attribute to set with the current item each iteration.
	 * Must be a declared field on `S`. The engine sets `state[name]` to the
	 * current item (of type `S[N]`) before each body iteration.
	 */
	name: N;

	/** Extracts the list of items to iterate over. Called once at loop entry. */
	items: (state: S) => readonly S[N][];

	/**
	 * Optional filter — items that don't match are skipped.
	 * Re-evaluated each iteration so game state changes can affect inclusion.
	 *
	 * Declared as a method signature so callbacks with narrower item types
	 * are accepted even when `N` is not fully inferred (bivariance).
	 */
	where?(state: S, item: S[N]): boolean;

	/**
	 * The loop body steps. They receive the same state type `S` as the parent,
	 * with `state[name]` set to the current item by the engine.
	 *
	 * Body step IDs must be distinct from the parent procedure's step IDs.
	 * Each value can be a {@link Step} instance or a {@link ProcedureDefinition}
	 * (automatically wrapped in a {@link CallStep}).
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	steps: Record<BodyStepId, Step<ForEachBodyState<S, BodyStepId>> | ProcedureDefinition<any>>;

	/**
	 * Called when all items have been processed.
	 * Defaults to marking the procedure complete if omitted.
	 */
	then?: (state: S) => S;
}

/**
 * A step that iterates over a list of items, executing inline body steps
 * for each one.
 *
 * The engine sets `state[name]` to the current item on each iteration. The parent procedure stays
 * at the `ForEachStep` while the body runs — it only advances when all items
 * are exhausted and {@link then} produces the next state.
 *
 * Use the `forEach` helper from {@link instructions} to create instances with
 * pre-bound state type and automatic inference of `N` from `name`.
 */
export class ForEachStep<
	S extends ProcedureState,
	N extends keyof S & string,
	BodyStepId extends string
> extends Step<S> {
	readonly name: N;
	readonly items: (state: S) => readonly S[N][];
	readonly where?: (state: S, item: S[N]) => boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly steps: Record<BodyStepId, Step<any>>;
	readonly then?: (state: S) => S;

	constructor({ name, items, where, steps, then }: ForEachStepProps<S, N, BodyStepId>) {
		super();
		this.name = name;
		this.items = items;
		this.where = where;
		// Wrap plain functions in ComputeStep and ProcedureDefinition in CallStep,
		// matching ProcedureDefinition behaviour.
		const wrapped: Record<string, Step<any>> = {};
		for (const [key, step] of Object.entries(steps)) {
			wrapped[key] = isProcedureDefinition(step)
				? new CallStep({ procedureId: step.id })
				: typeof step === 'function'
					? new ComputeStep({ logic: step as (state: any) => any })
					: (step as Step<any>);
		}
		this.steps = wrapped as Record<BodyStepId, Step<any>>;
		this.then = then;
	}

	/** The first body step in insertion order. */
	get firstBodyStep(): BodyStepId {
		return Object.keys(this.steps)[0] as BodyStepId;
	}

	/**
	 * Returns the next body step after `current` in insertion order,
	 * or `undefined` if `current` is the last step.
	 */
	nextBodyStep(current: BodyStepId): BodyStepId | undefined {
		const keys = Object.keys(this.steps) as BodyStepId[];
		const idx = keys.indexOf(current);
		return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : undefined;
	}
}

/** Type guard / runtime check for {@link ProcedureDefinition}. */
export function isProcedureDefinition(value: unknown): value is ProcedureDefinition<any> {
	return value instanceof ProcedureDefinition;
}
