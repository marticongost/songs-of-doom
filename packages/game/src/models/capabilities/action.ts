import { Capability, type CapabilityProps } from '../capability';

export interface ActionProps extends CapabilityProps {
	fast?: boolean;
	prioritary?: boolean;
}

/** A capability that is deliberately activated by a player during their turn. */
export class Action extends Capability {
	/** Any number of fast actions can be performed instantly before or after the player's
	 * normal action.
	 */
	readonly fast: boolean;

	/**
	 * Prioaritary actions must be performed before any other actions, if possible.
	 */
	readonly prioritary: boolean;

	constructor({ fast, prioritary, ...baseProps }: ActionProps) {
		super(baseProps);
		this.fast = fast ?? false;
		this.prioritary = prioritary ?? false;
	}
}
