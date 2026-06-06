import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
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

	/*
	override async apply(gameGraph: GameGraph): Promise<void> {
		const targetId = await gameGraph.requestSingleTarget(this.target, {
			default: 'current-subject'
		});

		if (targetId) {
			gameGraph.mutate((state) => {
				const amount = state.evaluate(this.amount);
				const target = state.requireEntityState(targetId) as { physicalTrauma: number };
				const actualAmount = Math.min(amount, target.physicalTrauma);
				target.physicalTrauma -= actualAmount;
				return { amount: actualAmount, targetId } satisfies HealOutcome;
			});
		}
	}
	*/
}

const isScalar = (v: ScalarExpressionType | HealEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a heal effect. */
export const heal = (amountOrProps: ScalarExpressionType | HealEffectProps): HealEffect =>
	new HealEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
