import type { Property, Result } from '../..';
import type { EntityId } from './identifiers';
import { mutate } from './mutate';
import {
	TestResolution,
	type MutableTestResolution,
	type ReadonlyTestResolution,
	type TestResolutionProps
} from './testresolution';

export interface AttackResolutionProps extends TestResolutionProps {
	defenderId: EntityId;
	baseDamage?: number;
}

export interface defenderIdtatus {
	defense: number;
}

export abstract class AttackResolution extends TestResolution {
	readonly defenderId: EntityId;
	readonly baseDamage: number;

	constructor({ defenderId, baseDamage, ...baseProps }: AttackResolutionProps) {
		super(baseProps);
		this.defenderId = defenderId;
		this.baseDamage = baseDamage ?? 0;
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
			baseDamage: this.baseDamage
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
	declare baseDamage: number;

	readonly(): ReadonlyAttackResolution {
		return new ReadonlyAttackResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			defenderId: this.defenderId,
			properties: this.properties,
			result: this.result,
			baseDamage: this.baseDamage
		});
	}
}
