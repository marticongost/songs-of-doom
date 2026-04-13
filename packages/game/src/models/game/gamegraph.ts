import { groupBy } from '@songsofdoom/common';
import { Obligation } from '../capabilities';
import type { Effect } from '../effects';
import { AfterTest, BeforeTest, DuringTest, type EffectOutcome } from '../effects/effect';
import {
	normaliseEventEnvelope,
	type Event,
	type EventContext,
	type EventEnvelope,
	type EventType
} from '../event';
import type { ScalarExpressionType } from '../expressions';
import type { Property } from '../properties';
import type { Result } from '../results';
import { Target } from '../target';
import type { CapabilityRef } from './cardstate';
import {
	CHILDREN,
	EndGroup,
	GameNode,
	NEXT,
	type EndGroupProps,
	type GameNodeProps
} from './gamenodes';
import { ReadonlyGameState, type GameStateProps, type MutableGameState } from './gamestate';
import { type CardId, type EntityId, type PlayerId } from './identifiers';
import type { Field } from './playerinput';
import { CapabilityChoiceField, ResultField, TargetField } from './playerinput';
import {
	MutableTestResolution,
	type ReadonlyTestResolution,
	type TestResolutionProps
} from './testresolution';

export type GroupContext<ClosingNodeProps extends EndGroupProps = EndGroupProps> = {
	subjectId?: EntityId;
	targetId?: EntityId;
	activeCardId?: CardId;
	activePlayerId?: PlayerId;
	reactiveCardId?: CardId;
	reactivePlayerId?: PlayerId;
	resolution?: MutableTestResolution;
	openWith?: (state: MutableGameState) => void;
	closeWith?: (state: MutableGameState) => ClosingNodeExtraProps<ClosingNodeProps> | void;
	closingNodeType?: new (props: ClosingNodeProps) => GameNode;
};

type FieldsResult<Fields extends ReadonlyArray<Field<unknown, string, boolean>>> = {
	[F in Fields[number] as F['name']]: F extends Field<infer T, string, infer R>
		? R extends true
			? T
			: T | undefined
		: never;
};

type BaseNodeProps = 'id' | 'parent' | 'previous' | 'state';
type ClosingNodeExtraProps<ClosingNodeProps extends EndGroupProps> = Omit<
	ClosingNodeProps,
	BaseNodeProps | 'groupNodeId'
>;

interface OrderedReactionRef extends CapabilityRef {
	reactionOrder: number;
	ownerId?: PlayerId;
}

interface OrderedReactionGroup {
	decidingPlayerId: PlayerId;
	reactions: Array<OrderedReactionRef>;
}

export interface RequestInputOptions {
	playerId?: PlayerId;
}

type EventContextWithActivePlayer = EventContext & { activePlayerId: PlayerId };

export interface RequestSingleTargetOptions {
	playerId?: PlayerId;
	default?: () => EntityId | undefined;
}

export interface RequestSinglePlayerOptions {
	playerId?: PlayerId;
	default?: () => PlayerId | undefined;
}

export interface RequestTargetsOptions {
	playerId?: PlayerId;
	default?: () => Array<EntityId>;
}

export interface RequestPlayersOptions {
	playerId?: PlayerId;
	default?: () => Array<PlayerId>;
}

export const orderReactiveCapabilities = (
	reactions: Array<OrderedReactionRef>,
	currentPlayerId: PlayerId,
	clockwisePlayerOrder: Array<PlayerId>
): Array<OrderedReactionGroup> => {
	const groups: Array<OrderedReactionGroup> = [];
	const orderLevels = Array.from(
		new Set(reactions.map((capabilityRef) => capabilityRef.reactionOrder))
	).sort((a, b) => a - b);

	for (const orderLevel of orderLevels) {
		const sameOrder = reactions.filter(
			(capabilityRef) => capabilityRef.reactionOrder === orderLevel
		);

		const ownerless = sameOrder.filter((capabilityRef) => capabilityRef.ownerId === undefined);
		if (ownerless.length > 0) {
			groups.push({ decidingPlayerId: currentPlayerId, reactions: ownerless });
		}

		for (const playerId of clockwisePlayerOrder) {
			const sameOwner = sameOrder.filter((capabilityRef) => capabilityRef.ownerId === playerId);
			if (sameOwner.length > 0) {
				groups.push({ decidingPlayerId: playerId, reactions: sameOwner });
			}
		}
	}

	return groups;
};

export interface GameGraphProps {
	initialState: GameStateProps;
	onChange?: () => void;
}

export interface TestProps {
	/** Id of the entity performing the test. */
	subjectId: EntityId;

	/** Optional id of the entity targeted by the test. */
	targetId?: EntityId;

	/** Expression indicating the proficiency level of the test. */
	proficiency: ScalarExpressionType;

	/** Properties associated with the test. */
	properties?: Array<Property>;

	/** Optional factory function to create a the resolution object that will be used
	 * to keep track of the test's modifiers and outcome. Leave empty to use the default;
	 * override if a test requires additional book-keeping (e.g. attacks). */
	resolutionFactory?: (props: TestResolutionProps) => MutableTestResolution;

	/** Effects to trigger before, during and after the test. */
	effects?: Array<Effect>;

	/** Optional callback run before the token is drawn. */
	beforeTest?: (gameGraph: GameGraph) => void | Promise<void>;

	/** Optional callback run after the token is drawn. */
	afterTest?: (gameGraph: GameGraph) => void | Promise<void>;
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
			...props,
			state
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

	async requestInput(
		target: Target,
		options?: RequestInputOptions
	): Promise<{ target: EntityId[] }>;
	async requestInput<const Fields extends ReadonlyArray<Field<unknown, string, boolean>>>(
		fields: Fields,
		options?: RequestInputOptions
	): Promise<FieldsResult<Fields>>;
	async requestInput<const Fields extends ReadonlyArray<Field<unknown, string, boolean>>>(
		fieldsOrTarget: Fields | Target,
		options: RequestInputOptions = {}
	): Promise<FieldsResult<Fields> | { target: EntityId[] }> {
		if (fieldsOrTarget instanceof Target) {
			return this.requestInput(
				[new TargetField({ name: 'target', target: fieldsOrTarget })] as const,
				options
			) as unknown as Promise<{ target: EntityId[] }>;
		}

		const playerId =
			options.playerId ??
			this._current.state.getActivePlayer()?.id ??
			this._current.state.players[0]?.id;
		if (playerId === undefined) {
			throw new Error('Cannot request input without a player id');
		}
		this.add(InputRequested, {
			playerId,
			fields: fieldsOrTarget as unknown as Array<Field<unknown>>
		});
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

	async requestSingleTarget(
		target: Target,
		options?: RequestSingleTargetOptions
	): Promise<EntityId>;
	async requestSingleTarget(
		target: undefined,
		options: RequestSingleTargetOptions & { default: () => EntityId }
	): Promise<EntityId>;
	async requestSingleTarget(
		target?: Target,
		options?: RequestSingleTargetOptions
	): Promise<EntityId | undefined>;
	async requestSingleTarget(
		target?: Target,
		options: RequestSingleTargetOptions = {}
	): Promise<EntityId | undefined> {
		if (target === undefined) {
			return options.default?.();
		}
		const targetIds = (await this.requestInput(target, { playerId: options.playerId })).target;
		if (targetIds.length !== 1) {
			throw new Error('Expected exactly one target to be selected');
		}
		return targetIds[0];
	}

	async requestSinglePlayer(
		target: Target,
		options?: RequestSinglePlayerOptions
	): Promise<PlayerId>;
	async requestSinglePlayer(
		target: undefined,
		options: RequestSinglePlayerOptions & { default: () => PlayerId }
	): Promise<PlayerId>;
	async requestSinglePlayer(
		target?: Target,
		options?: RequestSinglePlayerOptions
	): Promise<PlayerId | undefined>;
	async requestSinglePlayer(
		target?: Target,
		options: RequestSinglePlayerOptions = {}
	): Promise<PlayerId | undefined> {
		if (target === undefined) {
			return options.default?.();
		}
		if (!target.matchesType('player')) {
			throw new Error('Expected target to be of type player');
		}
		const playerIds = (await this.requestInput(target, { playerId: options.playerId })).target;
		if (playerIds.length !== 1) {
			throw new Error('Expected exactly one target to be selected');
		}
		return playerIds[0] as PlayerId;
	}

	async requestTargets(
		target?: Target,
		options: RequestTargetsOptions = {}
	): Promise<Array<EntityId>> {
		if (target === undefined) {
			return options.default?.() ?? [];
		}
		return (await this.requestInput(target, { playerId: options.playerId })).target;
	}

	requireSubject(): { id: EntityId } {
		return this._current.state.requireSubject();
	}

	async requestPlayers(
		target?: Target,
		options: RequestPlayersOptions = {}
	): Promise<Array<PlayerId>> {
		if (target === undefined) {
			return options.default?.() ?? [];
		}
		if (!target.matchesType('player')) {
			throw new Error('Expected target to be of type player');
		}
		return (await this.requestInput(target, { playerId: options.playerId })).target as PlayerId[];
	}

	async test({
		subjectId,
		targetId,
		proficiency,
		properties,
		resolutionFactory,
		effects = [],
		beforeTest,
		afterTest
	}: TestProps): Promise<Result> {
		const factory =
			resolutionFactory ?? ((props: TestResolutionProps) => new MutableTestResolution(props));
		const resolution = factory({
			subjectId,
			proficiency,
			properties: properties ? [...properties] : []
		});

		return await this.group(
			DrawingFate,
			{},
			{ closingNodeType: FateDrawn, resolution, subjectId, targetId },
			async () => {
				const effectsByTiming = groupBy(effects, (effect) => effect.testTiming);

				await beforeTest?.(this);
				this.eventTriggered('beforeDrawingFate');
				for (const effect of effectsByTiming.get(BeforeTest) ?? []) {
					effect.trigger(this);
				}

				const { result } = await this.requestInput([new ResultField({ name: 'result' })]);
				this.eventTriggered('fateTokenRevealed');
				for (const effect of effectsByTiming.get(DuringTest) ?? []) {
					effect.trigger(this);
				}

				await afterTest?.(this);
				this.eventTriggered('afterDrawingFate');
				for (const effect of effectsByTiming.get(AfterTest) ?? []) {
					effect.trigger(this);
				}
				return result;
			}
		);
	}

	/**
	 * Opens a group, adds the initial node (just like {@link add}), runs the callback
	 * with all mutations as children of that node, appends an {@link EndGroup} node that
	 * cleans up any contextual state pushed by the initial node, then closes the group.
	 *
	 * @param nodeType - Constructor of the initial group node.
	 * @param nodeProps - Props for the initial node (same shape as {@link add}).
	 *   When `context` contains ids, their stack pushes are merged into this state mutation
	 *   automatically.
	 * @param context - Contextual identifiers to push onto the corresponding game-state
	 *   stacks before the callback runs. Each entry is popped by the automatically added
	 *   {@link EndGroup} node when the group closes.
	 * @param context.subjectId - Pushed onto `subjectStack` for the duration of the group.
	 * @param context.targetId - Pushed onto `targetStack` for the duration of the group.
	 * @param context.activeCardId - Pushed onto `activeCardStack` for the duration of the group.
	 * @param context.activePlayerId - Pushed onto `activePlayerStack` for the duration of the group.
	 * @param context.resolution - Optional test resolution to push onto `testResolutionStack`
	 *   for the duration of the group. The resolution is automatically popped and included in
	 *   the closing node props.
	 * @param context.openWith - Optional extra state mutation applied inside the initial node,
	 *   *after* any contextual stack entries are pushed. Use this for setup that depends on the
	 *   group's context being already established.
	 * @param context.closeWith - Optional extra state mutation applied inside the closing node,
	 *   *before* any contextual stack entries are popped. Use this for cleanup that still needs
	 *   the group's context to be intact (e.g. discarding the active card). It may also return
	 *   extra props for the closing node.
	 * @param context.closingNodeType - Optional closing node constructor. Defaults to
	 *   {@link EndGroup}.
	 * @param callback - Async function containing all mutations that belong to this group.
	 * @returns The value returned by `callback`.
	 */
	async group<P extends GameNodeProps, T, ClosingNodeProps extends EndGroupProps = EndGroupProps>(
		nodeType: new (props: P) => GameNode,
		nodeProps: Omit<P, BaseNodeProps> & {
			state?: ReadonlyGameState | ((stateAlteration: MutableGameState) => void);
		},
		context: GroupContext<ClosingNodeProps>,
		callback: () => Promise<T>
	): Promise<T> {
		const {
			subjectId,
			targetId,
			activeCardId,
			activePlayerId,
			reactiveCardId,
			reactivePlayerId,
			resolution,
			openWith,
			closeWith,
			closingNodeType
		} = context;
		const hasContext =
			subjectId !== undefined ||
			targetId !== undefined ||
			activeCardId !== undefined ||
			activePlayerId !== undefined ||
			reactiveCardId !== undefined ||
			reactivePlayerId !== undefined ||
			resolution !== undefined;

		// Merge context stack-pushes (and optional openWith) into the initial node's state mutation.
		const originalState = nodeProps.state;
		const needsOpenState = hasContext || openWith !== undefined;
		const mergedState: ReadonlyGameState | ((s: MutableGameState) => void) | undefined =
			needsOpenState
				? (state: MutableGameState) => {
						if (typeof originalState === 'function') originalState(state);
						if (activeCardId !== undefined) state.activeCardStack.push(activeCardId);
						if (activePlayerId !== undefined) state.activePlayerStack.push(activePlayerId);
						if (reactiveCardId !== undefined) state.reactiveCardStack.push(reactiveCardId);
						if (reactivePlayerId !== undefined) state.reactivePlayerStack.push(reactivePlayerId);
						if (targetId !== undefined) state.targetStack.push(targetId);
						if (subjectId !== undefined) state.subjectStack.push(subjectId);
						if (resolution !== undefined) state.testResolutionStack.push(resolution);
						if (openWith) openWith(state);
					}
				: originalState;

		const nodeBeforeAdd = this._current;
		this.add(nodeType, { ...nodeProps, state: mergedState } as Omit<P, BaseNodeProps> & {
			state?: ReadonlyGameState | ((s: MutableGameState) => void);
		});
		if (this._current === nodeBeforeAdd) {
			// The initial add was cancelled; skip the group.
			return undefined as T;
		}
		const groupNodeId = this._current.id;

		this.beginGroup();
		const result = await callback();

		// Add the closing node: apply closeWith first (context still intact), then pop stacks.
		const closingType = closingNodeType ?? (EndGroup as new (props: ClosingNodeProps) => GameNode);
		const needsClosingNodeState = hasContext || closeWith !== undefined;
		let closingProps: ClosingNodeExtraProps<ClosingNodeProps> | undefined;
		let closingState: ReadonlyGameState | undefined;
		if (needsClosingNodeState) {
			try {
				closingState = this._current.state.mutate((state) => {
					if (closeWith) {
						closingProps = closeWith(state) as ClosingNodeExtraProps<ClosingNodeProps> | undefined;
					}
					if (resolution !== undefined) {
						const resolvedTestResolution = state.requireActiveTestResolution().readonly();
						state.testResolutionStack.pop();
						closingProps = {
							...closingProps,
							resolution: resolvedTestResolution
						} as unknown as ClosingNodeExtraProps<ClosingNodeProps>;
					}
					if (subjectId !== undefined) state.subjectStack.pop();
					if (targetId !== undefined) state.targetStack.pop();
					if (reactivePlayerId !== undefined) state.reactivePlayerStack.pop();
					if (reactiveCardId !== undefined) state.reactiveCardStack.pop();
					if (activePlayerId !== undefined) state.activePlayerStack.pop();
					if (activeCardId !== undefined) state.activeCardStack.pop();
				});
			} catch (e) {
				if (!(e instanceof GameStateMutationCancelled)) {
					throw e;
				}
			}
		}

		this.add(closingType, {
			groupNodeId,
			...(closingState && { state: closingState }),
			...closingProps
		} as Omit<ClosingNodeProps, BaseNodeProps> & {
			state?: ReadonlyGameState | ((s: MutableGameState) => void);
		});

		this.endGroup();
		return result;
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

	async eventTriggered(eventType: EventType | EventEnvelope) {
		const normalized = normaliseEventEnvelope(eventType);
		if (!normalized.event) {
			throw new Error('Unknown event');
		}
		const inferredActivePlayerId =
			this._current.state.getActivePlayer()?.id ?? this._current.state.players[0]?.id;
		if (inferredActivePlayerId === undefined) {
			throw new Error('Cannot resolve active player when triggering an event');
		}

		const inferredContext: EventContextWithActivePlayer = {
			actorId: this._current.state.getSubject()?.id,
			subjectId: this._current.state.getSubject()?.id,
			targetId: this._current.state.getTarget()?.id,
			activePlayerId: inferredActivePlayerId,
			reactiveCardId: this._current.state.getReactiveCard()?.id,
			reactivePlayerId: this._current.state.getReactivePlayer()?.id
		};
		const eventContext: EventContextWithActivePlayer = {
			...inferredContext,
			...normalized.context,
			activePlayerId: normalized.context?.activePlayerId ?? inferredActivePlayerId
		};
		const eventEnvelope: EventEnvelope = {
			event: normalized.event,
			context: eventContext
		};

		const currentPlayerId = eventContext.activePlayerId;

		const reactiveCapabilities: Array<OrderedReactionRef> = this._current.state
			.cards({ ready: true })
			.flatMap((card) => {
				const reactionOrder = card.card.reactionOrder;
				return card.getReactionsToEvent(eventEnvelope, this._current.state).map((reaction) => ({
					cardId: card.id,
					ownerId: card.ownerId,
					reactionOrder,
					capability: reaction
				}));
			});

		if (reactiveCapabilities.length > 0) {
			const clockwisePlayerOrder = this._current.state.clockwise(currentPlayerId);

			const consumeReactions = async (
				reactions: Array<OrderedReactionRef>,
				decidingPlayerId: PlayerId
			) => {
				while (reactions.length > 0) {
					if (reactions.length === 1 && reactions[0].capability instanceof Obligation) {
						const [onlyReaction] = reactions;
						await onlyReaction.capability.trigger({
							gameGraph: this,
							cardId: onlyReaction.cardId
						});
						reactions.splice(0, 1);
						continue;
					}

					const { selection } = await this.requestInput(
						[
							new CapabilityChoiceField({
								name: 'selection',
								choices: new Set(reactions),
								required: true
							})
						],
						{ playerId: decidingPlayerId }
					);
					if (selection === undefined) {
						throw new Error('Reaction selection is required when multiple reactions are available');
					}

					await selection.capability.trigger({
						gameGraph: this,
						cardId: selection.cardId
					});

					const selectedIndex = reactions.indexOf(selection as OrderedReactionRef);
					if (selectedIndex !== -1) {
						reactions.splice(selectedIndex, 1);
					}
				}
			};

			await this.group(EventTriggered, { event: normalized.event }, {}, async () => {
				for (const reactionGroup of orderReactiveCapabilities(
					reactiveCapabilities,
					currentPlayerId,
					clockwisePlayerOrder
				)) {
					await consumeReactions(reactionGroup.reactions, reactionGroup.decidingPlayerId);
				}
			});
		}
	}
}

export {
	CapabilityTriggered,
	EndGroup,
	GameNode,
	type CapabilityTriggeredProps,
	type EndGroupProps,
	type GameNodeProps
} from './gamenodes';

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
