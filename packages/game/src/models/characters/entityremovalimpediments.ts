/** An impediment that prevents a character from removing an entity. */
export abstract class EntityRemovalImpediment {}

/** Indicates that the trait is standard and must be owned by all characters. */
export class StandardTraitRemovalImpediment extends EntityRemovalImpediment {}

/** Indicates that the trait is permanent and cannot be removed. */
export class PermanentTraitRemovalImpediment extends EntityRemovalImpediment {}

/** Indicates that the number of copies of the entity is already at the allowed minimum. */
export class MinimumAmountReachedRemovalImpediment extends EntityRemovalImpediment {
	readonly minCopies: number;

	constructor(minCopies: number) {
		super();
		this.minCopies = minCopies;
	}
}
