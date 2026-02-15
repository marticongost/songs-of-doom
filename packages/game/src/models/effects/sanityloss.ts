import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a SanityLossEffect.
 */
export interface SanityLossEffectProps {
	/** The amount of sanity the target loses. */
	amount: ScalarExpressionType;
	/** Who loses sanity. Defaults to the current subject. */
	target?: TargetSpec;
}

/**
 * An effect that causes the target to lose sanity.
 */
export class SanityLossEffect extends Effect {
	/** The amount of sanity the target loses. */
	readonly amount: ScalarExpressionType;
	/** Who loses sanity. */
	readonly target?: Target;

	constructor({ amount, target }: SanityLossEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}
}
