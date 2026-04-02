import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { Result } from '../results';
import { Effect } from './effect';

/**
 * Props for configuring a SetRollResultEffect.
 */
export interface SetRollResultEffectProps {
	/** The result to assign to the current test. */
	result: Result;
}

/**
 * An effect that sets the result of a fate token draw to a given value.
 */
export class SetRollResultEffect extends Effect {
	/** The result to assign to the current test. */
	readonly result: Result;

	constructor({ result }: SetRollResultEffectProps) {
		super();
		this.result = result;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<SetRollResultEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates an effect that sets the roll result. */
export const setRollResult = (
	resultOrProps: Result | SetRollResultEffectProps
): SetRollResultEffect =>
	new SetRollResultEffect(
		typeof resultOrProps === 'object' && resultOrProps !== null
			? (resultOrProps as SetRollResultEffectProps)
			: { result: resultOrProps as Result }
	);
