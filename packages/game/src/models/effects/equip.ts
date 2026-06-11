import { finalise } from '@songsofdoom/common';
import { Target, type ItemTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

/** Constructor parameters for the {@link EquipEffect} class. */
export interface EquipEffectProps {
	/** The object(s) to equip. */
	target: TargetSpec<ItemTargetType>;
}

/**
 * An effect that allows the player to change their active equipment.
 * This lets the player swap their currently equipped items during play.
 */
export class EquipEffect extends Effect {
	readonly target: Target<ItemTargetType>;

	constructor({ target }: EquipEffectProps) {
		super();
		this.target = finalise(Target, target);
	}
}

/**
 * Creates an effect that changes active equipment.
 */
export const equip = (
	target: TargetSpec<ItemTargetType> = { type: 'item', cardinality: '1+' }
): EquipEffect => new EquipEffect({ target });
