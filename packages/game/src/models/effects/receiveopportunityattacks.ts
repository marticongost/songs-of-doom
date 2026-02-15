import { Effect } from './effect';

/**
 * Properties for creating a ReceiveOpportunityAttacksEffect.
 */
export interface ReceiveOpportunityAttacksEffectProps {
	/**
	 * A list of effects that will be applied to the opportunity attacks.
	 * These effects can alter damage, add properties, or change other aspects of the attacks.
	 */
	effects?: Array<Effect>;
}

/**
 * Allows every enemy engaged with the active subject to attack them.
 * This effect enables opportunity attacks from all engaged enemies, with the specified
 * effects applied to each attack (e.g., bonus damage, additional properties).
 */
export class ReceiveOpportunityAttacksEffect extends Effect {
	/**
	 * The list of effects applied to each opportunity attack.
	 * These effects alter the attack's behavior, such as adding bonus damage,
	 * changing hit properties, or applying additional effects.
	 */
	readonly effects: Array<Effect>;

	constructor({ effects }: ReceiveOpportunityAttacksEffectProps = {}) {
		super();
		this.effects = effects ?? [];
	}
}
