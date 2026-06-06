import { Effect } from './effect';

/**
 * An effect that discards the card triggering the effect.
 */
export class DiscardEffect extends Effect {
	/*override async apply(gameGraph: GameGraph) {
		await gameGraph.mutate((state) => {
			state.requireActiveCard().moveToTopOfDiscardPile(state);
		});
	}*/
}

/**
 * Creates an effect that discards the card triggering the effect.
 */
export const discard = (): DiscardEffect => new DiscardEffect();
