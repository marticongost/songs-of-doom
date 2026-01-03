import type { Effect } from './effects';

export type Capability = Action | Reaction;

export interface Action {
	action: CapabilityBase;
}

export interface Reaction {
	reaction: CapabilityBase & {
		trigger: Event;
	};
}

export type Event = 'attacking' | 'defending' | 'enemeyDefeated' | 'payingCapability';

interface CapabilityBase {
	cost: CapabilityCost;
	effects: Array<Effect>;
}

interface CapabilityCost {
	strength?: number;
	agility?: number;
	intelligence?: number;
	charisma?: number;
	exhaust?: boolean;
}
