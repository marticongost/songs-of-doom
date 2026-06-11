import { mutate } from './entitystatemutation';
import type { EntityId } from './identifiers';

export interface WoundResolutionProps {
	/** Id of the entity receiving the wound. */
	targetId: EntityId;

	/** Base damage after toughness and invulnerability reductions. Clamped to >= 0. */
	damageDealt: number;

	/** Cumulative delta from modifyDamage() reactions. Not clamped — may be negative. */
	damageModifier?: number;

	/** When true, damage is fully negated regardless of damageDealt or damageModifier. */
	negated?: boolean;
}

export abstract class WoundResolution {
	readonly targetId: EntityId;
	readonly damageDealt: number;
	readonly damageModifier: number;
	readonly negated: boolean;

	constructor({ targetId, damageDealt, damageModifier, negated }: WoundResolutionProps) {
		this.targetId = targetId;
		this.damageDealt = damageDealt;
		this.damageModifier = damageModifier ?? 0;
		this.negated = negated ?? false;
	}
}

export class ReadonlyWoundResolution extends WoundResolution {
	mutable(): MutableWoundResolution {
		return new MutableWoundResolution({
			targetId: this.targetId,
			damageDealt: this.damageDealt,
			damageModifier: this.damageModifier,
			negated: this.negated
		});
	}

	mutate(change: (state: MutableWoundResolution) => void): ReadonlyWoundResolution {
		return mutate(this as ReadonlyWoundResolution, change);
	}
}

export class MutableWoundResolution extends WoundResolution {
	declare targetId: EntityId;
	declare damageDealt: number;
	declare damageModifier: number;
	declare negated: boolean;

	readonly(): ReadonlyWoundResolution {
		return new ReadonlyWoundResolution({
			targetId: this.targetId,
			damageDealt: this.damageDealt,
			damageModifier: this.damageModifier,
			negated: this.negated
		});
	}
}
