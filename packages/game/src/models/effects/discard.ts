import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * An effect that discards the card triggering the effect.
 */
export class DiscardEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<DiscardEffect>(this, (state) => {
			state.requireActiveCard().moveToTopOfDiscardPile(state);
		});
	}
}

/**
 * Creates an effect that discards the card triggering the effect.
 */
export const discard = (): DiscardEffect => new DiscardEffect();
