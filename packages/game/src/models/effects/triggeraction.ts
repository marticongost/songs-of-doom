import { finalise } from '@songsofdoom/common';
import { Obligation, type Reaction } from '../capabilities/reaction';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export type ActionType = 'move' | 'attack' | 'investigate' | 'evade';

/**
 * Properties for creating a TriggerActionEffect.
 */
export interface TriggerActionEffectProps {
	/**
	 * The type of action to trigger. This specifies which action the player will be able
	 * to trigger.
	 */
	actionType?: ActionType;

	/**
	 * A list of modifier effects that will be applied to the triggered action.
	 * These modifiers can alter rolls, modify damage, add properties, or change other
	 * aspects of the action.
	 */
	modifiers?: Array<Effect | Reaction>;

	/**
	 * Specifies which cards are eligible for the triggered action.
	 */
	card?: TargetSpec;

	/**
	 * The target(s) of the triggered action. If not specified, the action uses
	 * regular rules for selecting the target. Only relevant to actions requiring a
	 * target (e.g. attack, move).
	 */
	target?: TargetSpec;
}

/**
 * Allows a player to trigger one of their actions with optional modifiers.
 * This effect enables reactive or follow-up actions, such as counter-attacks or
 * opportunity attacks, with the specified modifiers applied to the triggered action.
 */
export class TriggerActionEffect extends Effect {
	/**
	 * The type of action to trigger. This specifies which action the player will be able
	 * to trigger.
	 */
	actionType?: ActionType;

	/**
	 * The list of modifier effects applied to the triggered action.
	 * These modifiers alter the action's behavior, such as adding bonus damage,
	 * changing hit properties, or applying additional effects.
	 */
	readonly modifiers: Array<Reaction>;

	/**
	 * Specifies which cards are eligible for the triggered action.
	 */
	readonly card?: Target;

	/**
	 * The target(s) of the triggered action. If not specified, the action uses
	 * regular rules for selecting the target. Only relevant to actions requiring a
	 * target (e.g. attack, move).
	 */
	target?: Target;

	constructor({ actionType, modifiers, card, target }: TriggerActionEffectProps = {}) {
		super();
		this.actionType = actionType;
		this.modifiers = modifiers === undefined ? [] : modifiers.map(normaliseModifierToReaction);
		this.card = finalise(Target, card);
		this.target = finalise(Target, target);
	}
}

const normaliseModifierToReaction = (modifier: Effect | Reaction): Reaction => {
	if (modifier instanceof Effect) {
		if (!modifier.defaultEvent) {
			throw new Error(
				`Cannot use effect of type ${modifier.constructor.name} as a modifier for ` +
					`TriggerActionEffect because it does not have a defaultEvent.`
			);
		}
		return new Obligation({
			id: `${modifier.defaultEvent}:${modifier.constructor.name.replace(/Effect$/, '')}`,
			effects: [modifier],
			triggers: [{ event: modifier.defaultEvent }]
		});
	}
	return modifier;
};

/** Creates an effect that triggers an attack action. */
export const triggerAttack = (
	props: Omit<TriggerActionEffectProps, 'actionType'> = {}
): TriggerActionEffect => new TriggerActionEffect({ ...props, actionType: 'attack' });

/**
 * Creates an effect that triggers an action.
 */
export const triggerAction = (props: TriggerActionEffectProps): TriggerActionEffect =>
	new TriggerActionEffect(props);
