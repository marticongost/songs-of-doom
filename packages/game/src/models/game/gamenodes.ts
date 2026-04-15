import type { Capability } from '../capability';
import type { Effect, EffectOutcome } from '../effects/effect';
import type { Event } from '../event';
import type { ReadonlyGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';
import type { Field } from './playerinput';
import type { ReadonlyTestResolution } from './testresolution';

export interface GameNodeProps {
	id: number;
	parent?: GameNode;
	previous?: GameNode;
	state: ReadonlyGameState;
}

export const CHILDREN = Symbol('children');
export const NEXT = Symbol('next');

export abstract class GameNode {
	readonly id: number;
	readonly parent?: GameNode;
	readonly previous?: GameNode;
	readonly [CHILDREN]: Array<GameNode> = [];
	[NEXT]?: GameNode;
	readonly state: ReadonlyGameState;

	constructor({ id, parent, previous, state }: GameNodeProps) {
		this.id = id;
		this.parent = parent;
		this.state = state;
		this.previous = previous;
	}

	get children(): ReadonlyArray<GameNode> {
		return this[CHILDREN];
	}

	get next(): GameNode | undefined {
		return this[NEXT];
	}
}

export interface CapabilityTriggeredProps extends GameNodeProps {
	capability: Capability;
	cardId: CardId;
}

export class CapabilityTriggered extends GameNode {
	readonly capability: Capability;
	readonly cardId: CardId;

	constructor({ capability, cardId, ...baseProps }: CapabilityTriggeredProps) {
		super(baseProps);
		this.capability = capability;
		this.cardId = cardId;
	}
}

export interface EndGroupProps extends GameNodeProps {
	/** The id of the node that opened this group. */
	groupNodeId: number;
	/** Optional test resolution that was active during this group. */
	resolution?: ReadonlyTestResolution;
}

/**
 * Signals the end of a group. Added automatically by {@link GameGraph.group} to pop
 * any contextual state (stack entries) that the group's initial node pushed.
 */
export class EndGroup extends GameNode {
	/** The id of the node that opened this group. */
	readonly groupNodeId: number;
	/** Optional test resolution that was active during this group. */
	readonly resolution?: ReadonlyTestResolution;

	constructor({ groupNodeId, resolution, ...baseProps }: EndGroupProps) {
		super(baseProps);
		this.groupNodeId = groupNodeId;
		this.resolution = resolution;
	}
}

export interface EffectGroupProps extends GameNodeProps {
	/** The effect being triggered. */
	effect: Effect;
}

/**
 * Opens a group for a triggered effect. Children contain the events and mutations
 * that make up the effect's execution. Closed by {@link EndEffectGroup}.
 */
export class EffectGroup extends GameNode {
	readonly effect: Effect;

	constructor({ effect, ...baseProps }: EffectGroupProps) {
		super(baseProps);
		this.effect = effect;
	}
}

export interface EndEffectGroupProps extends EndGroupProps {
	/** The outcome produced by the effect. */
	outcome: EffectOutcome<Effect>;
}

/**
 * Closes an {@link EffectGroup}, carrying the outcome of the effect.
 */
export class EndEffectGroup extends EndGroup {
	readonly outcome: EffectOutcome<Effect>;

	constructor({ outcome, ...baseProps }: EndEffectGroupProps) {
		super(baseProps);
		this.outcome = outcome;
	}
}

export class GameStart extends GameNode {}

export interface EffectTriggeredProps<EffectType extends Effect> extends GameNodeProps {
	effect: EffectType;
	outcome: EffectOutcome<EffectType>;
}

export class EffectTriggered<EffectType extends Effect> extends GameNode {
	readonly effect: EffectType;
	readonly outcome: EffectOutcome<EffectType>;

	constructor({ effect, outcome, ...baseProps }: EffectTriggeredProps<EffectType>) {
		super(baseProps);
		this.effect = effect;
		this.outcome = outcome;
	}
}

export interface EventTriggeredProps extends GameNodeProps {
	event: Event;
}

export class EventTriggered extends GameNode {
	readonly event: Event;

	constructor({ event, ...baseProps }: EventTriggeredProps) {
		super(baseProps);
		this.event = event;
	}
}

export interface InputRequestedProps extends GameNodeProps {
	playerId: PlayerId;
	fields: Array<Field<unknown>>;
}

export class InputRequested extends GameNode {
	readonly playerId: PlayerId;
	readonly fields: ReadonlyArray<Field<unknown>>;

	constructor({ playerId, fields, ...baseProps }: InputRequestedProps) {
		super(baseProps);
		this.playerId = playerId;
		this.fields = fields;
	}
}

export interface InputReceivedProps extends GameNodeProps {
	values: Record<string, unknown>;
}

export class InputReceived extends GameNode {
	readonly values: Readonly<Record<string, unknown>>;

	constructor({ values, ...baseProps }: InputReceivedProps) {
		super(baseProps);
		this.values = values;
	}
}

export class DrawingFate extends GameNode {}

export interface FateDrawnProps extends EndGroupProps {
	resolution: ReadonlyTestResolution;
}

export class FateDrawn extends EndGroup {
	readonly resolution: ReadonlyTestResolution;

	constructor({ resolution, ...baseProps }: FateDrawnProps) {
		super(baseProps);
		this.resolution = resolution;
	}
}
