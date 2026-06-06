import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';

export interface CapabilityProps {
	id: string;
	cost?: CapabilityCost | CapabilityCostProps;
	effects: Array<Effect>;
}

export abstract class Capability {
	readonly id: string;
	readonly cost: CapabilityCost;
	readonly effects: Array<Effect>;

	constructor({ id, cost, effects }: CapabilityProps) {
		this.id = id;
		this.cost = finalise(CapabilityCost, cost ?? {});
		this.effects = effects;
	}

	constantEffects(): Array<Effect> {
		return [];
	}
}
