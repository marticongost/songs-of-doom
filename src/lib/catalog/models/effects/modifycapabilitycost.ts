import { finalise } from '$lib/modelling';
import {
	CapabilityCost,
	scalarCapabilityCostTypes,
	type CapabilityCostProps,
	type ScalarCapabilityCostType
} from '../capabilitycost';
import { Effect, type EffectProps } from './effect';

export interface ModifyCapabilityCostEffectProps extends EffectProps {
	cost: CapabilityCost | CapabilityCostProps;
}

export interface GrouppedCapabilityCosts {
	increase?: Partial<Record<ScalarCapabilityCostType, number>>;
	decrease?: Partial<Record<ScalarCapabilityCostType, number>>;
}

export class ModifyCapabilityCostEffect extends Effect {
	readonly cost: CapabilityCost;

	constructor({ cost, properties }: ModifyCapabilityCostEffectProps) {
		super({ properties });
		this.cost = finalise(CapabilityCost, cost);
	}

	get(attribute: ScalarCapabilityCostType): number {
		return this.cost[attribute];
	}

	group(): GrouppedCapabilityCosts {
		const groups = { increase: undefined, decrease: undefined } as GrouppedCapabilityCosts;
		for (const costType of scalarCapabilityCostTypes) {
			const value = this.get(costType);
			if (value > 0) {
				groups.increase = groups.increase ?? {};
				groups.increase[costType] = value;
			} else if (value < 0) {
				groups.decrease = groups.decrease ?? {};
				groups.decrease[costType] = -value;
			}
		}
		return groups;
	}
}
