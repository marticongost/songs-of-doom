import { groupBy } from '@songsofdoom/common';
import { Obligation } from '../capabilities';
import type { Effect } from '../effects';
import { AfterTest, BeforeTest, DuringTest } from '../effects/effect';
import { events, type EventContext, type EventType } from '../event';
import type { ScalarExpressionType } from '../expressions';
import type { Property } from '../properties';
import type { Result } from '../results';
import { Target } from '../target';
import type { CapabilityRef } from './cardstate';
import {
	CHILDREN,
	DrawingFate,
	EffectGroup,
	EndEffectGroup,
	EndGroup,
	EventTriggered,
	FateDrawn,
	GameNode,
	GameStart,
	InputReceived,
	InputRequested,
	Mutation,
	NEXT,
	type EffectGroupProps,
	type EndGroupProps,
	type GameNodeProps,
	type MutationProps
} from './gamenodes';
import {
	ReadonlyGameState,
	type GameContext,
	type GameStateProps,
	type MutableGameState
} from './gamestate';
import { type EntityId, type PlayerId } from './identifiers';
import type { Field } from './playerinput';
import { CapabilityChoiceField, ResultField, TargetField } from './playerinput';
import type { PlayerState } from './playerstate';
import { MutableTestResolution, type TestResolutionProps } from './testresolution';

export type GroupContext<ClosingNodeProps extends EndGroupProps = EndGroupProps> = GameContext & {
	resolution?: MutableTestResolution;
	opening?: (state: MutableGameState) => void;
	closure?: (state: MutableGameState) => ClosingNodeExtraProps<ClosingNodeProps> | void;
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

	private add<
		P extends GameNodeProps,
		N extends GameNode,
		Extra extends Partial<Omit<P, BaseNodeProps>> | void = void
	>(
		nodeType: new (props: P) => N,
		props: Omit<P, BaseNodeProps | (Extra extends void ? never : keyof Extra)> & {
			state?: ReadonlyGameState | ((stateAlteration: MutableGameState) => Extra);
		}
	): N | undefined {
		let state: ReadonlyGameState;
		let extraProps: Partial<Omit<P, BaseNodeProps>> = {};
		if (props.state instanceof ReadonlyGameState) {
			state = props.state;
		} else if (typeof props.state === 'function') {
			const stateCallback = props.state;
			try {
				state = this._current.state.mutate((s) => {
					const result = stateCallback(s);
					if (result !== undefined && result !== null) {
						extraProps = result as Partial<Omit<P, BaseNodeProps>>;
					}
				});
			} catch (e) {
				if (e instanceof GameStateMutationCancelled) {
					return undefined;
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
			...extraProps,
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

		return node;
	}

	async triggerEffect(effect: Effect): Promise<void> {
		const nodeBeforeGroup = this._current;
		const parentBeforeGroup = this._currentParent;
		const parentChildrenLen = this._currentParent ? this._currentParent[CHILDREN].length : 0;

		try {
			await this.group<EffectGroupProps, void>(
				EffectGroup,
				{ effect },
				{ closingNodeType: EndEffectGroup },
				async () => {
					await effect.apply(this);
				}
			);
		} catch (e) {
			if (e instanceof EffectRolledBack) {
				// Rewind the node chain to before the EffectGroup was added.
				nodeBeforeGroup[NEXT] = undefined;
				this._current = nodeBeforeGroup;
				this._currentParent = parentBeforeGroup;
				if (parentBeforeGroup) {
					parentBeforeGroup[CHILDREN].length = parentChildrenLen;
				}
			} else {
				throw e;
			}
		}
	}

	mutate<Outcome>(fn: (state: MutableGameState) => Outcome): Outcome {
		let outcome!: Outcome;
		this.add<MutationProps, Mutation, { outcome: Outcome }>(Mutation, {
			state: (s) => {
				outcome = fn(s);
				return { outcome };
			}
		});
		return outcome;
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

	async defeat(player: PlayerId | PlayerState): Promise<void> {
		const playerId = typeof player === 'string' ? player : player.id;
		this.mutate((state) => {
			state.requirePlayer(playerId).defeated = true;
		});
		await this.triggerEvent('playerDefeated', { subjectId: playerId });
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
				this.triggerEvent('beforeDrawingFate');
				for (const effect of effectsByTiming.get(BeforeTest) ?? []) {
					await this.triggerEffect(effect);
				}

				const { result } = await this.requestInput([new ResultField({ name: 'result' })]);
				this.triggerEvent('fateTokenRevealed');
				for (const effect of effectsByTiming.get(DuringTest) ?? []) {
					await this.triggerEffect(effect);
				}

				await afterTest?.(this);
				this.triggerEvent('afterDrawingFate');
				for (const effect of effectsByTiming.get(AfterTest) ?? []) {
					await this.triggerEffect(effect);
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
	 * @param context.opening - Optional extra state mutation applied inside the initial node,
	 *   *after* any contextual stack entries are pushed. Use this for setup that depends on the
	 *   group's context being already established.
	 * @param context.closure - Optional extra state mutation applied inside the closing node,
	 *   *before* any contextual stack entries are popped. Use this for cleanup that still needs
	 *   the group's context to be intact (e.g. discarding the active card). It may also return
	 *   extra props for the closing node.
	 * @param context.closingNodeType - Optional closing node constructor. Defaults to
	 *   {@link EndGroup}.
	 * @param callback - Async callback that adds the child nodes for the group, which
	 *   perform game state mutation.
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
		const { resolution, opening, closure, closingNodeType } = context;
		const hasContext =
			context.activeCardId !== undefined ||
			context.activePlayerId !== undefined ||
			context.reactiveCardId !== undefined ||
			context.reactivePlayerId !== undefined ||
			context.subjectId !== undefined ||
			context.targetId !== undefined ||
			resolution !== undefined;

		// Merge context stack-pushes (and optional opening) into the initial node's state mutation.
		const originalState = nodeProps.state;
		const needsOpenState = hasContext || opening !== undefined;
		const mergedState: ReadonlyGameState | ((s: MutableGameState) => void) | undefined =
			needsOpenState
				? (state: MutableGameState) => {
						if (typeof originalState === 'function') originalState(state);
						state.pushContext(context);
						if (resolution !== undefined) state.testResolutionStack.push(resolution);
						if (opening) opening(state);
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

		this._currentParent = this._current;
		const result = await callback();

		// Add the closing node: apply closure first (context still intact), then pop stacks.
		const closingType = closingNodeType ?? (EndGroup as new (props: ClosingNodeProps) => GameNode);
		const needsClosingNodeState = hasContext || closure !== undefined;
		let closingProps: ClosingNodeExtraProps<ClosingNodeProps> | undefined;
		let closingState: ReadonlyGameState | undefined;
		if (needsClosingNodeState) {
			try {
				closingState = this._current.state.mutate((state) => {
					if (closure) {
						closingProps = closure(state) as ClosingNodeExtraProps<ClosingNodeProps> | undefined;
					}
					if (resolution !== undefined) {
						const resolvedTestResolution = state.requireActiveTestResolution().readonly();
						state.testResolutionStack.pop();
						closingProps = {
							...closingProps,
							resolution: resolvedTestResolution
						} as unknown as ClosingNodeExtraProps<ClosingNodeProps>;
					}
					state.popContext(context);
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

		this._currentParent = this._currentParent.parent;
		return result;
	}

	async triggerEvent(eventType: EventType, eventContext: Partial<EventContext> = {}) {
		const activePlayerId =
			eventContext.activePlayerId ??
			this._current.state.getActivePlayer()?.id ??
			this._current.state.players[0]?.id;
		if (activePlayerId === undefined) {
			throw new Error('Cannot resolve active player when triggering an event');
		}

		await this.group(
			EventTriggered,
			{ event: events[eventType] },
			{
				subjectId: eventContext.subjectId,
				targetId: eventContext.targetId,
				activePlayerId: eventContext.activePlayerId,
				reactiveCardId: eventContext.reactiveCardId,
				reactivePlayerId: eventContext.reactivePlayerId
			},
			async () => {
				const reactiveCapabilities = this.collectReactiveCapabilities(eventType);
				const clockwisePlayerOrder = this._current.state.clockwise(activePlayerId);
				for (const reactionGroup of orderReactiveCapabilities(
					reactiveCapabilities,
					activePlayerId,
					clockwisePlayerOrder
				)) {
					await this.consumeReactions(reactionGroup.reactions, reactionGroup.decidingPlayerId);
				}
			}
		);
	}

	private collectReactiveCapabilities(eventType: EventType): Array<OrderedReactionRef> {
		return this._current.state.cards({ ready: true }).flatMap((card) => {
			const reactionOrder = card.card.reactionOrder;
			return card.getReactionsToEvent(events[eventType], this._current.state).map((reaction) => ({
				cardId: card.id,
				ownerId: card.ownerId,
				reactionOrder,
				capability: reaction
			}));
		});
	}

	private async consumeReactions(
		reactions: Array<OrderedReactionRef>,
		decidingPlayerId: PlayerId
	): Promise<void> {
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
	}
}

/** An error indicating a game state mutation was deemed unnecessary or invalid, and
 * was rolled back.
 */
class GameStateMutationCancelled extends Error {}

/** An error indicating the entire effect group should be cancelled and rewound. */
class EffectRolledBack extends Error {}

/**
 * Cancels and rolls back the entire currently-executing effect group, rewinding the
 * game graph to the node before the effect started. Use this when an effect determines
 * it should not apply at all (e.g. exhausting a card that is already exhausted).
 */
export const rollbackEffect = () => {
	throw new EffectRolledBack();
};
