import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a HealEffect.
 */
export interface HealEffectProps {
	/** The amount of damage to remove from the target. */
	amount: ScalarExpressionType;

	/** Who benefits from the healing. Defaults to the current subject. */
	target?: TargetSpec;
}

export interface HealOutcome {
	/** The amount of damage that was healed. */
	readonly amount: number;

	/** The card that received the healing. */
	readonly targetId?: number;
}

/**
 * An effect that removes damage from a target.
 */
export class HealEffect extends Effect {
	/** The amount of damage to remove from the target. */
	readonly amount: ScalarExpressionType;
	/** Who benefits from the healing. */
	readonly target?: Target;

	constructor({ amount, target }: HealEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}

	override async apply(gameGraph: GameGraph) {
		await gameGraph.mutate((state) => {
			// TODO: Add helper to gameState to request a target or default to the current subject
			const amount = state.evaluate(this.amount);
			return { amount, targetId: undefined };
		});
	}
}

const isScalar = (v: ScalarExpressionType | HealEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a heal effect. */
export const heal = (amountOrProps: ScalarExpressionType | HealEffectProps): HealEffect =>
	new HealEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
