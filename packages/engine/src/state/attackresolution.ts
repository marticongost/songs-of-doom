import type { Property, Result } from '@songsofdoom/game';
import type { CapabilityRef } from './cardstate';
import { mutate } from './entitystatemutation';
import type { EntityId } from './identifiers';
import {
	TestResolution,
	type MutableTestResolution,
	type ReadonlyTestResolution,
	type TestResolutionProps
} from './testresolution';

export interface AttackResolutionProps extends TestResolutionProps {
	defenderId: EntityId;
	damageModifier?: number;
	negated?: boolean;
}

export interface defenderIdtatus {
	defense: number;
}

export abstract class AttackResolution extends TestResolution {
	readonly defenderId: EntityId;
	readonly damageModifier: number;
	readonly negated: boolean;

	constructor({ defenderId, damageModifier, negated, ...baseProps }: AttackResolutionProps) {
		super(baseProps);
		this.defenderId = defenderId;
		this.damageModifier = damageModifier ?? 0;
		this.negated = negated ?? false;
	}
}

export class ReadonlyAttackResolution extends AttackResolution implements ReadonlyTestResolution {
	mutable(): MutableAttackResolution {
		return new MutableAttackResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			defenderId: this.defenderId,
			properties: this.properties,
			result: this.result,
			additionalReactions: this.additionalReactions,
			damageModifier: this.damageModifier,
			negated: this.negated
		});
	}

	mutate(change: (state: MutableAttackResolution) => void): ReadonlyAttackResolution {
		return mutate(this as ReadonlyAttackResolution, change);
	}
}

export class MutableAttackResolution extends AttackResolution implements MutableTestResolution {
	declare proficiency: number;
	declare defenderId: EntityId;
	declare properties: Array<Property>;
	declare result?: Result;
	declare damageModifier: number;
	declare negated: boolean;
	declare additionalReactions?: Array<CapabilityRef>;

	/** Appends a reaction to the test's additional reactions list. */
	addReaction(reaction: CapabilityRef): void {
		if (!this.additionalReactions) {
			this.additionalReactions = [];
		}
		this.additionalReactions.push(reaction);
	}

	readonly(): ReadonlyAttackResolution {
		return new ReadonlyAttackResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			defenderId: this.defenderId,
			properties: this.properties,
			result: this.result,
			additionalReactions: this.additionalReactions,
			damageModifier: this.damageModifier,
			negated: this.negated
		});
	}
}
