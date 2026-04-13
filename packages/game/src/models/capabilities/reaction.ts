import { finalise } from '@songsofdoom/common';
import { Capability, type CapabilityProps } from '../capability';
import { Event, events, type EventType } from '../event';
import { type BooleanExpressionType } from '../expressions';
import type { GameGraph, GroupContext } from '../game/gamegraph';
import type { CardId } from '../game/identifiers';

export type EventMatcherSpec = Event | EventType | EventMatcherProps;

export interface EventMatcherProps {
	/** Event that can activate the reaction. */
	event: Event | EventType;

	/** Optional expression that must evaluate to true for the trigger to apply. */
	condition?: BooleanExpressionType;
}

export class EventMatcher {
	/** Event that can activate the reaction. */
	readonly event: Event;

	/** Optional expression that must evaluate to true for the trigger to apply. */
	readonly condition?: BooleanExpressionType;

	constructor(spec: EventMatcherSpec) {
		if (spec instanceof Event) {
			this.event = spec;
		} else if (typeof spec === 'string') {
			this.event = events[spec];
		} else {
			this.event = typeof spec.event === 'string' ? events[spec.event] : spec.event;
			this.condition = spec.condition;
		}
	}
}

export interface ReactionProps extends CapabilityProps {
	triggers: Array<EventMatcherSpec>;
}

/** A reaction that can be triggered by certain events. */
export abstract class Reaction extends Capability {
	/** Normalized trigger specifications used by the runtime matcher. */
	readonly triggers: Array<EventMatcher>;

	/** Indicates if the reaction is mandatory or optional.
	 *
	 * If true, the player has no say on whether the reaction is triggered - every time
	 * one of its triggers occurs, the reaction happens. If false, the reaction can be
	 * chosen to be used or not when one of its triggers occurs.
	 */
	abstract readonly mandatory: boolean;

	constructor({ cost, effects, triggers }: ReactionProps) {
		super({ cost, effects });
		if (!triggers.length) {
			throw new Error('Reaction requires at least one trigger');
		}
		this.triggers = triggers.map((spec) => finalise(EventMatcher, spec));
	}

	protected override getTriggerContext(
		gameGraph: GameGraph,
		cardId: CardId
	): Partial<GroupContext> {
		const ownerId = gameGraph.current.state.requireCard(cardId).ownerId;
		return { reactiveCardId: cardId, reactivePlayerId: ownerId };
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
