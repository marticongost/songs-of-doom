import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';

export interface CapabilityProps {
	cost?: CapabilityCost | CapabilityCostProps;
	effects: Array<Effect>;
}

export abstract class Capability {
	readonly cost: CapabilityCost;
	readonly effects: Array<Effect>;

	constructor({ cost, effects }: CapabilityProps) {
		this.cost = finalise(CapabilityCost, cost ?? {});
		this.effects = effects;
	}

	constantEffects(): Array<Effect> {
		return [];
	}
}
