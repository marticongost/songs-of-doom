import type { ScalarExpressionType } from '../expressions';
import { Effect } from './effect';

export interface ModifyRollEffectProps {
	modifier: ScalarExpressionType;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: ScalarExpressionType;

	constructor({ modifier }: ModifyRollEffectProps) {
		super();
		this.modifier = modifier;
	}
}
