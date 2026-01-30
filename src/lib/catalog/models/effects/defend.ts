import { type ScalarExpressionType } from '../expressions';
import type { Property } from '../properties';
import { Effect } from './effect';

export interface DefendEffectProps {
	expression: ScalarExpressionType;
	properties?: Array<Property>;
}

export class DefendEffect extends Effect {
	readonly expression: ScalarExpressionType;
	readonly properties: Array<Property>;

	constructor({ expression, properties }: DefendEffectProps) {
		super();
		this.expression = expression;
		this.properties = properties ?? [];
	}
}
