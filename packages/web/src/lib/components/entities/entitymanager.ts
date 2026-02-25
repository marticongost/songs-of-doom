import type {
	Entity,
	EntityAcquisitionImpediment,
	EntityRemovalImpediment
} from '@songsofdoom/game';

export interface AcquisitionOptions {
	/** When true, also considers acquiring any missing required archetypes recursively. */
	acquireDependencies?: boolean;
}

/** Manager for handling state and interactions for entities in the catalog, such as
 * showing owned copies and acquisition impediments.
 */
export interface EntityManager {
	/** Determines the number of copies of a specific entity that the character owns. */
	getNumberOfOwnedCopies(entity: Entity): number;

	/** Determines any impediments to acquiring a specific entity.
	 * When `acquireDependencies` is true, checks if the entity and all its required
	 * archetypes can be acquired together.
	 */
	getAcquisitionImpediment(
		entity: Entity,
		options?: AcquisitionOptions
	): EntityAcquisitionImpediment | undefined;

	/** Determines any impediments to removing a specific entity. */
	getRemovalImpediment(entity: Entity): EntityRemovalImpediment | undefined;

	/** Returns the list of entities that must be acquired before acquiring the given entity,
	 * in acquisition order (ancestors first).
	 */
	getMissingDependencies(entity: Entity): Entity[];

	/** Callback when an entity is added. */
	onEntityAdded: (entity: Entity) => void;

	/** Callback when an entity is removed. */
	onEntityRemoved: (entity: Entity) => void;
}
