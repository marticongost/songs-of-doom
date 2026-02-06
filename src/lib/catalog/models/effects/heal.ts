import type { ScalarExpressionType } from '$lib/catalog/models/expressions';
import { finalise } from '$lib/modelling';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a HealEffect.
 */
export interface HealEffectProps {
	/** The amount of damage to remove from the target. */
	amount: ScalarExpressionType;
	/** Who benefits from the healing. Defaults to self. */
	target?: TargetSpec;
}

/**
 * An effect that removes damage from a target.
 */
export class HealEffect extends Effect {
	/** The amount of damage to remove from the target. */
	readonly amount: ScalarExpressionType;
	/** Who benefits from the healing. */
	readonly target: Target;

	constructor({ amount, target = 'self' }: HealEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}
}
