import creature from '../data/properties/creature';
import { Entity, type EntityProps, type EntityType } from './entity';
import type { Property } from './properties';
import type { Trait } from './trait';

// TODO: Hostility
export interface CreatureProps extends EntityProps {
	health: number;
}

export class Creature extends Entity {
	override readonly type: EntityType = 'creature';
	override readonly archetype: Trait | undefined = undefined;
	readonly health: number;

	constructor({ health, ...baseProps }: CreatureProps) {
		super(baseProps);
		this.health = health;
	}

	protected override getImplicitProperties(): Array<Property> {
		return [creature, ...super.getImplicitProperties()];
	}
}
