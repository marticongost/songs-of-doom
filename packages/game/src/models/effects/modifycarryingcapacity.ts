import type { ScalarExpressionType } from '../expressions';
import { Effect } from './effect';

/**
 * Props for configuring a ModifyCarryingCapacityEffect.
 */
export interface ModifyCarryingCapacityEffectProps {
	/** The amount to modify the carrying capacity by. Positive values increase, negative values decrease. */
	modifier: ScalarExpressionType;
}

/**
 * An effect that modifies the player's carrying capacity for items.
 * Grants extra space for carried items (or reduces it, if negative).
 */
export class ModifyCarryingCapacityEffect extends Effect {
	/** The amount to modify the carrying capacity by. Positive values increase, negative values decrease. */
	readonly modifier: ScalarExpressionType;

	constructor({ modifier }: ModifyCarryingCapacityEffectProps) {
		super();
		this.modifier = modifier;
	}
}
