import { type Expression } from '../expressions';
import type { Property } from '../properties';
import { Effect } from './effect';

export interface DefendEffectProps {
	expression: Expression;
	properties?: Array<Property>;
}

export class DefendEffect extends Effect {
	readonly expression: Expression;
	readonly properties: Array<Property>;

	constructor({ expression, properties }: DefendEffectProps) {
		super();
		this.expression = expression;
		this.properties = properties ?? [];
	}
}
