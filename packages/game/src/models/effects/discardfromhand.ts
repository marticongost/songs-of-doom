import { finalise } from '@songsofdoom/common';
import { type GameGraph } from '../game/gamegraph';
import type { CardId, PlayerId } from '../game/identifiers';
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

export interface DiscardFromHandOutcome {
	/** The cards that were discarded. */
	readonly playerDiscards: ReadonlyMap<PlayerId, CardId[]>;
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

	override async apply(gameGraph: GameGraph) {
		const playerIds = await gameGraph.requestPlayers(this.players, {
			default: () => [gameGraph.current.state.requireActivePlayer().id]
		});
		const playerDiscards = new Map<PlayerId, CardId[]>();
		for (const playerId of playerIds) {
			const cardIds = (await gameGraph.requestInput(this.cards)).target as CardId[];
			playerDiscards.set(playerId, cardIds);
		}
		gameGraph.mutate((state) => {
			for (const [playerId, cardIds] of playerDiscards) {
				const playerState = state.requirePlayer(playerId);
				for (const cardId of cardIds) {
					const card = playerState.requireCard(cardId);
					card.moveToTopOfDiscardPile(state);
				}
			}
			return { playerDiscards };
		});
	}
}

/** Creates an effect that discards cards from hand. */
export const discardFromHand = (
	props: DiscardFromHandEffectProps = { cards: { cardinality: 1 } }
): DiscardFromHandEffect => new DiscardFromHandEffect(props);
