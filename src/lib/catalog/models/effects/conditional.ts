import type { Condition } from '../conditions';
import { Effect, type EffectProps } from './effect';

export interface ConditionalEffectProps extends EffectProps {
	cases: Case[];
	default?: Effect;
}

export interface Case {
	condition: Condition;
	effects: Effect[];
}

export class ConditionalEffect extends Effect {
	readonly cases: Case[];
	readonly default?: Effect;

	constructor({ cases, default: defaultEffect, properties }: ConditionalEffectProps) {
		super({ properties });
		this.cases = cases;
		this.default = defaultEffect;
	}
}
