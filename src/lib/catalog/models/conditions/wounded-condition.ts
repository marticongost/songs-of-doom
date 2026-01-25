import { Condition } from './condition';

export type Wounds = {
	metric: 'received' | 'remaining';
	operator: '>' | '>=' | '<' | '<=' | '=';
	value: number;
};

export interface WoundedConditionProps {
	wounds?: Wounds;
}

/**
 * A condition that triggers when the subject has received one or more wounds.
 */
export class WoundedCondition extends Condition {
	readonly wounds: Wounds;

	constructor({ wounds }: WoundedConditionProps) {
		super();
		this.wounds = wounds ?? { metric: 'received', operator: '>=', value: 1 };
	}
}

export const WOUNDED = new WoundedCondition({});
export const FULL_HEALTH = new WoundedCondition({
	wounds: { metric: 'received', operator: '=', value: 0 }
});
