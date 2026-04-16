import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
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

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

const isScalar = (
	v: ScalarExpressionType | ModifyGatheredCluesEffectProps
): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a modify gathered clues effect. */
export const modifyGatheredClues = (
	amountOrProps: ScalarExpressionType | ModifyGatheredCluesEffectProps
): ModifyGatheredCluesEffect =>
	new ModifyGatheredCluesEffect(
		isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps
	);
