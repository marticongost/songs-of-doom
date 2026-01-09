import item from '$lib/catalog/data/properties/item';
import { Entity, type EntityProps } from '../entity';
import type { Property } from '../properties';
import type { Trait } from '../trait';
import { slots, type Slot, type SlotType } from './slots';

export interface ItemProps extends EntityProps {
	slot: Slot | SlotType;
}

export class Item extends Entity {
	readonly slot: Slot;
	readonly archetype: Trait | undefined = undefined;

	constructor({ title, slot, properties, capabilities, maxCharges }: ItemProps) {
		super({ title, description: undefined, properties, capabilities, maxCharges });
		this.slot = typeof slot === 'string' ? slots[slot] : slot;
	}

	override getImplicitProperties(): Array<Property> {
		return [item];
	}
}
