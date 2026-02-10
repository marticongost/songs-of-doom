import { creature, type EntityType } from '../models/properties/';
import { Entity, type EntityProps } from './entity';
import type { AttributeType } from './stats';

export type CreatureStatType = AttributeType | 'health';

// TODO: Hostility
export interface CreatureProps extends EntityProps<Creature> {
	stats: Record<CreatureStatType, number>;
}

export class Creature extends Entity {
	override readonly type: EntityType = creature;
	override readonly set = undefined;
	readonly stats: Record<CreatureStatType, number>;

	constructor({ stats, ...baseProps }: CreatureProps) {
		super(baseProps);
		this.stats = stats;
	}
}
