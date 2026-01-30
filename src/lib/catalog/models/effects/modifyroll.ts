import type { ScalarExpression } from '../expressions';
import { Effect } from './effect';

export interface ModifyRollEffectProps {
	modifier: ScalarExpression;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: ScalarExpression;

	constructor({ modifier }: ModifyRollEffectProps) {
		super();
		this.modifier = modifier;
	}
}
