import type { EventType } from '../event';
import { type GameGraph } from '../game/gamegraph';
import type { StatType } from '../stats';

export abstract class Effect {
	/**
	 * Default event this effect should be triggered on when wrapped in a
	 * {@link TestReactionEffect} via {@link testObligation} or {@link testOpportunity}
	 * without an explicit event. Effects that only make sense at a single point
	 * in the test lifecycle should set this.
	 */
	readonly defaultEvent?: EventType;

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
