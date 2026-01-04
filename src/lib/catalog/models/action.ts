import { Capability, type CapabilityProps } from './capability';

/** A capability that is deliberately activated by a player during their turn. */
export class Action extends Capability {
	constructor(props: CapabilityProps) {
		super(props);
	}
}
