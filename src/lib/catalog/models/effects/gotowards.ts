import { finalise } from '$lib/modelling';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for {@link GoTowardsEffect}.
 */
export interface GoTowardsEffectProps {
	/** The entity being moved. If omitted, defaults to the effect's context. */
	target?: TargetSpec;
	/** The destination towards which the target moves. */
	destination: TargetSpec;
}

/**
 * Changes the location of the target to the destination.
 * This does not count as moving for game rule purposes.
 */
export class GoTowardsEffect extends Effect {
	/** The entity being moved. */
	readonly target?: Target;
	/** The destination towards which the target moves. */
	readonly destination: Target;

	constructor({ target, destination }: GoTowardsEffectProps) {
		super();
		this.target = finalise(Target, target);
		this.destination = finalise(Target, destination)!;
	}
}
