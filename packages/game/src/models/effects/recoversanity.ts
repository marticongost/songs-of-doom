import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
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

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<RecoverSanityEffect>(this, (_state: MutableGameState) => {
			// TODO
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
