import type { ScalarExpression, ScalarExpressionType } from '../expressions';
import { Effect } from './effect';

export interface ModifyRollEffectProps {
	modifier: ScalarExpression;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: ScalarExpressionType;

	constructor({ modifier }: ModifyRollEffectProps) {
		super();
		this.modifier = modifier;
	}
}
