import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import type { EntityId } from '../game/identifiers';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a RecoverSanityEffect.
 */
export interface RecoverSanityEffectProps {
	/** The amount of sanity to restore to the target. */
	amount: ScalarExpressionType;

	/** Who benefits from the sanity recovery. Defaults to the current subject. */
	target?: TargetSpec;
}

export interface RecoverSanityOutcome {
	/** The amount of sanity that was restored. */
	readonly amount: number;

	/** The entity that received the sanity recovery. */
	readonly targetId: EntityId;
}

/**
 * An effect that removes sanity loss from a target.
 */
export class RecoverSanityEffect extends Effect {
	/** The amount of sanity to restore to the target. */
	readonly amount: ScalarExpressionType;
	/** Who benefits from the sanity recovery. */
	readonly target?: Target;

	constructor({ amount, target }: RecoverSanityEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}

	override async apply(gameGraph: GameGraph): Promise<void> {
		const targetId = this.target
			? await gameGraph.requestSingleTarget(this.target)
			: gameGraph.requireSubject().id;

		gameGraph.mutate((state) => {
			const amount = state.evaluate(this.amount);
			const target = state.requireEntityState(targetId) as { mentalTrauma: number };
			const actualAmount = Math.min(amount, target.mentalTrauma);
			target.mentalTrauma -= actualAmount;
			return { amount: actualAmount, targetId } satisfies RecoverSanityOutcome;
		});
	}
}

const isScalar = (v: ScalarExpressionType | RecoverSanityEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a recover sanity effect. */
export const recoverSanity = (
	amountOrProps: ScalarExpressionType | RecoverSanityEffectProps
): RecoverSanityEffect =>
	new RecoverSanityEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
