import { Entity, type EntityProps } from '../entity';
import { item, type EntityType } from '../properties';
import type { Talent } from '../talent';
import { slots, type Slot, type SlotType } from './slots';

export interface ItemProps extends EntityProps<Item> {
	slot: Slot | SlotType;
	requiredTalent?: Talent;
}

export class Item extends Entity {
	readonly slot: Slot;
	readonly requiredTalent?: Talent;
	override readonly set = undefined;
	override readonly type: EntityType = item;

	constructor({
		title,
		slot,
		properties,
		capabilities,
		maxCharges,
		goldCost,
		requiredTalent
	}: ItemProps) {
		super({
			title,
			description: undefined,
			properties,
			capabilities,
			maxCharges,
			goldCost: goldCost ?? 0
		});
		this.slot = typeof slot === 'string' ? slots[slot] : slot;
		this.requiredTalent = requiredTalent;
	}
}
