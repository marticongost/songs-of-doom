import { Obligation, type Reaction } from '../capabilities';
import type { CapabilityCost, Payment } from '../capabilitycost';
import type { Effect } from '../effects';
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
import { isPlayerId, type CardId, type EntityId } from './identifiers';
import type { Field } from './playerinput';
import { CapabilityChoiceField, PaymentField, ResultField, TargetField } from './playerinput';
import type { ReadonlyPlayerState } from './playerstate';
import { EffectRolledBack } from './rollback';
import { runChapter } from './sequence/chapters';
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
	ownerId?: EntityId;
}

interface OrderedReactionGroup {
	decidingPlayerId: EntityId;
	reactions: Array<OrderedReactionRef>;
}

export interface RequestInputOptions {
	playerId?: EntityId;
}

export type ContextualEntity =
	| 'active-player'
	| 'active-card'
	| 'reactive-player'
	| 'reactive-card'
	| 'current-subject'
	| 'current-target';

export interface RequestEntityOptions {
	playerId?: EntityId;
	default?: ContextualEntity;
}

export const orderReactiveCapabilities = (
	reactions: Array<OrderedReactionRef>,
	currentPlayerId: EntityId,
	clockwisePlayerOrder: Array<EntityId>
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

	/** Additional reactions to attach to the test for its duration. */
	additionalReactions?: Array<CapabilityRef<Reaction>>;

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

	async triggerEffect(effect: Effect, context?: GameContext): Promise<void> {
		const nodeBeforeGroup = this._current;
		const parentBeforeGroup = this._currentParent;
		const parentChildrenLen = this._currentParent ? this._currentParent[CHILDREN].length : 0;

		try {
			await this.group<EffectGroupProps, void>(
				EffectGroup,
				{ effect },
				{ closingNodeType: EndEffectGroup, ...context },
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

	requestInput(target: Target, options?: RequestInputOptions): Promise<{ target: EntityId[] }>;
	requestInput<const Fields extends ReadonlyArray<Field<unknown, string, boolean>>>(
		fields: Fields,
		options?: RequestInputOptions
	): Promise<FieldsResult<Fields>>;
	requestInput<const Fields extends ReadonlyArray<Field<unknown, string, boolean>>>(
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

	private getContextualEntityId(type: ContextualEntity): EntityId | undefined {
		switch (type) {
			case 'active-player':
				return this._current.state.getActivePlayer()?.id;
			case 'active-card':
				return this._current.state.getActiveCard()?.id;
			case 'reactive-player':
				return this._current.state.getReactivePlayer()?.id;
			case 'reactive-card':
				return this._current.state.getReactiveCard()?.id;
			case 'current-subject':
				return this._current.state.getSubject()?.id;
			case 'current-target':
				return this._current.state.getTarget()?.id;
		}
	}

	private getContextualEntityIdList(type: ContextualEntity): Array<EntityId> {
		const id = this.getContextualEntityId(type);
		return id !== undefined ? [id] : [];
	}

	async requestSingleTarget(
		target?: Target,
		options: RequestEntityOptions = {}
	): Promise<EntityId | undefined> {
		if (target === undefined) {
			return options.default ? this.getContextualEntityId(options.default) : undefined;
		}
		const targetIds = (await this.requestInput(target, { playerId: options.playerId })).target;
		if (targetIds.length !== 1) {
			throw new Error('Expected exactly one target to be selected');
		}
		return targetIds[0];
	}

	async requestSinglePlayer(
		target?: Target,
		options: RequestEntityOptions = {}
	): Promise<EntityId | undefined> {
		if (target === undefined) {
			const id = options.default ? this.getContextualEntityId(options.default) : undefined;
			if (id && !isPlayerId(id)) {
				throw new Error(`Expected ${options.default} to resolve to a player id`);
			}
			return id;
		}
		if (!target.matchesType('player')) {
			throw new Error('Expected target to be of type player');
		}
		const playerIds = (await this.requestInput(target, { playerId: options.playerId })).target;
		if (playerIds.length !== 1) {
			throw new Error('Expected exactly one target to be selected');
		}
		return playerIds[0] as EntityId;
	}

	async requestTargets(
		target?: Target,
		options: RequestEntityOptions = {}
	): Promise<Array<EntityId>> {
		if (target === undefined) {
			return options.default ? this.getContextualEntityIdList(options.default) : [];
		}
		return (await this.requestInput(target, { playerId: options.playerId })).target;
	}

	async requestPlayers(
		target?: Target,
		options: RequestEntityOptions = {}
	): Promise<Array<EntityId>> {
		if (target === undefined) {
			const ids = options.default ? this.getContextualEntityIdList(options.default) : [];
			for (const id of ids) {
				if (!isPlayerId(id)) {
					throw new Error(`Expected ${options.default} to resolve to player ids`);
				}
			}
			return ids as Array<EntityId>;
		}
		if (!target.matchesType('player')) {
			throw new Error('Expected target to be of type player');
		}
		return (await this.requestInput(target, { playerId: options.playerId })).target as EntityId[];
	}

	/** Asks a player to choose the payment form for a given cost, and discards the
	 * selected resources.
	 *
	 * @param cost - The cost to be paid.
	 * @param playerId - The player who should pay the cost. If empty, defaults to the
	 *   active player.
	 * @param cardId - Optional id of the card for which the cost is being paid. Relevant
	 *   when the cost includes card transitions or charges.
	 * @returns An object describing the resources the player chose to spend, or undefined
	 *   if the player couldn't or didn't want to pay the cost.
	 * */
	async payment({
		cost,
		cardId,
		playerId
	}: {
		cost: CapabilityCost;
		cardId?: CardId;
		playerId?: EntityId;
	}): Promise<Payment> {
		if (!playerId) {
			playerId = this._current.state.requireActivePlayer()?.id;
		}
		const actualCost = this._current.state.evaluate(cost);
		const { payment } = await this.requestInput(
			[new PaymentField({ name: 'payment', cost: actualCost })] as const,
			{
				playerId
			}
		);
		this.mutate((state) => {
			const player = state.requirePlayer(playerId);

			// Spent focuses
			for (const [focusToken, amount] of payment.spentFocuses.entries()) {
				player.discardFocusToken(focusToken, amount);
			}

			// Spent cards
			for (const spentCardId of payment.spentCards) {
				state.requireCard(spentCardId).moveToTopOfDiscardPile(state);
			}

			// Charges
			const card = cardId ? state.requireCard(cardId) : undefined;
			if (payment.spentCharges > 0) {
				if (!card) {
					throw new Error('Card id must be provided to pay charges');
				}
				card.charges -= payment.spentCharges;
			}

			// Health, sanity, gold
			player.physicalTrauma += payment.spentHealth;
			player.mentalTrauma += payment.spentSanity;
			player.gold -= payment.spentGold;

			// Card transitions
			if (payment.cardTransition) {
				if (!card) {
					throw new Error('Card id must be provided to pay card transitions');
				}
				if (payment.cardTransition.type === 'discard') {
					card.moveToTopOfDiscardPile(state);
				} else if (payment.cardTransition.type === 'exhaust') {
					card.exhausted = true;
				} else {
					throw new Error(`Unknown card transition type: ${payment.cardTransition.type}`);
				}
			}
		});
		return payment;
	}

	async defeat(targetId: CardId | EntityId | ReadonlyPlayerState): Promise<void> {
		const playerId =
			typeof targetId !== 'string' ? targetId.id : isPlayerId(targetId) ? targetId : undefined;
		this.mutate((state) => {
			if (playerId !== undefined) {
				state.requirePlayer(playerId).defeated = true;
			} else {
				const cardState = state.requireCard(targetId as CardId);
				if (cardState.card.type.id === 'ally') {
					cardState.banish(state);
				} else {
					cardState.moveToTopOfDiscardPile(state);
				}
			}
		});
		if (playerId !== undefined) {
			await this.triggerEvent('playerDefeated', { subjectId: playerId });
		}
	}

	async test({
		subjectId,
		targetId,
		proficiency,
		properties,
		resolutionFactory,
		effects: _effects = [],
		additionalReactions,
		beforeTest,
		afterTest
	}: TestProps): Promise<Result> {
		const factory =
			resolutionFactory ?? ((props: TestResolutionProps) => new MutableTestResolution(props));
		const resolution = factory({
			subjectId,
			proficiency,
			properties: properties ? [...properties] : [],
			additionalReactions
		});

		return await this.group(
			DrawingFate,
			{},
			{ closingNodeType: FateDrawn, resolution, subjectId, targetId },
			async () => {
				await beforeTest?.(this);
				await this.triggerEvent('beforeDrawingFate');

				const { result } = await this.requestInput([new ResultField({ name: 'result' })]);
				await this.triggerEvent('fateTokenRevealed');

				await afterTest?.(this);
				await this.triggerEvent('afterDrawingFate');
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
	 * @param context.capabilityResolution - Pushed onto `capabilityResolutionStack` for the
	 *   duration of the group. The active/reactive/current card and player getters derive
	 *   their values from the top of this stack.
	 * @param context.subjectId - Pushed onto `subjectStack` for the duration of the group.
	 * @param context.targetId - Pushed onto `targetStack` for the duration of the group.
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
			context.capabilityResolution !== undefined ||
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

		await this.group(
			EventTriggered,
			{ event: events[eventType] },
			{
				subjectId: eventContext.subjectId,
				targetId: eventContext.targetId
			},
			async () => {
				if (activePlayerId === undefined) return;
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

	/**
	 * Collects reactive capabilities for the given event type.
	 *
	 * Reactions are collected once per {@link triggerEvent} call from all ready cards,
	 * plus any additional reactions attached to the active test resolution (if any).
	 * Reactions added to the test resolution during this same event trigger cycle
	 * will not be seen until the next event fires.
	 */
	private collectReactiveCapabilities(eventType: EventType): Array<OrderedReactionRef> {
		const cardReactions = this._current.state.cards({ ready: true }).flatMap((card) => {
			const reactionOrder = card.card.reactionOrder;
			return card.getReactionsToEvent(events[eventType], this._current.state).map((reaction) => ({
				cardId: card.id,
				ownerId: card.ownerId,
				reactionOrder,
				capability: reaction
			}));
		});

		const testResolution = this._current.state.getActiveTestResolution();
		const testReactions =
			testResolution?.additionalReactions
				?.filter((ref) => ref.capability.triggers.some((t) => t.event.type === eventType))
				.map((ref) => {
					const card = this._current.state.requireCard(ref.cardId);
					return {
						cardId: ref.cardId,
						ownerId: card.ownerId,
						reactionOrder: card.card.reactionOrder,
						capability: ref.capability
					} satisfies OrderedReactionRef;
				}) ?? [];

		return [...cardReactions, ...testReactions];
	}

	private async consumeReactions(
		reactions: Array<OrderedReactionRef>,
		decidingPlayerId: EntityId
	): Promise<void> {
		while (reactions.length > 0) {
			if (reactions.length === 1 && reactions[0].capability instanceof Obligation) {
				const [onlyReaction] = reactions;
				await onlyReaction.capability.trigger({
					gameGraph: this,
					subjectId: decidingPlayerId,
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
				subjectId: decidingPlayerId,
				cardId: selection.cardId
			});

			const selectedIndex = reactions.indexOf(selection as OrderedReactionRef);
			if (selectedIndex !== -1) {
				reactions.splice(selectedIndex, 1);
			}
		}
	}

	/** Runs a full game chapter (phases: chapter-start, focus, turns, draw, encounters, cleanup). */
	async runChapter(): Promise<void> {
		return runChapter(this);
	}
}

/** An error indicating a game state mutation was deemed unnecessary or invalid, and
 * was rolled back.
 */
class GameStateMutationCancelled extends Error {}
