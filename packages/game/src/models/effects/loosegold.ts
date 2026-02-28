import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a LooseGoldEffect.
 */
export interface LooseGoldEffectProps {
	/** The target whose gold is changed. */
	target?: TargetSpec;

	/** The relative amount of gold to gain (positive) or lose (negative). */
	amount: ScalarExpressionType;
}

/**
 * An effect that increases or decreases the gold owned by a target by a relative amount.
 */
export class LooseGoldEffect extends Effect {
	/** The target whose gold is changed. */
	readonly target?: Target;

	/** The relative amount of gold to gain (positive) or lose (negative). */
	readonly amount: ScalarExpressionType;

	constructor({ target, amount }: LooseGoldEffectProps) {
		super();
		this.target = finalise(Target, target);
		this.amount = amount;
	}
}
