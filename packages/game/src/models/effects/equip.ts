import { finalise } from '@songsofdoom/common';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Target, type ObjectTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

/** Constructor parameters for the {@link EquipEffect} class. */
export interface EquipEffectProps {
	/** The object(s) to equip. */
	target: TargetSpec<ObjectTargetType>;
}

/**
 * An effect that allows the player to change their active equipment.
 * This lets the player swap their currently equipped items during play.
 */
export class EquipEffect extends Effect {
	readonly target: Target<ObjectTargetType>;

	constructor({ target }: EquipEffectProps) {
		super();
		this.target = finalise(Target, target);
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<EquipEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that changes active equipment.
 */
export const equip = (
	target: TargetSpec<ObjectTargetType> = { type: 'object', cardinality: '1+' }
): EquipEffect => new EquipEffect({ target });
