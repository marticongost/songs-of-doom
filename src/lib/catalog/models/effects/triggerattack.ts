import { Effect } from './effect';

export type TriggerAttackCard = 'any' | 'this';

/**
 * Properties for creating a TriggerAttackEffect.
 */
export interface TriggerAttackEffectProps {
	/**
	 * A list of modifier effects that will be applied to the triggered attack action.
	 * These modifiers can alter damage, add properties, or change other aspects of the attack.
	 */
	modifiers?: Array<Effect>;

	/**
	 * Specifies which cards are eligible for the triggered attack action.
	 */
	card?: TriggerAttackCard;
}

/**
 * Allows a player to trigger any of their attack actions with optional modifiers.
 * This effect enables reactive or follow-up attacks, such as counter-attacks or
 * opportunity attacks, with the specified modifiers applied to the triggered attack.
 */
export class TriggerAttackEffect extends Effect {
	/**
	 * The list of modifier effects applied to the triggered attack action.
	 * These modifiers alter the attack's behavior, such as adding bonus damage,
	 * changing hit properties, or applying additional effects.
	 */
	readonly modifiers: Array<Effect>;

	/**
	 * Specifies which cards are eligible for the triggered attack action.
	 */
	readonly card: TriggerAttackCard;

	constructor({ modifiers, card }: TriggerAttackEffectProps = {}) {
		super();
		this.modifiers = modifiers ?? [];
		this.card = card ?? 'any';
	}
}
