import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from '../capabilitycost';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * Props for configuring a PayEffect.
 */
export interface PayEffectProps {
	/** The cost the player must pay. */
	cost: CapabilityCost | CapabilityCostProps;
}

/**
 * An effect that instructs a player to pay the given resources.
 */
export class PayEffect extends Effect {
	/** The cost the player must pay. */
	readonly cost: CapabilityCost;

	constructor({ cost }: PayEffectProps) {
		super();
		this.cost = finalise(CapabilityCost, cost);
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<PayEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates a pay effect. */
export const pay = (
	costOrProps: CapabilityCost | CapabilityCostProps | PayEffectProps
): PayEffect =>
	new PayEffect('cost' in costOrProps ? (costOrProps as PayEffectProps) : { cost: costOrProps });
