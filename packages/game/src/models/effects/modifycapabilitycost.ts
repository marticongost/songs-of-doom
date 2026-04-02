import { finalise } from '@songsofdoom/common';
import {
	CapabilityCost,
	scalarCapabilityCostTypes,
	type CapabilityCostProps,
	type ScalarCapabilityCostType
} from '../capabilitycost';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

export interface ModifyCapabilityCostEffectProps {
	cost: CapabilityCost | CapabilityCostProps;
}

export interface GrouppedCapabilityCosts {
	increase?: Partial<Record<ScalarCapabilityCostType, number>>;
	decrease?: Partial<Record<ScalarCapabilityCostType, number>>;
	dynamic?: Partial<Record<ScalarCapabilityCostType, number>>;
}

export class ModifyCapabilityCostEffect extends Effect {
	readonly cost: CapabilityCost;

	constructor({ cost }: ModifyCapabilityCostEffectProps) {
		super();
		this.cost = finalise(CapabilityCost, cost);
	}

	get(attribute: ScalarCapabilityCostType): number {
		return this.cost[attribute] as number;
	}

	group(): GrouppedCapabilityCosts {
		const groups = { increase: undefined, decrease: undefined } as GrouppedCapabilityCosts;
		for (const costType of scalarCapabilityCostTypes) {
			const value = this.get(costType);
			if (typeof value !== 'number') {
				groups.dynamic = groups.dynamic ?? {};
				groups.dynamic[costType] = value;
			} else if (value > 0) {
				groups.increase = groups.increase ?? {};
				groups.increase[costType] = value;
			} else if (value < 0) {
				groups.decrease = groups.decrease ?? {};
				groups.decrease[costType] = -value;
			}
		}
		return groups;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ModifyCapabilityCostEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates a modify capability cost effect. */
export const modifyCapabilityCost = (
	costOrProps: CapabilityCost | CapabilityCostProps | ModifyCapabilityCostEffectProps
): ModifyCapabilityCostEffect =>
	new ModifyCapabilityCostEffect(
		'cost' in costOrProps ? (costOrProps as ModifyCapabilityCostEffectProps) : { cost: costOrProps }
	);
