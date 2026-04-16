import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
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

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

const isScalar = (v: ScalarExpressionType | LooseGoldEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a loose gold effect. */
export const looseGold = (
	amountOrProps: ScalarExpressionType | LooseGoldEffectProps
): LooseGoldEffect =>
	new LooseGoldEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
