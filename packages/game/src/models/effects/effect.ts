import { type GameGraph } from '../game/gamegraph';
import type { StatType } from '../stats';

export const BeforeTest = -1;
export const DuringTest = 0;
export const AfterTest = 1;

export type EffectTestTiming = typeof BeforeTest | typeof DuringTest | typeof AfterTest;

export abstract class Effect {
	readonly testTiming: EffectTestTiming = AfterTest;

	setStat(_stat: StatType, currentValue: number): number {
		return currentValue;
	}

	setInitiative(currentValue: number): number {
		return currentValue;
	}

	setConcentration(currentValue: number): number {
		return currentValue;
	}

	abstract apply(gameGraph: GameGraph): Promise<void>;
}
