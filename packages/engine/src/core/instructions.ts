/* eslint-disable @typescript-eslint/no-explicit-any */
import { finalise } from '@songsofdoom/common';
import {
	Effect,
	Target,
	type EventType,
	type TargetSpec,
	type TargetType
} from '@songsofdoom/game';
import { type EmitEventState, type EventContext } from '../procedures/core/emitevent';
import { triggerEffect, type TriggerEffectProps } from '../procedures/core/triggereffect';
import type { MutableGameState } from '../state/gamestate';
import type { EntityId, PlayerId } from '../state/identifiers';
import { EntitiesField, EntityField, type Field } from './input';
import {
	ProcedureDefinition,
	type ProcedureDefinitionProps,
	type ProcedureState
} from './procedure';
import { ProcedureId } from './procedureid';
import {
	CallStep,
	ComputeStep,
	DispatchStep,
	ForEachStep,
	InputStep,
	Step,
	type ForEachStepProps,
	type InputStepProps
} from './steps';

/** Base state for effect-specific procedures. */
export interface EffectProcedureState<E extends Effect = Effect> extends ProcedureState {
	effect: E;
}

/**
 * Discriminates the object form `{ procedure, parameters?, then? }` from a
 * direct {@link ProcedureDefinition} or factory function.
 */
function isCallOptions(
	arg: unknown
): arg is { procedure: unknown; parameters?: unknown; then?: unknown } {
	return (
		arg !== null &&
		typeof arg === 'object' &&
		!Array.isArray(arg) &&
		'procedure' in arg &&
		typeof (arg as any).procedure !== 'undefined'
	);
}

/**
 * Pre-binds the state type `S` and returns a collection of factory functions
 * where `S` is already fixed. This eliminates the need to repeat type parameters
 * like `forEach<MyState, 'field'>` — `N` is inferred from `props.name`.
 *
 * @example
 * ```typescript
 * interface MyProcState extends ProcedureState { player?: ReadonlyPlayerState; }
 *
 * const { define, forEach, input } = instructions<MyProcState>();
 *
 * export const myProc = define({
 *   id: ProcedureId.MyProc,
 *   steps: {
 *     loop: forEach({
 *       name: 'player',
 *       items: (state) => state.game.players,
 *       where: (_state, player) => !player.defeated,
 *       steps: {
 *         ask: input({ fields: (state) => [...], then: (state) => ({ ...state, step: 'done' }) }),
 *       },
 *     }),
 *   },
 * });
 * ```
 */
export function instructions<S extends ProcedureState>() {
	return {
		/**
		 * Defines a new {@link ProcedureDefinition procedure} that operates on the given
		 * state.
		 */
		define: (props: ProcedureDefinitionProps<S>) => new ProcedureDefinition(props),

		/**
		 * Defines a procedure step that iterates over a list of items.
		 */
		forEach: <const N extends keyof S & string>(props: ForEachStepProps<S, N>): ForEachStep<S, N> =>
			new ForEachStep(props),

		/**
		 * Defines a step that requests input from the players.
		 */
		input: <const F extends ReadonlyArray<Field<any, string, boolean>>>(
			props: InputStepProps<S, F>
		): InputStep<S, F> => new InputStep(props),

		/**
		 * Defines a step that calls a child procedure with the given parameters and
		 * optional callback.
		 *
		 * Supports two calling conventions:
		 *
		 * **Positional form** (preferred for simple cases):
		 * ```typescript
		 * call(myProcedure)                           // just call
		 * call(myProcedure, { amount: 2 })            // with parameters
		 * call(myProcedure, { amount: 2 }, (s, r) => ({ ...s, step: 'next' }))  // with then
		 * ```
		 *
		 * **Object form** (for readability with multiple options):
		 * ```typescript
		 * call({ procedure: myProcedure, parameters: { amount: 2 }, then: (s, r) => ({ ...s }) })
		 * ```
		 *
		 * @param procedureOrOpts The child procedure to call or an options object.
		 * @param parameters Parameters to pass to the child procedure, either as a static
		 *  object or a function of the current state.
		 * @param then Optional callback that runs after the child procedure finishes.
		 *  Receives the parent and child states, and should return the new parent state to
		 *  continue with. If not given, the parent state auto-advances to the next step
		 *  with no other state changes.
		 */
		call: ((
			procedureOrOpts:
				| ProcedureDefinition<any>
				| ((state: S) => ProcedureDefinition<any>)
				| {
						procedure: ProcedureDefinition<any> | ((state: S) => ProcedureDefinition<any>);
						parameters?: Record<string, unknown> | ((state: S) => Record<string, unknown>);
						then?: (state: S, childResult: any) => S;
				  },
			parameters?: Record<string, unknown> | ((state: S) => Record<string, unknown>),
			then?: (state: S, childResult: any) => S
		): CallStep<S, any> => {
			if (isCallOptions(procedureOrOpts)) {
				const { procedure, parameters: p, then: t } = procedureOrOpts;
				return new CallStep({
					procedureId:
						typeof procedure === 'function' ? (state) => procedure(state).id : procedure.id,
					parameters: p,
					then: t
				});
			}
			return new CallStep({
				procedureId:
					typeof procedureOrOpts === 'function'
						? (state) => procedureOrOpts(state).id
						: procedureOrOpts.id,
				parameters,
				then
			});
		}) as {
			<C extends ProcedureState>(
				procedure: ProcedureDefinition<C> | ((state: S) => ProcedureDefinition<C>)
			): CallStep<S, C>;
			<C extends ProcedureState>(
				procedure: ProcedureDefinition<C> | ((state: S) => ProcedureDefinition<C>),
				parameters: Partial<C> | ((state: S) => Partial<C>)
			): CallStep<S, C>;
			<C extends ProcedureState>(
				procedure: ProcedureDefinition<C> | ((state: S) => ProcedureDefinition<C>),
				parameters: Partial<C> | ((state: S) => Partial<C>),
				then: (state: S, childResult: any) => S
			): CallStep<S, C>;
			<C extends ProcedureState>(opts: {
				procedure: ProcedureDefinition<C> | ((state: S) => ProcedureDefinition<C>);
				parameters?: Partial<C> | ((state: S) => Partial<C>);
				then?: (state: S, childResult: any) => S;
			}): CallStep<S, C>;
		},

		/**
		 * Defines a step that dispatches another step based on the current state.
		 *
		 * The `factory` function receives the current state and should return:
		 * - A {@link Step} instance (e.g. from `input()`, `call()`, another `dispatch()`).
		 * - A plain function `(state) => state` — automatically wrapped in
		 *   {@link ComputeStep} (same as top-level steps in
		 *   {@link ProcedureDefinition}).
		 * - A plain state object — automatically wrapped in {@link ComputeStep} with
		 *   `logic: () => obj`.
		 *
		 * This auto-wrapping matches the behaviour of {@link ProcedureDefinition} and
		 * {@link ForEachStep} constructors.
		 */
		dispatch: (factory: (state: S) => Step | ((state: S) => S | undefined) | S): DispatchStep<S> =>
			new DispatchStep({
				factory: (state) => {
					const result = factory(state);
					if (result instanceof Step) return result;
					if (typeof result === 'function')
						return new ComputeStep({ logic: result as (s: S) => S | undefined });
					// Plain object — wrap in a ComputeStep that always returns it.
					return new ComputeStep({ logic: (state) => ({ ...state, ...result }) });
				}
			}),

		/**
		 * Triggers the child procedure for the given effect.
		 *
		 * Wraps {@link triggerEffect} with `S` pre-bound.
		 */
		triggerEffect: <E extends Effect, C extends EffectProcedureState<E>>(
			props: TriggerEffectProps<S, E, C>
		): CallStep<S, C> => triggerEffect(props),

		/** Defines a step that emits the given event. */
		emitEvent: ({
			eventType,
			eventContext
		}: {
			eventType: EventType;
			eventContext?: Partial<EventContext> | ((state: S) => Partial<EventContext>);
		}) =>
			new CallStep<S, EmitEventState>({
				procedureId: ProcedureId.EmitEvent,
				parameters: (state) => ({
					eventType,
					eventContext: typeof eventContext === 'function' ? eventContext(state) : eventContext
				})
			}),

		/**
		 * Defines a step that mutates the game state. Accepts a mutation function that
		 * receives the current state and a mutable copy of the game state, which is mutated
		 * in place. Auto-advances to the next step with the mutated game state.
		 *
		 * This is a convenience function, equivalent to:
		 * ```typescript
		 * (state: S) => {
		 *   const modified = state.game.mutate((game) => mutation(state, game));
		 *   return { ...state, game: modified };
		 * }
		 * ```
		 */
		mutateGameState: (mutation: (state: S, game: MutableGameState) => void): ((state: S) => S) => {
			return (state: S): S => {
				const modified = state.game.mutate((game) => mutation(state, game));
				return { ...state, game: modified };
			};
		},
		/**
		 * Defines a step that resolves a target and requires exactly one result, saving the
		 * result ID to the given field in the state.
		 * @param target The target to resolve.
		 * @param fieldName The name of the field in the state to save the resolved target
		 *  ID to. Must be a key of `S` and the field must be of type `T`.
		 * @param playerId The player to ask for input, if the target requires player
		 *  choice. Defaults to the active player.
		 * @returns A step that resolves the target and saves the result to the state.
		 */
		requireSingleTarget: <T extends TargetType = TargetType>(
			target: Target<T> | TargetSpec<T> | ((state: S) => Target<T> | TargetSpec<T>),
			fieldName: string & keyof S,
			playerId?: PlayerId
		): DispatchStep<S> =>
			new DispatchStep<S>({
				factory: (state) => {
					const actualTarget: Target<T> = finalise(
						Target,
						typeof target === 'function' ? target(state) : target
					);
					const possibleTargetIds = state.game.determinePossibleTargets(actualTarget);
					let targetId: EntityId;

					if (possibleTargetIds.length < 2) {
						targetId = possibleTargetIds[0];
					} else if (actualTarget.selection === 'player-chosen') {
						return new InputStep<S, [Field<any, string, boolean>]>({
							playerId,
							fields: [
								new EntityField({
									name: fieldName,
									entities: possibleTargetIds,
									required: true
								})
							],
							then: (state, inputResult) => ({ ...state, [fieldName]: inputResult[fieldName] })
						});
					} else {
						targetId = state.game.resolveTarget(actualTarget, possibleTargetIds)[0];
					}

					return new ComputeStep<S>({ logic: (state) => ({ ...state, [fieldName]: targetId }) });
				}
			}),
		/**
		 * Defines a step that resolves a target and returns 1+ results, saving the obtained
		 * result IDs to the given field in the state.
		 * @param target The target to resolve.
		 * @param fieldName The name of the field in the state to save the resolved target
		 *  IDs to. Must be a key of `S` and the field must be of type `T[]`.
		 * @param playerId The player to ask for input, if the target requires player
		 *  choice. Defaults to the active player.
		 * @returns A step that resolves the target and saves the results to the state.
		 */
		resolveTargetList: <T extends TargetType = TargetType>(
			target: Target<T> | TargetSpec<T> | ((state: S) => Target<T> | TargetSpec<T>),
			fieldName: string & keyof S,
			playerId?: PlayerId
		): DispatchStep<S> =>
			new DispatchStep<S>({
				factory: (state) => {
					const actualTarget: Target<T> = finalise(
						Target,
						typeof target === 'function' ? target(state) : target
					);
					const possibleTargetIds = state.game.determinePossibleTargets(actualTarget);
					const min = state.game.evaluateScalar(actualTarget.cardinality.min);
					const max = state.game.evaluateScalar(actualTarget.cardinality.max);
					let targetIds: EntityId[];

					if (possibleTargetIds.length <= max) {
						targetIds = possibleTargetIds;
					} else if (actualTarget.selection === 'player-chosen') {
						return new InputStep<S, [Field<any, string, boolean>]>({
							playerId,
							fields: [
								new EntitiesField({
									name: fieldName,
									entities: possibleTargetIds,
									min,
									max
								})
							],
							then: (state, inputResult) => ({ ...state, [fieldName]: inputResult[fieldName] })
						});
					} else {
						targetIds = state.game.resolveTarget(actualTarget, possibleTargetIds);
					}

					return new ComputeStep<S>({ logic: (state) => ({ ...state, [fieldName]: targetIds }) });
				}
			})
	};
}
