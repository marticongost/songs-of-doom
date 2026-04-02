import { type GameGraph } from '../game/gamegraph';
import type { StatType } from '../stats';

export abstract class Effect {
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
