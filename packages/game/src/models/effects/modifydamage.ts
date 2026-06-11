import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import { Effect } from './effect';

/**
 * Props for configuring a ModifyDamageEffect.
 */
export interface ModifyDamageEffectProps {
	/** The amount to modify the damage by. Positive values increase damage, negative values decrease it. */
	amount: ScalarExpressionType;
}

/**
 * An effect that modifies the damage dealt by an attack.
 */
export class ModifyDamageEffect extends Effect {
	override readonly defaultEvent = 'afterDrawingFate';

	/** The amount to modify the damage by. Positive values increase damage, negative values decrease it. */
	readonly amount: ScalarExpressionType;

	constructor({ amount }: ModifyDamageEffectProps) {
		super();
		this.amount = amount;
	}

	/*
	override async apply(gameGraph: GameGraph) {
		gameGraph.mutate((state) => {
			const woundRes = state.getActiveWoundResolution();
			if (woundRes) {
				woundRes.damageModifier += state.evaluateScalar(this.amount);
			} else {
				const attackRes = state.getActiveTestResolution();
				if (attackRes instanceof MutableAttackResolution) {
					attackRes.damageModifier += state.evaluateScalar(this.amount);
				}
			}
		});
	}
	*/
}

const isScalar = (v: ScalarExpressionType | ModifyDamageEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a modify damage effect. */
export const modifyDamage = (
	amountOrProps: ScalarExpressionType | ModifyDamageEffectProps
): ModifyDamageEffect =>
	new ModifyDamageEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
