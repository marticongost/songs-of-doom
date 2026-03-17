import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a RemoveChargesEffect.
 */
export interface RemoveChargesEffectProps {
	amount?: ScalarExpressionType;
	target?: TargetSpec;
}

/**
 * An effect that removes charges from a target.
 */
export class RemoveChargesEffect extends Effect {
	readonly amount?: ScalarExpressionType;
	readonly target?: Target;

	constructor({ amount, target }: RemoveChargesEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}
}

/** Creates an effect that removes charges from a target. */
export const removeCharges = (props: RemoveChargesEffectProps = {}): RemoveChargesEffect =>
	new RemoveChargesEffect(props);
