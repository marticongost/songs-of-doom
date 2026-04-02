import { finalise } from '@songsofdoom/common';
import { Target, type PlayerTargetType, type SkillTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

export type DiscardFromHandSelection = 'owner' | 'random';

/**
 * Props for configuring a DiscardFromHandEffect.
 */
export interface DiscardFromHandEffectProps {
	/** The cards to discard. */
	cards: TargetSpec<SkillTargetType>;

	/** Which players are affected by the effect. */
	players?: TargetSpec<PlayerTargetType>;
}

/**
 * An effect that discards cards from the hand of the target.
 */
export class DiscardFromHandEffect extends Effect {
	/** The cards to discard. */
	readonly cards: Target<SkillTargetType>;

	/** Which players are affected by the effect. */
	readonly players?: Target<PlayerTargetType>;

	constructor({ cards, players }: DiscardFromHandEffectProps) {
		super();
		this.cards = finalise(Target, cards);
		this.players = finalise(Target, players);
	}
}

/** Creates an effect that discards cards from hand. */
export const discardFromHand = (
	props: DiscardFromHandEffectProps = { cards: { cardinality: 1 } }
): DiscardFromHandEffect => new DiscardFromHandEffect(props);
