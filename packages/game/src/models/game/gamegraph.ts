import { Obligation } from '../capabilities';
import type { Capability } from '../capability';
import type { Effect } from '../effects';
import type { EffectOutcome } from '../effects/effect';
import { events, type Event, type EventType } from '../event';
import { Target } from '../target';
import type { CapabilityRef } from './cardstate';
import { ReadonlyGameState, type GameStateProps, type MutableGameState } from './gamestate';
import type { CardId, TargetId } from './identifiers';
import type { Field } from './playerinput';
import { CapabilityChoiceField, TargetField } from './playerinput';

type FieldsResult<Fields extends ReadonlyArray<Field<unknown, string, boolean>>> = {
	[F in Fields[number] as F['name']]: F extends Field<infer T, string, infer R>
		? R extends true
			? T
			: T | undefined
		: never;
};

export interface GameGraphProps {
	initialState: GameStateProps;
	onChange?: () => void;
}

export class GameGraph {
	readonly start: GameStart;
	private _current: GameNode;
	private _currentParent: GameNode | undefined;
	private readonly _onChange?: () => void;
	private _inputPromise?: (values: Record<string, unknown>) => void;

	constructor({ initialState, onChange }: GameGraphProps) {
		this.start = new GameStart({ id: 0, state: new ReadonlyGameState(initialState) });
		this._current = this.start;
		this._currentParent = undefined;
		this._onChange = onChange;
	}

	get current(): GameNode {
		return this._current;
	}

	add<P extends GameNodeProps>(
		nodeType: new (props: P) => GameNode,
		props: Omit<P, 'id' | 'parent' | 'previous' | 'state'> & {
			state?: ReadonlyGameState | ((stateAlteration: MutableGameState) => void);
		}
	) {
		let state: ReadonlyGameState;
		if (props.state instanceof ReadonlyGameState) {
			state = props.state;
		} else if (typeof props.state === 'function') {
			try {
				state = this._current.state.mutate(props.state);
			} catch (e) {
				if (e instanceof GameStateMutationCancelled) {
					return;
				} else {
					throw e;
				}
			}
		} else {
			state = this._current.state;
		}

		const node = new nodeType({
			id: this._current.id + 1,
			parent: this._currentParent,
			previous: this._current,
			state,
			...props
		} as P);

		this._current[NEXT] = node;
		this._current = node;

		if (this._currentParent) {
			this._currentParent[CHILDREN].push(node);
		}

		if (this._onChange) {
			this._onChange();
		}
	}

	effectTriggered<E extends Effect>(effect: E, state: (s: MutableGameState) => EffectOutcome<E>) {
		const mutableState = this._current.state.mutable();
		let outcome: EffectOutcome<E>;
		try {
			outcome = state(mutableState);
		} catch (e) {
			if (e instanceof GameStateMutationCancelled) {
				return;
			} else {
				throw e;
			}
		}
		this.add(EffectTriggered as new (props: EffectTriggeredProps<E>) => EffectTriggered<E>, {
			effect,
			outcome,
			state
		});
	}

	async requestInput(target: Target): Promise<{ target: TargetId[] }>;
	async requestInput<const Fields extends ReadonlyArray<Field<unknown, string, boolean>>>(
		...fields: Fields
	): Promise<FieldsResult<Fields>>;
	async requestInput<const Fields extends ReadonlyArray<Field<unknown, string, boolean>>>(
		...fields: Fields | [Target]
	): Promise<FieldsResult<Fields> | { target: number[] }> {
		if (fields[0] instanceof Target) {
			return this.requestInput(new TargetField({ name: 'target', target: fields[0] }));
		}
		this.add(InputRequested, { fields: fields as unknown as Array<Field<unknown>> });
		return new Promise((resolve) => {
			this._inputPromise = resolve as (values: Record<string, unknown>) => void;
		}) as Promise<FieldsResult<Fields>>;
	}

	async supplyInput(values: Record<string, unknown>) {
		this.add(InputReceived, { values });
		if (this._inputPromise) {
			this._inputPromise(values);
			this._inputPromise = undefined;
		}
	}

	async requestSingleTargetOrActiveCard(target: Target | undefined): Promise<TargetId> {
		if (target === undefined) {
			return this._current.state.requireActiveCard().id;
		}
		const targetIds = (await this.requestInput(target)).target;
		if (targetIds.length !== 1) {
			throw new Error('Expected exactly one target to be selected');
		}
		return targetIds[0];
	}

	group(callback: () => void) {
		this.beginGroup();
		callback();
		this.endGroup();
	}

	beginGroup() {
		this._currentParent = this._current;
	}

	endGroup() {
		if (!this._currentParent) {
			throw new Error('Cannot readonly container at root level');
		}
		this._currentParent = this._currentParent.parent;
	}

	async eventTriggered(eventType: EventType) {
		const reactiveCapabilities: Set<CapabilityRef> = new Set(
			this._current.state
				.cards({ ready: true })
				.flatMap((card) =>
					card
						.getReactionsToEvent(eventType)
						.map((reaction) => ({ cardId: card.id, capability: reaction }))
				)
		);

		if (reactiveCapabilities.size > 0) {
			this.add(EventTriggered, { event: events[eventType] });
			this.group(async () => {
				while (reactiveCapabilities.size > 0) {
					const { selection } = await this.requestInput(
						new CapabilityChoiceField({
							name: 'selection',
							choices: reactiveCapabilities,
							required: Array.from(reactiveCapabilities).some(
								(capabilityRef) => capabilityRef.capability instanceof Obligation
							)
						})
					);
					if (selection === undefined) {
						break;
					}
					selection.capability.trigger({
						gameGraph: this,
						cardId: selection.cardId
					});
					reactiveCapabilities.delete(selection);
				}
			});
		}
	}
}

export interface GameNodeProps {
	id: number;
	parent?: GameNode;
	previous?: GameNode;
	state: ReadonlyGameState;
}

const CHILDREN = Symbol('children');
const NEXT = Symbol('next');

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

export class GameStart extends GameNode {}

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

export class CapabilityFinished extends GameNode {
	readonly capability: Capability;
	readonly cardId: CardId;

	constructor({ capability, cardId, ...baseProps }: CapabilityTriggeredProps) {
		super(baseProps);
		this.capability = capability;
		this.cardId = cardId;
	}
}

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
	fields: Array<Field<unknown>>;
}

export class InputRequested extends GameNode {
	readonly fields: ReadonlyArray<Field<unknown>>;

	constructor({ fields, ...baseProps }: InputRequestedProps) {
		super(baseProps);
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

/** An error indicating a game state mutation was deemed unnecessary or invalid, and
 * was rolled back.
 */
class GameStateMutationCancelled extends Error {}

/**
 * Indicates that the current game state mutation should be cancelled and rolled back.
 * This should be used by effects to signal their changes to the state are redundant
 * or not applicable.
 *
 * Example: an effect that exhausts a card might check if the card is already exhausted,
 * and if so, call `cancelMutation()` to avoid unnecessarily changing the game state
 * with a no-op mutation.
 */
export const cancelMutation = () => {
	throw new GameStateMutationCancelled();
};
