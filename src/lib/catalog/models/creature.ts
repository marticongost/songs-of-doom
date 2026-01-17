import creature from '../data/properties/creature';
import { Entity, type EntityProps, type EntityType } from './entity';
import type { Property } from './properties';
import type { AttributeType } from './stats';
import type { Trait } from './trait';

export type CreatureStatType = AttributeType | 'health';

// TODO: Hostility
export interface CreatureProps extends EntityProps {
	stats: Record<CreatureStatType, number>;
}

export class Creature extends Entity {
	override readonly type: EntityType = 'creature';
	override readonly archetype: Trait | undefined = undefined;
	readonly stats: Record<CreatureStatType, number>;

	constructor({ stats, ...baseProps }: CreatureProps) {
		super(baseProps);
		this.stats = stats;
	}

	protected override getImplicitProperties(): Array<Property> {
		return [creature, ...super.getImplicitProperties()];
	}
}
