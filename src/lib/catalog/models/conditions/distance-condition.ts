import { Condition } from './condition';

/**
 * Props for creating a DistanceCondition.
 */
export interface DistanceConditionProps {
	/** The maximum number of steps allowed to the target. */
	steps: number;
}

/**
 * A condition that checks if the target is within a certain distance.
 * The effect only triggers if the distance to the target is less than or equal to `steps`.
 */
export class DistanceCondition extends Condition {
	/** The maximum number of steps allowed to the target. */
	readonly steps: number;

	constructor({ steps }: DistanceConditionProps) {
		super();
		this.steps = steps;
	}
}

export const SAME_LOCATION = new DistanceCondition({ steps: 0 });
export const ADJACENT = new DistanceCondition({ steps: 1 });
