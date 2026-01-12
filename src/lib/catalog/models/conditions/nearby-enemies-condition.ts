import { Condition } from './condition';

export interface NearbyEnemiesConditionProps {
	minEnemies: number;
	distance: number;
}

export class NearbyEnemiesCondition extends Condition {
	readonly minEnemies: number;
	readonly distance: number;

	constructor({ minEnemies, distance }: NearbyEnemiesConditionProps) {
		super();
		this.minEnemies = minEnemies;
		this.distance = distance;
	}
}
