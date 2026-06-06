import { Effect } from './effect';

/**
 * An effect that completely negates all damage from an attack, reducing it to zero.
 * This effect cancels any incoming damage before it is applied.
 */
export class NegateDamageEffect extends Effect {
	/*
	override async apply(gameGraph: GameGraph) {
		gameGraph.mutate((state) => {
			const woundRes = state.getActiveWoundResolution();
			if (woundRes) {
				woundRes.negated = true;
			} else {
				const attackRes = state.getActiveTestResolution();
				if (attackRes instanceof MutableAttackResolution) {
					attackRes.negated = true;
				}
			}
		});
	}
	*/
}

/**
 * Creates an effect that negates damage.
 */
export const negateDamage = (): NegateDamageEffect => new NegateDamageEffect();
