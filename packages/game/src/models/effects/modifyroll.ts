import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import { Effect } from './effect';

export interface ModifyRollEffectProps {
	modifier: ScalarExpressionType;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: ScalarExpressionType;
	override readonly defaultEvent = 'beforeDrawingFate';

	constructor({ modifier }: ModifyRollEffectProps) {
		super();
		this.modifier = modifier;
	}
}

const isScalar = (v: ScalarExpressionType | ModifyRollEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a modify roll effect. */
export const modifyRoll = (
	modifierOrProps: ScalarExpressionType | ModifyRollEffectProps
): ModifyRollEffect =>
	new ModifyRollEffect(isScalar(modifierOrProps) ? { modifier: modifierOrProps } : modifierOrProps);
