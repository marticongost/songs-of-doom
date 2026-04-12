import type { Capability } from '../capability';
import type { ReadonlyGameState } from './gamestate';
import type { CardId } from './identifiers';

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
}

/**
 * Signals the end of a group. Added automatically by {@link GameGraph.group} to pop
 * any contextual state (stack entries) that the group's initial node pushed.
 */
export class EndGroup extends GameNode {
	/** The id of the node that opened this group. */
	readonly groupNodeId: number;

	constructor({ groupNodeId, ...baseProps }: EndGroupProps) {
		super(baseProps);
		this.groupNodeId = groupNodeId;
	}
}
