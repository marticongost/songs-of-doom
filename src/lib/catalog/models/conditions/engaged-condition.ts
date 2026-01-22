import { Condition } from './condition';

export interface EngagedConditionProps {
	/** Whether the target should be engaged (true) or not engaged (false). */
	status: boolean;
}

/**
 * A condition that checks whether the target is currently engaged in combat.
 * Engaged targets are those that are in melee range with one or more enemies.
 */
export class EngagedCondition extends Condition {
	/** Whether the target should be engaged (true) or not engaged (false). */
	readonly status: boolean;

	static ENGAGED: EngagedCondition = new EngagedCondition({ status: true });
	static NOT_ENGAGED: EngagedCondition = new EngagedCondition({ status: false });

	constructor({ status }: EngagedConditionProps) {
		super();
		this.status = status;
	}
}
