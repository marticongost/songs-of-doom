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

	abstract trigger(gameGraph: GameGraph): Promise<void>;
}

export abstract class EffectWithOutcome<Outcome> extends Effect {
	declare readonly _outcome: Outcome;
}

export type EffectOutcome<E extends Effect> =
	E extends EffectWithOutcome<infer Outcome> ? Outcome : undefined;
