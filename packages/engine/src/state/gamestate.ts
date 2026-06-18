import { Counter, shuffle } from '@songsofdoom/common';
import type {
	BooleanExpressionType,
	Capability,
	CapabilityCost,
	EntityTypeId,
	ScalarExpressionType,
	Target,
	TargetType
} from '@songsofdoom/game';
import {
	Action,
	ActualCapabilityCost,
	focuses,
	Reaction,
	type Entity,
	type FocusType
} from '@songsofdoom/game';
import { evaluateBoolean, evaluateScalar } from '../expressions';
import { MutableCapabilityResolution, type CapabilityResolution } from './capabilityresolution';
import type { CardOptions } from './cardcontainer';
import { CardState, MutableCardState, ReadonlyCardState } from './cardstate';
import type { EntityState } from './entitystate';
import { mutate } from './entitystatemutation';
import {
	isCardId,
	isLocationId,
	isPlayerId,
	type CardId,
	type EntityId,
	type LocationId,
	type PlayerId
} from './identifiers';
import { LocationState, MutableLocationState, ReadonlyLocationState } from './locationstate';
import { MutablePlayerState, PlayerState, ReadonlyPlayerState } from './playerstate';
import { MutableTestResolution, ReadonlyTestResolution, TestResolution } from './testresolution';
import {
	MutableWoundResolution,
	ReadonlyWoundResolution,
	WoundResolution
} from './woundresolution';

export interface GameContext {
	subjectId?: EntityId;
	targetId?: EntityId;

	/**
	 * Capability resolution to push onto the stack when triggering a capability. This is
	 * used to keep track of the current capability being resolved, for the duration of
	 * the context. The getters for active / action / current card and player derive their
	 * values from the top of this stack.
	 */
	capabilityResolution?: CapabilityResolution;
}

/** Maps an entity type ID to the prefix used in {@link CardId} generation. */
const ENTITY_TYPE_TO_PREFIX: Partial<Record<EntityTypeId, string>> = {
	location: 'loc',
	creature: 'crt',
	ally: 'aly',
	item: 'obj',
	skill: 'skl',
	trait: 'trt',
	encounter: 'enc',
	story: 'sto',
	scenario: 'scn'
};

export interface GameStateProps {
	chapter?: number;
	turn?: number;
	players: ReadonlyArray<PlayerState>;
	locations?: ReadonlyArray<LocationState>;
	encounterDeck?: ReadonlyArray<CardState>;
	encounterDiscardPile?: ReadonlyArray<CardState>;
	capabilityResolutionStack?: Array<CapabilityResolution>;
	targetStack?: Array<EntityId>;
	subjectStack?: Array<EntityId>;
	testResolutionStack?: Array<TestResolution>;
	woundResolutionStack?: Array<WoundResolution>;
	scenario?: CardState;
	nextScenario?: CardState;
	/** Counter used to generate sequential {@link CardId}s for each card type. */
	cardIdCounter?: Counter<string>;
}

export abstract class GameState<
	TCard extends CardState = CardState,
	TPlayer extends PlayerState = PlayerState,
	TLocation extends LocationState = LocationState
> {
	readonly players: ReadonlyArray<TPlayer>;
	readonly locations: ReadonlyArray<TLocation>;
	readonly encounterDeck: ReadonlyArray<TCard>;
	readonly encounterDiscardPile: ReadonlyArray<TCard>;
	readonly capabilityResolutionStack: Array<CapabilityResolution>;
	readonly targetStack: Array<EntityId>;
	readonly subjectStack: Array<EntityId>;
	readonly testResolutionStack: Array<TestResolution>;
	readonly woundResolutionStack: Array<WoundResolution>;
	readonly chapter: number;
	readonly turn: number;
	readonly scenario?: TCard;
	readonly nextScenario?: TCard;
	readonly cardIdCounter: Counter<string>;

	constructor({
		players,
		locations,
		encounterDeck,
		encounterDiscardPile,
		capabilityResolutionStack,
		targetStack,
		subjectStack,
		testResolutionStack,
		woundResolutionStack,
		chapter,
		turn,
		scenario,
		nextScenario,
		cardIdCounter
	}: GameStateProps) {
		this.chapter = chapter ?? 0;
		this.turn = turn ?? 0;
		this.players = players as ReadonlyArray<TPlayer>;
		this.locations = (locations ?? []) as ReadonlyArray<TLocation>;
		this.encounterDeck = (encounterDeck ?? []) as ReadonlyArray<TCard>;
		this.encounterDiscardPile = (encounterDiscardPile ?? []) as ReadonlyArray<TCard>;
		this.capabilityResolutionStack = capabilityResolutionStack ?? [];
		this.targetStack = targetStack ?? [];
		this.subjectStack = subjectStack ?? [];
		this.testResolutionStack = testResolutionStack ?? [];
		this.woundResolutionStack = woundResolutionStack ?? [];
		this.scenario = scenario as TCard | undefined;
		this.nextScenario = nextScenario as TCard | undefined;
		this.cardIdCounter = cardIdCounter ?? new Counter<string>();
	}

	/**
	 * Creates a new {@link CardState} (or {@link LocationState} for location entities)
	 * with an auto-generated sequential {@link CardId}.
	 *
	 * The ID prefix is determined by the entity's type (see {@link ENTITY_TYPE_TO_PREFIX}).
	 * The numeric suffix is managed by an internal {@link Counter} that tracks the next
	 * available number for each card type.
	 */
	abstract createCardState(entity: Entity): TCard | TLocation;

	/**
	 * Generates the next sequential {@link CardId} for the given entity's type.
	 *
	 * Increments the internal {@link cardIdCounter} and returns the resulting ID.
	 * Throws if the entity type does not map to a known card ID prefix.
	 */
	protected _generateCardId(entity: Entity): CardId {
		const prefix = ENTITY_TYPE_TO_PREFIX[entity.type.id];
		if (!prefix) {
			throw new Error(`Cannot generate card ID for entity type "${entity.type.id}".`);
		}
		this.cardIdCounter.add(prefix);
		return `${prefix}${this.cardIdCounter.get(prefix)}` as CardId;
	}

	abstract mutableClone(): MutableGameState;

	getEntityState(entityId: LocationId): TLocation | undefined;
	getEntityState(entityId: CardId): TCard | undefined;
	getEntityState(entityId: EntityId): TPlayer | undefined;
	getEntityState(entityId: EntityId): TCard | TLocation | TPlayer | undefined;
	getEntityState(entityId: EntityId): TCard | TLocation | TPlayer | undefined {
		if (isCardId(entityId)) {
			return this.getCard(entityId);
		} else if (isPlayerId(entityId)) {
			return this.getPlayer(entityId);
		}
		return undefined;
	}

	requireEntityState(entityId: LocationId): TLocation;
	requireEntityState(entityId: CardId): TCard;
	requireEntityState(entityId: PlayerId): TPlayer;
	requireEntityState(entityId: EntityId): TCard | TLocation | TPlayer;
	requireEntityState(entityId: EntityId): TCard | TLocation | TPlayer {
		const entity = this.getEntityState(entityId);
		if (!entity) {
			throw new Error(`Entity with id ${entityId} not found`);
		}
		return entity;
	}

	cards(options?: CardOptions): Array<TCard> {
		const cards: TCard[] = [];
		const includeAttachments = options?.includeAttachments ?? true;

		const visit = (cardState: CardState) => {
			if (options?.ready && cardState.exhausted) {
				return;
			}
			if (!options?.type || cardState.card.type.id === options.type) {
				cards.push(cardState as TCard);
			}
			if (includeAttachments) {
				cardState.attachments.forEach(visit);
			}
		};

		this.locations.forEach(visit);
		this.players.forEach((player) => player.cards(options).forEach(visit));

		if (this.scenario) {
			visit(this.scenario);
		}

		if (!options?.ready) {
			this.encounterDeck.forEach(visit);
			this.encounterDiscardPile.forEach(visit);
		}

		return cards;
	}

	getCard(cardId: LocationId): TLocation | undefined;
	getCard(cardId: CardId): TCard | undefined;
	getCard(cardId: CardId): TCard | TLocation | undefined {
		if (isLocationId(cardId)) {
			return this.locations.find((l) => l.id === cardId);
		}
		if (this.scenario) {
			const found = this.scenario.getCard(cardId);
			if (found) {
				return found as TCard;
			}
		}
		for (const location of this.locations) {
			const found = location.getCard(cardId);
			if (found) {
				return found as TCard;
			}
		}
		for (const player of this.players) {
			const found = player.getCard(cardId);
			if (found) {
				return found as TCard;
			}
		}
		return undefined;
	}

	requireCard(cardId: LocationId): TLocation;
	requireCard(cardId: CardId): TCard;
	requireCard(cardId: CardId): TCard | TLocation {
		const card = this.getCard(cardId);
		if (!card) {
			throw new Error(`Card with id ${cardId} not found`);
		}
		return card;
	}

	getPlayer(playerId: PlayerId): TPlayer | undefined {
		return this.players.find((player) => player.id === playerId);
	}

	requirePlayer(playerId: PlayerId): TPlayer {
		const player = this.getPlayer(playerId);
		if (!player) {
			throw new Error(`Player with id ${playerId} not found`);
		}
		return player;
	}

	getEntityLocation(entity: EntityId | EntityState): TLocation | undefined {
		const entityId = typeof entity === 'string' ? entity : entity.id;
		if (isPlayerId(entityId)) {
			return this.locations.find((loc) => loc.players.includes(entityId));
		} else if (isCardId(entityId)) {
			for (const location of this.locations) {
				for (const card of location.cards()) {
					if (card.id === entityId) {
						return location;
					}
				}
			}
		}
		return undefined;
	}

	clockwise(startingPlayer: EntityId): Array<EntityId> {
		const startIndex = this.players.findIndex((player) => player.id === startingPlayer);
		if (startIndex === -1) {
			throw new Error(`Player with id ${startingPlayer} not found`);
		}
		return [
			...this.players.slice(startIndex).map((player) => player.id),
			...this.players.slice(0, startIndex).map((player) => player.id)
		];
	}

	getActiveCard(): TCard | undefined {
		const resolution = this.getActionResolution();
		if (!resolution) return undefined;
		return this.requireCard(resolution.cardId);
	}

	requireActiveCard(): TCard {
		const activeCard = this.getActiveCard();
		if (!activeCard) {
			throw new Error('No active card');
		}
		return activeCard;
	}

	getActivePlayer(): TPlayer | undefined {
		const card = this.getActiveCard();
		if (card?.ownerId && isPlayerId(card.ownerId)) return this.getPlayer(card.ownerId);
		// Fallback: check subjectStack for a player ID (used by phase-level contexts
		// like focus/draw phases where a player is active without a capability).
		if (this.subjectStack.length > 0) {
			const subjectId = this.subjectStack[this.subjectStack.length - 1];
			if (isPlayerId(subjectId)) return this.getPlayer(subjectId);
		}
		return undefined;
	}

	requireActivePlayer(): TPlayer {
		const activePlayer = this.getActivePlayer();
		if (!activePlayer) {
			throw new Error('No active player');
		}
		return activePlayer;
	}

	getReactiveCard(): TCard | undefined {
		const resolution = this.getReactionResolution();
		if (!resolution) return undefined;
		return this.requireCard(resolution.cardId);
	}

	requireReactiveCard(): TCard {
		const reactiveCard = this.getReactiveCard();
		if (!reactiveCard) {
			throw new Error('No reactive card');
		}
		return reactiveCard;
	}

	getReactivePlayer(): TPlayer | undefined {
		const card = this.getReactiveCard();
		if (!card) return undefined;
		if (card.ownerId && isPlayerId(card.ownerId)) return this.getPlayer(card.ownerId);
		return undefined;
	}

	requireReactivePlayer(): TPlayer {
		const reactivePlayer = this.getReactivePlayer();
		if (!reactivePlayer) {
			throw new Error('No reactive player');
		}
		return reactivePlayer;
	}

	getCurrentCard(): TCard | undefined {
		if (this.capabilityResolutionStack.length === 0) return undefined;
		const top = this.capabilityResolutionStack[this.capabilityResolutionStack.length - 1];
		return this.requireCard(top.cardId);
	}

	requireCurrentCard(): TCard {
		const currentCard = this.getCurrentCard();
		if (!currentCard) {
			throw new Error('No current card');
		}
		return currentCard;
	}

	/**
	 * Returns the topmost non-Reaction resolution from the capability resolution stack.
	 * This represents the card that initiated the current action chain.
	 */
	private getActionResolution(): CapabilityResolution | undefined {
		for (let i = this.capabilityResolutionStack.length - 1; i >= 0; i--) {
			if (this.capabilityResolutionStack[i].capability instanceof Action) {
				return this.capabilityResolutionStack[i];
			}
		}
		return undefined;
	}

	/**
	 * Returns the topmost Reaction resolution from the capability resolution stack.
	 * This represents the card that is currently reacting to an event.
	 */
	private getReactionResolution(): CapabilityResolution | undefined {
		for (let i = this.capabilityResolutionStack.length - 1; i >= 0; i--) {
			if (this.capabilityResolutionStack[i].capability instanceof Reaction) {
				return this.capabilityResolutionStack[i];
			}
		}
		return undefined;
	}

	/**
	 * Returns the implicit target for the current context, if any.
	 *
	 * Implicit target resolution:
	 * - For effects in an attached card, the subject is the attachment owner (example: sanctuary)
	 * - If the effect is on an 'attack' reaction that matches the target, the subject is the attack target (example: shield-against-the-dark)
	 * - If the effect is on an 'attack' reaction that matches the subject, the subject is the attacker (example: critical-impact)
	 * - If the effect is on a triggerAttack({modifiers}) prop, the subject is the attack (example: shield-against-the-dark)
	 * - If the effect is on an equipped piece of equipment, the subject is the wearer (example: chainmail)
	 * - Otherwise, default to the active player
	 */
	getTarget(): TCard | TPlayer | undefined {
		if (this.targetStack.length === 0) {
			return undefined;
		}
		const id = this.targetStack[this.targetStack.length - 1];
		if (isCardId(id)) return this.getCard(id);
		return this.getPlayer(id);
	}

	requireTarget(): TCard | TPlayer {
		const target = this.getTarget();
		if (!target) {
			throw new Error('No implicit target');
		}
		return target;
	}

	getSubject(): TCard | TPlayer | undefined {
		if (this.subjectStack.length === 0) {
			return undefined;
		}
		const id = this.subjectStack[this.subjectStack.length - 1];
		if (isCardId(id)) return this.getCard(id);
		return this.getPlayer(id);
	}

	requireSubject(): TCard | TPlayer {
		const subject = this.getSubject();
		if (!subject) {
			throw new Error('No implicit subject');
		}
		return subject;
	}

	getActiveTestResolution(): TestResolution | undefined {
		if (this.testResolutionStack.length === 0) {
			return undefined;
		}
		return this.testResolutionStack[this.testResolutionStack.length - 1];
	}

	requireActiveTestResolution(): TestResolution {
		const resolution = this.getActiveTestResolution();
		if (!resolution) {
			throw new Error('No active attack resolution');
		}
		return resolution;
	}

	evaluateBoolean(expr: BooleanExpressionType): boolean {
		if (typeof expr === 'boolean') return expr;
		return evaluateBoolean(expr, this);
	}

	evaluateScalar(expr: ScalarExpressionType): number {
		if (typeof expr === 'number') return expr;
		return evaluateScalar(expr, this);
	}

	evaluateCapabilityCost(expr: CapabilityCost): ActualCapabilityCost {
		return new ActualCapabilityCost({
			strength: this.evaluateScalar(expr.strength),
			agility: this.evaluateScalar(expr.agility),
			intelligence: this.evaluateScalar(expr.intelligence),
			charisma: this.evaluateScalar(expr.charisma),
			will: this.evaluateScalar(expr.will),
			heroism: this.evaluateScalar(expr.heroism),
			any: this.evaluateScalar(expr.any),
			health: this.evaluateScalar(expr.health),
			sanity: this.evaluateScalar(expr.sanity),
			gold: this.evaluateScalar(expr.gold),
			charges: this.evaluateScalar(expr.charges),
			cardTransition: expr.cardTransition
		});
	}

	/**
	 * Returns the concentration value for the given player.
	 * Concentration = max(0, 1 + sum of all modifyConcentration modifiers from Constant
	 * capabilities in cards under the player's control).
	 */
	getConcentration(playerId: PlayerId): number {
		const player = this.requirePlayer(playerId);
		const allCards = [...player.hand, ...player.attachments];
		const base = 1;
		const modifier = allCards
			.flatMap((card) => card.card.capabilities.flatMap((cap) => cap.constantEffects()))
			.reduce((value, effect) => effect.setConcentration(value), base);
		return Math.max(0, modifier);
	}

	get creatures(): Array<TCard> {
		return this.cards().filter(
			(cardState) => cardState.card.type.id === 'creature'
		) as Array<TCard>;
	}

	getCapabilityImpediment(
		capability: Capability,
		cardId: CardId,
		actorId: EntityId
	): CapabilityImpediment | undefined {
		const actor = this.requireEntityState(actorId);
		const player = actor instanceof PlayerState ? actor : undefined;
		if (capability.cost) {
			const card = this.requireCard(cardId);

			// Charges
			if (capability.cost.charges) {
				if (card.charges < this.evaluateScalar(capability.cost.charges)) {
					return 'insufficient-charges';
				}
			}

			// Card transition
			if (capability.cost.cardTransition) {
				if (!card.inPlay()) {
					return 'card-unavailable';
				}
				if (capability.cost.cardTransition.type === 'exhaust') {
					if (card.exhausted) {
						return 'card-exhausted';
					}
				}
			}

			// Gold
			if (
				capability.cost.gold &&
				!(player && player.gold >= this.evaluateScalar(capability.cost.gold))
			) {
				return 'insufficient-gold';
			}

			// Focuses
			for (const focus of Object.keys(focuses) as Array<FocusType>) {
				const focusCostExpr = capability.cost.getCostForType(focus);
				const focusCost = focusCostExpr && this.evaluateScalar(focusCostExpr);
				if (focusCost && !(player && player.hasEnoughFocusOfType(focus, focusCost))) {
					return 'insufficient-focus';
				}
			}
		}
		return undefined;
		// TODO: What about capabilities that alter the costs of other capabilities or
		// the state of the game in a way that would make the capability feasible / not
		// feasible anymore?
	}

	resolveTarget(target: Target): EntityId[] {
		if (target.selection === 'player-chosen') {
			throw new Error("Player-chosen targets can't be resolved non interactively");
		}
		const targetIds = new Set<EntityId>();

		if (target.matchesType('current-card')) {
			targetIds.add(this.requireCurrentCard().id);
		}

		for (const type of [
			'skill',
			'trait',
			'archetype',
			'item',
			'ally',
			'creature',
			'location',
			'encounter',
			'story'
		] as Array<EntityTypeId & TargetType>) {
			if (target.matchesType(type)) {
				this.cards({ type }).forEach((card) => targetIds.add(card.id));
			}
		}

		if (target.matchesType('current-subject')) {
			targetIds.add(this.requireSubject().id);
		}
		if (target.matchesType('player')) {
			this.players.forEach((player) => targetIds.add(player.id));
		}
		if (target.matchesType('owner')) {
			const ownerId = this.requireCurrentCard().ownerId;
			if (ownerId) targetIds.add(ownerId);
		}
		if (target.matchesType('active-player')) {
			// TODO: Should this be a condition?
			const activePlayer = this.requireActivePlayer();
			targetIds.add(activePlayer.id);
		}
		if (target.matchesType('enemy')) {
			if (this.requireSubject().hostile) {
				this.cards({ type: 'ally' }).forEach((card) => targetIds.add(card.id));
				this.players.forEach((player) => targetIds.add(player.id));
			} else {
				this.creatures.forEach((creature) => {
					targetIds.add(creature.id);
				});
			}
		}
		if (target.matchesType('attacker')) {
			// TODO: mismatch between "attacker" and "subject"
			targetIds.add(this.requireSubject().id);
		}
		if (target.matchesType('defender')) {
			// TODO: mismatch between "defender" and "target"
			targetIds.add(this.requireTarget().id);
		}

		// TODO: Select by stored variable
		const possibleTargetIds: EntityId[] = [...targetIds];
		let resolvedTargetIds: EntityId[];

		if (target.selection === 'random') {
			shuffle(possibleTargetIds);
		} else if (target.selection === 'closest' || target.selection === 'furthest') {
			// TODO: order possibleTargetIds by distance to current subject, then reverse if 'furthest'
		}

		const max = this.evaluateScalar(target.cardinality.max);

		if (target.condition) {
			resolvedTargetIds = [];
			for (const targetId of possibleTargetIds) {
				const stateWithEntityAsTarget = this.mutableClone();
				stateWithEntityAsTarget.subjectStack.push(targetId);
				if (stateWithEntityAsTarget.evaluateBoolean(target.condition)) {
					if (resolvedTargetIds.length < max) {
						resolvedTargetIds.push(targetId);
					}
				}
			}
		} else if (max !== Infinity) {
			resolvedTargetIds = possibleTargetIds.slice(0, max);
		} else {
			resolvedTargetIds = possibleTargetIds;
		}

		return resolvedTargetIds;
	}
}

export class ReadonlyGameState extends GameState<
	ReadonlyCardState,
	ReadonlyPlayerState,
	ReadonlyLocationState
> {
	override createCardState(entity: Entity): ReadonlyCardState | ReadonlyLocationState {
		const id = this._generateCardId(entity);
		if (entity.type.id === 'location') {
			return new ReadonlyLocationState({
				id: id as LocationId,
				card: entity,
				coordinates: { x: 0, y: 0 }
			});
		}
		return new ReadonlyCardState({ id: id as CardId, card: entity });
	}

	mutable(): MutableGameState {
		return new MutableGameState(this);
	}

	mutate(callback: (mutableState: MutableGameState) => void): ReadonlyGameState {
		return mutate(this as ReadonlyGameState, callback);
	}

	override mutableClone(): MutableGameState {
		return new MutableGameState(this);
	}
}

export class MutableGameState extends GameState<
	MutableCardState,
	MutablePlayerState,
	MutableLocationState
> {
	declare players: Array<MutablePlayerState>;
	declare locations: Array<MutableLocationState>;
	declare encounterDeck: Array<MutableCardState>;
	declare encounterDiscardPile: Array<MutableCardState>;
	declare capabilityResolutionStack: Array<MutableCapabilityResolution>;
	declare targetStack: Array<EntityId>;
	declare subjectStack: Array<EntityId>;
	declare testResolutionStack: Array<ReadonlyTestResolution | MutableTestResolution>;
	declare woundResolutionStack: Array<ReadonlyWoundResolution | MutableWoundResolution>;
	declare chapter: number;
	declare turn: number;
	declare scenario?: MutableCardState;
	declare nextScenario?: MutableCardState;
	declare cardIdCounter: Counter<string>;

	override createCardState(entity: Entity): MutableCardState | MutableLocationState {
		const id = this._generateCardId(entity);
		if (entity.type.id === 'location') {
			return new MutableLocationState(
				new ReadonlyLocationState({
					id: id as LocationId,
					card: entity,
					coordinates: { x: 0, y: 0 }
				})
			);
		}
		return new ReadonlyCardState({ id: id as CardId, card: entity }).mutable();
	}

	constructor(gameState: ReadonlyGameState) {
		const stack = gameState.testResolutionStack as Array<ReadonlyTestResolution>;
		const woundStack = gameState.woundResolutionStack as Array<ReadonlyWoundResolution>;
		super({
			players: gameState.players.map((player) => player.mutable()),
			locations: gameState.locations.map((location) => location.mutable()),
			encounterDeck: gameState.encounterDeck.map((c) => c.mutable()),
			encounterDiscardPile: gameState.encounterDiscardPile.map((c) => c.mutable()),
			capabilityResolutionStack: [...gameState.capabilityResolutionStack],
			targetStack: [...gameState.targetStack],
			subjectStack: [...gameState.subjectStack],
			testResolutionStack: [
				...stack.slice(0, -1),
				...(stack.length > 0 ? [stack[stack.length - 1].mutable()] : [])
			],
			woundResolutionStack: [
				...woundStack.slice(0, -1),
				...(woundStack.length > 0 ? [woundStack[woundStack.length - 1].mutable()] : [])
			],
			scenario: gameState.scenario?.mutable(),
			nextScenario: gameState.nextScenario?.mutable(),
			cardIdCounter: gameState.cardIdCounter
		});
	}

	getActiveTestResolution(): MutableTestResolution | undefined {
		if (this.testResolutionStack.length === 0) {
			return undefined;
		}
		return this.testResolutionStack[this.testResolutionStack.length - 1] as MutableTestResolution;
	}

	requireActiveTestResolution(): MutableTestResolution {
		const resolution = this.getActiveTestResolution();
		if (!resolution) {
			throw new Error('No active attack resolution');
		}
		return resolution;
	}

	getActiveWoundResolution(): MutableWoundResolution | undefined {
		if (this.woundResolutionStack.length === 0) {
			return undefined;
		}
		return this.woundResolutionStack[
			this.woundResolutionStack.length - 1
		] as MutableWoundResolution;
	}

	requireActiveWoundResolution(): MutableWoundResolution {
		const resolution = this.getActiveWoundResolution();
		if (!resolution) {
			throw new Error('No active wound resolution');
		}
		return resolution;
	}

	pushContext(ctx: GameContext): void {
		if (ctx.capabilityResolution !== undefined)
			this.capabilityResolutionStack.push(ctx.capabilityResolution.mutable());
		if (ctx.subjectId !== undefined) this.subjectStack.push(ctx.subjectId);
		if (ctx.targetId !== undefined) this.targetStack.push(ctx.targetId);
	}

	popContext(ctx: GameContext): void {
		if (ctx.targetId !== undefined) this.targetStack.pop();
		if (ctx.subjectId !== undefined) this.subjectStack.pop();
		if (ctx.capabilityResolution !== undefined) this.capabilityResolutionStack.pop();
	}

	setActorLocation(
		actor: EntityId | MutablePlayerState,
		location: LocationId | MutableLocationState
	): void {
		const actorId = typeof actor === 'string' ? actor : actor.id;
		const locationId = typeof location === 'string' ? location : location.id;
		const origin = this.getEntityLocation(actorId);
		if (origin) {
			const idx = origin.players.indexOf(actorId);
			if (idx !== -1) origin.players.splice(idx, 1);
		}
		const destination = this.locations.find((loc) => loc.id === locationId);
		if (destination) {
			destination.players.push(actorId);
		}
	}

	readonly(): ReadonlyGameState {
		return new ReadonlyGameState({
			chapter: this.chapter,
			turn: this.turn,
			players: this.players.map((playerAlteration) => playerAlteration.readonly()),
			locations: this.locations.map((location) => location.readonly()),
			encounterDeck: this.encounterDeck.map((c) => c.readonly()),
			encounterDiscardPile: this.encounterDiscardPile.map((c) => c.readonly()),
			capabilityResolutionStack: this.capabilityResolutionStack.map((r) =>
				r instanceof MutableCapabilityResolution ? r.readonly() : r
			),
			targetStack: [...this.targetStack],
			subjectStack: [...this.subjectStack],
			testResolutionStack: this.testResolutionStack.map((r) =>
				r instanceof MutableTestResolution ? r.readonly() : r
			),
			woundResolutionStack: this.woundResolutionStack.map((r) =>
				r instanceof MutableWoundResolution ? r.readonly() : r
			),
			scenario: this.scenario?.readonly(),
			nextScenario: this.nextScenario?.readonly(),
			cardIdCounter: this.cardIdCounter
		});
	}

	override mutableClone(): MutableGameState {
		return new MutableGameState(this.readonly());
	}
}

type CapabilityImpediment =
	| 'insufficient-charges'
	| 'card-exhausted'
	| 'card-unavailable'
	| 'insufficient-gold'
	| 'insufficient-focus';
