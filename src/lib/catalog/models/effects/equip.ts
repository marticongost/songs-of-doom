import { Effect } from './effect';

/**
 * An effect that allows the player to change their active equipment.
 * This lets the player swap their currently equipped items during play.
 */
export class EquipEffect extends Effect {}

/**
 * Singleton instance for changing active equipment.
 */
export const equip = new EquipEffect();
