import { Entity, type EntityProps } from '../entity';
import { item, type EntityType } from '../properties';
import { slots, type Slot, type SlotType } from './slots';

export interface ItemProps extends EntityProps<Item> {
	slot: Slot | SlotType;
}

export class Item extends Entity {
	readonly slot: Slot;
	override readonly set = undefined;
	override readonly type: EntityType = item;

	constructor({ title, slot, properties, capabilities, maxCharges, goldCost }: ItemProps) {
		super({
			title,
			description: undefined,
			properties,
			capabilities,
			maxCharges,
			goldCost: goldCost ?? 0
		});
		this.slot = typeof slot === 'string' ? slots[slot] : slot;
	}
}
