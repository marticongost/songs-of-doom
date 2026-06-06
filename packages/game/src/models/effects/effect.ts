import type { EventType } from '../event';
import type { StatType } from '../stats';

export abstract class Effect {
	/**
	 * Default event this effect should be triggered on when an explicit event is not
	 * provided.
	 */
	readonly defaultEvent?: EventType;

	setStat(_stat: StatType, currentValue: number): number {
		return currentValue;
	}

	setConcentration(currentValue: number): number {
		return currentValue;
	}
}
