import { finalise } from '@songsofdoom/common';
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
}

/**
 * Singleton instance for changing active equipment.
 */
export const equip = new EquipEffect({ target: { type: 'object', cardinality: '1+' } });
