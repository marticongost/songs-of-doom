import { Entity, type EntityProps } from './entity';
import { ally } from './properties';
import type { StatType } from './stats';

export interface AllyProps extends EntityProps<Ally> {
	stats: Record<StatType, number>;
}

export class Ally extends Entity {
	override readonly type = ally;
	override readonly set = undefined;

	readonly stats: Record<StatType, number>;

	constructor({ stats, ...baseProps }: AllyProps) {
		super(baseProps);
		this.stats = stats;
	}
}
