import { finalise } from '@songsofdoom/common';
import { type GameGraph } from '../game/gamegraph';
import { Target, type PlayerTargetType, type SkillTargetType, type TargetSpec } from '../target';
import { EffectWithOutcome } from './effect';

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

export interface DiscardFromHandOutcome {
	/** The cards that were discarded. */
	readonly cards: number[];
}

/**
 * An effect that discards cards from the hand of the target.
 */
export class DiscardFromHandEffect extends EffectWithOutcome<DiscardFromHandOutcome> {
	/** The cards to discard. */
	readonly cards: Target<SkillTargetType>;

	/** Which players are affected by the effect. */
	readonly players?: Target<PlayerTargetType>;

	constructor({ cards, players }: DiscardFromHandEffectProps) {
		super();
		this.cards = finalise(Target, cards);
		this.players = finalise(Target, players);
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<DiscardFromHandEffect>(this, (_state) => {
			// TODO
			return { cards: [] };
		});
	}
}

/** Creates an effect that discards cards from hand. */
export const discardFromHand = (
	props: DiscardFromHandEffectProps = { cards: { cardinality: 1 } }
): DiscardFromHandEffect => new DiscardFromHandEffect(props);
