import type { StatType } from '../stats';

export abstract class Effect {
	setStat(_stat: StatType, currentValue: number): number {
		return currentValue;
	}
}
