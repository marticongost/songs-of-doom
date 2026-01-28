import { Effect } from './effect';

/**
 * Props for configuring a ModifyDamageEffect.
 */
export interface ModifyDamageEffectProps {
	/** The amount to modify the damage by. Positive values increase damage, negative values decrease it. */
	amount: number;
}

/**
 * An effect that modifies the damage dealt by an attack.
 */
export class ModifyDamageEffect extends Effect {
	/** The amount to modify the damage by. Positive values increase damage, negative values decrease it. */
	readonly amount: number;

	constructor({ amount }: ModifyDamageEffectProps) {
		super();
		this.amount = amount;
	}
}
