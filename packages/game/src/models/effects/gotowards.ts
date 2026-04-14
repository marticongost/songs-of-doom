import { finalise } from '@songsofdoom/common';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for {@link GoTowardsEffect}.
 */
export interface GoTowardsEffectProps {
	/** The destination towards which the target moves. */
	destination: TargetSpec;
}

/**
 * Changes the location of the target to the destination.
 * This does not count as moving for game rule purposes.
 */
export class GoTowardsEffect extends Effect {
	/** The destination towards which the target moves. */
	readonly destination: Target;

	constructor({ destination }: GoTowardsEffectProps) {
		super();
		this.destination = finalise(Target, destination)!;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<GoTowardsEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates a go-towards effect. */
export const goTowards = (destinationOrProps: TargetSpec | GoTowardsEffectProps): GoTowardsEffect =>
	new GoTowardsEffect(
		'destination' in (destinationOrProps as GoTowardsEffectProps)
			? (destinationOrProps as GoTowardsEffectProps)
			: { destination: destinationOrProps as TargetSpec }
	);
