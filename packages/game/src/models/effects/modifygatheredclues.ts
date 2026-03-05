import type { ScalarExpressionType } from '../expressions';
import { Effect } from './effect';

/**
 * Props for configuring a ModifyGatheredCluesEffect.
 */
export interface ModifyGatheredCluesEffectProps {
	/** The amount to modify the gathered clues by. Positive values increase clues, negative values decrease them. */
	amount: ScalarExpressionType;
}

/**
 * An effect that modifies the number of clues gathered as the result of the current action.
 */
export class ModifyGatheredCluesEffect extends Effect {
	/** The amount to modify the gathered clues by. Positive values increase clues, negative values decrease them. */
	readonly amount: ScalarExpressionType;

	constructor({ amount }: ModifyGatheredCluesEffectProps) {
		super();
		this.amount = amount;
	}
}
