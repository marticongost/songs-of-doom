import type { Effect } from '@songsofdoom/game';
import type { ProcedureId, ProcedureState } from '../../core/procedure';
import { CallStep } from '../../core/steps';

export interface EffectProcedureState<E extends Effect = Effect> extends ProcedureState {
	/** The effect being processed. */
	effect: E;
}

export interface TriggerEffectProps<
	S extends ProcedureState,
	E extends Effect = Effect,
	C extends EffectProcedureState<E> = EffectProcedureState<E>
> {
	/** The effect to trigger, or a function that returns the effect based on the current state. */
	effect: E | ((state: S) => E);

	/**
	 * Additional parameters to pass to the child procedure. Can be defined statically or
	 * as a function of the parent state.
	 */
	parameters?: Partial<C> | ((state: S) => Partial<C>);

	/**
	 * Optional callback that runs after the child procedure finishes. Receives the parent
	 * and child states, and should return the new parent state to continue with. If not
	 * provided, the parent state will automatically auto-advance to the next step with no
	 * other state changes.
	 */
	then?: (state: S, childResult: any) => S;
}

/**
 * Triggers a child procedure corresponding to the given effect, passing the effect
 * as a parameter. The procedure ID is determined by convention based on the effect's
 * constructor name (see {@link getEffectProcedureId}).
 *
 * @returns A {@link CallStep} that triggers the child procedure for the effect.
 */
export function triggerEffect<
	S extends ProcedureState,
	E extends Effect = Effect,
	C extends EffectProcedureState<E> = EffectProcedureState<E>
>({ effect, parameters, then }: TriggerEffectProps<S, E, C>): CallStep<S, C> {
	// Determine the procedure ID for the effect, either immediately or dynamically based
	// on the current state.
	const procedureId =
		typeof effect === 'function'
			? (state: S) => getEffectProcedureId(effect(state))
			: getEffectProcedureId(effect);

	// Pass `effect` as a parameter to the child procedure.
	const extraParameters = parameters;
	parameters = (state: S) => {
		const aggregateParameters: Partial<C> =
			typeof extraParameters === 'function' ? extraParameters(state) : extraParameters || {};
		aggregateParameters.effect = typeof effect === 'function' ? effect(state) : effect;
		return aggregateParameters;
	};
	return new CallStep<S, C>({ procedureId, parameters, then });
}

/**
 * Determines the procedure ID for a given effect based on its class name.
 */
export const getEffectProcedureId = (effect: Effect): ProcedureId => {
	return effect.constructor.name.replace(/Effect$/, '') as ProcedureId;
};
