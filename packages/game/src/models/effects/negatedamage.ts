import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that completely negates all damage from an attack, reducing it to zero.
 * This effect cancels any incoming damage before it is applied.
 */
export class NegateDamageEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<NegateDamageEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that negates damage.
 */
export const negateDamage = (): NegateDamageEffect => new NegateDamageEffect();
