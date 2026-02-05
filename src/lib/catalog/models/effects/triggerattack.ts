import type { BooleanExpressionType } from '../expressions';
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
	 * An optional condition that must be satisfied for the triggered attack action to be available.
	 * This allows for conditional triggering based on game state, such as only triggering if the
	 * defender has a certain property or if the attack meets specific criteria.
	 */
	condition?: BooleanExpressionType;

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
	 * An optional condition that must be satisfied for the triggered attack action to be available.
	 * This allows for conditional triggering based on game state, such as only triggering if the
	 * defender has a certain property or if the attack meets specific criteria.
	 */
	condition?: BooleanExpressionType;

	/**
	 * Specifies which cards are eligible for the triggered attack action.
	 */
	readonly card: TriggerAttackCard;

	constructor({ modifiers, condition, card }: TriggerAttackEffectProps = {}) {
		super();
		this.modifiers = modifiers ?? [];
		this.condition = condition;
		this.card = card ?? 'any';
	}
}
