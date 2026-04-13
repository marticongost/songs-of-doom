import { creature, type EntityType } from '../properties/';
import { ChildEntity, type EntityProps } from './entity';
import type { Module } from './module';
import type { AttributeType } from '../stats';

export type CreatureStatType = AttributeType | 'health';

// TODO: Hostility
export interface CreatureProps extends EntityProps<Creature> {
	stats: Record<CreatureStatType, number>;
}

export class Creature extends ChildEntity<Module> {
	override readonly type: EntityType = creature;
	override readonly reactionOrder = 3;
	readonly stats: Record<CreatureStatType, number>;

	constructor({ stats, ...baseProps }: CreatureProps) {
		super(baseProps);
		this.stats = stats;
	}
}
