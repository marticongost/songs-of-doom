import { Capability, type CapabilityProps } from './capability';
import { Event, type EventType, events } from './event';

export interface ReactionProps extends CapabilityProps {
	/** The events that can trigger this reaction. */
	triggers: Array<Event | EventType>;
}

/** A reaction that can be triggered by certain events. */
export abstract class Reaction extends Capability {
	/** The events that can trigger this reaction. */
	readonly triggers: Event[];

	/** Indicates if the reaction is mandatory or optional.
	 *
	 * If true, the player has no say on whether the reaction is triggered - every time
	 * one of its triggers occurs, the reaction happens. If false, the reaction can be
	 * chosen to be used or not when one of its triggers occurs.
	 */
	abstract readonly mandatory: boolean;

	constructor({ cost, effects, triggers }: ReactionProps) {
		super({ cost, effects });
		this.triggers = triggers.map((event) => (typeof event === 'string' ? events[event] : event));
	}
}

/** A reaction that must be performed when triggered. */
export class Obligation extends Reaction {
	override readonly mandatory = true;
}

/** A reaction that may be performed when triggered. */
export class Opportunity extends Reaction {
	override readonly mandatory = false;
}
