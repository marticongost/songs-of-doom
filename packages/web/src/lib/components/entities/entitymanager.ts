import type { Entity, EntityAcquisitionImpediment } from '@songsofdoom/game';

/** Manager for handling state and interactions for entities in the catalog, such as
 * showing owned copies and acquisition impediments.
 */
export interface EntityManager {
	/** Determines the number of copies of a specific entity that the character owns. */
	getNumberOfOwnedCopies(entity: Entity): number;

	/** Determines any impediments to acquiring a specific entity. */
	getAcquisitionImpediment(entity: Entity): EntityAcquisitionImpediment | undefined;

	/** Callback when an entity is added. */
	onEntityAdded: (entity: Entity) => void;

	/** Callback when an entity is removed. */
	onEntityRemoved: (entity: Entity) => void;
}
