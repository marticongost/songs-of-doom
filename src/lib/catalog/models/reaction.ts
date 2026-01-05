import { type CapabilityProps, Capability } from './capability';
import { Event, type EventType, events } from './event';

export interface ReactionProps extends CapabilityProps {
	/** The events that can trigger this reaction. */
	triggers: Array<Event | EventType>;

	/** Indicates if the reaction is mandatory or optional.
	 *
	 * If true, the player has no say on whether the reaction is triggered - every time
	 * one of its triggers occurs, the reaction happens. If false, the reaction can be
	 * chosen to be used or not when one of its triggers occurs. If not specified, the
	 * reaction is mandatory if its cost is free, and optional otherwise.
	 */
	mandatory?: boolean;
}

/** A reaction that can be triggered by certain events. */
export class Reaction extends Capability {
	/** The events that can trigger this reaction. */
	readonly triggers: Event[];

	/** Indicates if the reaction is mandatory or optional.
	 *
	 * If true, the player has no say on whether the reaction is triggered - every time
	 * one of its triggers occurs, the reaction happens. If false, the reaction can be
	 * chosen to be used or not when one of its triggers occurs.
	 */
	readonly mandatory: boolean;

	constructor({ cost, effects, triggers, mandatory }: ReactionProps) {
		super({ cost, effects });
		this.triggers = triggers.map((event) => (typeof event === 'string' ? events[event] : event));
		this.mandatory = mandatory ?? this.cost?.isFree();
	}
}
