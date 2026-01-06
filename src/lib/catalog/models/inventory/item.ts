import { Card, type CardProps } from '../card';
import type { Trait } from '../trait';
import { slots, type Slot, type SlotType } from './slots';

export interface ItemProps extends CardProps {
	slot: Slot | SlotType;
}

export class Item extends Card {
	readonly slot: Slot;
	readonly archetype: Trait | undefined = undefined;

	constructor({ title, slot, properties, capabilities }: ItemProps) {
		super({ title, description: undefined, properties, capabilities });
		this.slot = typeof slot === 'string' ? slots[slot] : slot;
	}
}
