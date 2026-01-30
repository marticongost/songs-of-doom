import type { BooleanExpressionType } from '../expressions/logical';
import { Effect } from './effect';

export interface ConditionalEffectProps {
	cases: Case[];
	default?: Effect;
}

export interface Case {
	condition: BooleanExpressionType;
	effects: Effect[];
}

export class ConditionalEffect extends Effect {
	readonly cases: Case[];
	readonly default?: Effect;

	constructor({ cases, default: defaultEffect }: ConditionalEffectProps) {
		super();
		this.cases = cases;
		this.default = defaultEffect;
	}
}
