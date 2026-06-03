import { CapabilityCost, type EntityTypeId } from '../..';
import { Action } from '../capabilities/action';
import { type Capability } from '../capability';
import type { ActualCapabilityCost } from '../capabilitycost';
import type { Effect } from '../effects/effect';
import type { BooleanExpressionType } from '../expressions/boolean/boolean-expression';
import type { ScalarExpressionType } from '../expressions/scalar/scalar-expression';
import { focuses, type FocusType } from '../focus';
import { CardState, type MutableCardState, type ReadonlyCardState } from './cardstate';
import type { PlannedAction } from './gamesequence';
import {
	isCardId,
	isLocationId,
	isPlayerId,
	type CardId,
	type CreatureId,
	type EntityId,
	type LocationId,
	type PlayerId
} from './identifiers';
import {
	LocationState,
	type MutableLocationState,
	type ReadonlyLocationState
} from './locationstate';
import { mutate } from './mutate';
import { PlayerState, type MutablePlayerState, type ReadonlyPlayerState } from './playerstate';
import { MutableTestResolution, ReadonlyTestResolution, TestResolution } from './testresolution';
import {
	MutableWoundResolution,
	ReadonlyWoundResolution,
	WoundResolution
} from './woundresolution';

export interface GameContext {
	currentCardId?: CardId;
	activeCardId?: CardId;
	activePlayerId?: PlayerId;
	reactiveCardId?: CardId;
	reactivePlayerId?: PlayerId;
	subjectId?: EntityId;
	targetId?: EntityId;
}

export interface GameStateProps {
	players: ReadonlyArray<PlayerState>;
	locations?: ReadonlyArray<LocationState>;
	encounterDeck?: ReadonlyArray<CardState>;
	encounterDiscardPile?: ReadonlyArray<CardState>;
	activeCardStack?: Array<CardId>;
	activePlayerStack?: Array<PlayerId>;
	reactiveCardStack?: Array<CardId>;
	reactivePlayerStack?: Array<PlayerId>;
	currentCardStack?: Array<CardId>;
	targetStack?: Array<EntityId>;
	subjectStack?: Array<EntityId>;
	testResolutionStack?: Array<TestResolution>;
	woundResolutionStack?: Array<WoundResolution>;
	plannedActions?: ReadonlyMap<CardId, PlannedAction>;
}

export interface CardOptions {
	ready?: boolean;
	type?: EntityTypeId;
}

export class GameState<
	TCard extends CardState = CardState,
	TPlayer extends PlayerState = PlayerState,
	TLocation extends LocationState = LocationState
> {
	readonly players: ReadonlyArray<TPlayer>;
	readonly locations: ReadonlyArray<TLocation>;
	readonly encounterDeck: ReadonlyArray<TCard>;
	readonly encounterDiscardPile: ReadonlyArray<TCard>;
	readonly activeCardStack: Array<CardId>;
	readonly activePlayerStack: Array<PlayerId>;
	readonly reactiveCardStack: Array<CardId>;
	readonly reactivePlayerStack: Array<PlayerId>;
	readonly currentCardStack: Array<CardId>;
	readonly targetStack: Array<EntityId>;
	readonly subjectStack: Array<EntityId>;
	readonly testResolutionStack: Array<TestResolution>;
	readonly woundResolutionStack: Array<WoundResolution>;
	readonly plannedActions: ReadonlyMap<CardId, PlannedAction>;

	constructor({
		players,
		locations,
		encounterDeck,
		encounterDiscardPile,
		activeCardStack,
		activePlayerStack,
		reactiveCardStack,
		reactivePlayerStack,
		currentCardStack,
		targetStack,
		subjectStack,
		testResolutionStack,
		woundResolutionStack,
		plannedActions
	}: GameStateProps) {
		this.players = players as ReadonlyArray<TPlayer>;
		this.locations = (locations ?? []) as ReadonlyArray<TLocation>;
		this.encounterDeck = (encounterDeck ?? []) as ReadonlyArray<TCard>;
		this.encounterDiscardPile = (encounterDiscardPile ?? []) as ReadonlyArray<TCard>;
		this.activeCardStack = activeCardStack ?? [];
		this.activePlayerStack = activePlayerStack ?? [];
		this.reactiveCardStack = reactiveCardStack ?? [];
		this.reactivePlayerStack = reactivePlayerStack ?? [];
		this.currentCardStack = currentCardStack ?? [];
		this.targetStack = targetStack ?? [];
		this.subjectStack = subjectStack ?? [];
		this.testResolutionStack = testResolutionStack ?? [];
		this.woundResolutionStack = woundResolutionStack ?? [];
		this.plannedActions = plannedActions ?? new Map();
	}

	getEntityState(entityId: LocationId): TLocation | undefined;
	getEntityState(entityId: CardId): TCard | undefined;
	getEntityState(entityId: PlayerId): TPlayer | undefined;
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

		const visit = (cardState: CardState) => {
			if (options?.ready && cardState.exhausted) {
				return;
			}
			if (!options?.type || cardState.card.type.id === options.type) {
				cards.push(cardState as TCard);
			}
			cardState.attachments.forEach(visit);
		};

		this.locations.forEach(visit);
		this.players.forEach((player) => player.cards(options).forEach(visit));

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

	getPlayerLocation(player: PlayerId | TPlayer): TLocation | undefined {
		const playerId = typeof player === 'string' ? player : player.id;
		return this.locations.find((loc) => loc.players.includes(playerId));
	}

	clockwise(startingPlayer: PlayerId): Array<PlayerId> {
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
		if (this.activeCardStack.length === 0) {
			return undefined;
		}
		const activeCardId = this.activeCardStack[this.activeCardStack.length - 1];
		return this.requireCard(activeCardId);
	}

	requireActiveCard(): TCard {
		const activeCard = this.getActiveCard();
		if (!activeCard) {
			throw new Error('No active card');
		}
		return activeCard;
	}

	getActivePlayer(): TPlayer | undefined {
		if (this.activePlayerStack.length === 0) {
			return undefined;
		}
		const activePlayerId = this.activePlayerStack[this.activePlayerStack.length - 1];
		return this.requirePlayer(activePlayerId);
	}

	requireActivePlayer(): TPlayer {
		const activePlayer = this.getActivePlayer();
		if (!activePlayer) {
			throw new Error('No active player');
		}
		return activePlayer;
	}

	getReactiveCard(): TCard | undefined {
		if (this.reactiveCardStack.length === 0) {
			return undefined;
		}
		const reactiveCardId = this.reactiveCardStack[this.reactiveCardStack.length - 1];
		return this.requireCard(reactiveCardId);
	}

	requireReactiveCard(): TCard {
		const reactiveCard = this.getReactiveCard();
		if (!reactiveCard) {
			throw new Error('No reactive card');
		}
		return reactiveCard;
	}

	getReactivePlayer(): TPlayer | undefined {
		if (this.reactivePlayerStack.length === 0) {
			return undefined;
		}
		const reactivePlayerId = this.reactivePlayerStack[this.reactivePlayerStack.length - 1];
		return this.requirePlayer(reactivePlayerId);
	}

	requireReactivePlayer(): TPlayer {
		const reactivePlayer = this.getReactivePlayer();
		if (!reactivePlayer) {
			throw new Error('No reactive player');
		}
		return reactivePlayer;
	}

	getCurrentCard(): TCard | undefined {
		if (this.currentCardStack.length === 0) {
			return undefined;
		}
		const currentCardId = this.currentCardStack[this.currentCardStack.length - 1];
		return this.requireCard(currentCardId);
	}

	requireCurrentCard(): TCard {
		const currentCard = this.getCurrentCard();
		if (!currentCard) {
			throw new Error('No current card');
		}
		return currentCard;
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

	evaluate(expr: BooleanExpressionType): boolean;
	evaluate(expr: ScalarExpressionType): number;
	evaluate(expr: CapabilityCost): ActualCapabilityCost;
	evaluate(
		expr: BooleanExpressionType | ScalarExpressionType | CapabilityCost
	): boolean | number | ActualCapabilityCost {
		if (typeof expr === 'boolean') return expr;
		if (typeof expr === 'number') return expr;
		return (expr as { evaluate(state: GameState): boolean | number }).evaluate(this);
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

	/**
	 * Calculates the initiative for an entity executing a given action.
	 * Initiative = entity's agility stat + modifyInitiative modifiers from Constant
	 * capabilities on the entity's card and attachments + modifyInitiative effects on the
	 * action itself.
	 */
	calculateInitiative(entityId: EntityId, action: Action): number {
		let base: number;
		let constantEffects: Array<Effect>;
		if (isPlayerId(entityId)) {
			const player = this.requirePlayer(entityId);
			base = player.getStat('agility');
			constantEffects = player.attachments.flatMap((att) =>
				att.card.capabilities.flatMap((cap) => cap.constantEffects())
			);
		} else {
			const card = this.requireCard(entityId as CardId);
			base = card.getStat('agility') ?? 0;
			constantEffects = [
				...card.card.capabilities.flatMap((cap) => cap.constantEffects()),
				...card.attachments.flatMap((att) =>
					att.card.attachmentCapabilities.flatMap((cap) => cap.constantEffects())
				)
			];
		}
		const initiative = [...constantEffects, ...action.effects].reduce(
			(value, effect) => effect.setInitiative(value),
			base
		);
		return initiative;
	}

	get creatures(): Array<TCard> {
		return this.cards().filter(
			(cardState) => cardState.card.type.id === 'creature'
		) as Array<TCard>;
	}
}

export class ReadonlyGameState extends GameState<
	ReadonlyCardState,
	ReadonlyPlayerState,
	ReadonlyLocationState
> {
	mutable(): MutableGameState {
		return new MutableGameState(this);
	}

	mutate(callback: (mutableState: MutableGameState) => void): ReadonlyGameState {
		return mutate(this as ReadonlyGameState, callback);
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
	declare activeCardStack: Array<CardId>;
	declare activePlayerStack: Array<PlayerId>;
	declare reactiveCardStack: Array<CardId>;
	declare reactivePlayerStack: Array<PlayerId>;
	declare currentCardStack: Array<CardId>;
	declare targetStack: Array<EntityId>;
	declare subjectStack: Array<EntityId>;
	declare testResolutionStack: Array<ReadonlyTestResolution | MutableTestResolution>;
	declare woundResolutionStack: Array<ReadonlyWoundResolution | MutableWoundResolution>;
	declare plannedActions: Map<CardId, PlannedAction>;

	constructor(gameState: ReadonlyGameState) {
		const stack = gameState.testResolutionStack as Array<ReadonlyTestResolution>;
		const woundStack = gameState.woundResolutionStack as Array<ReadonlyWoundResolution>;
		super({
			players: gameState.players.map((player) => player.mutable()),
			locations: gameState.locations.map((location) => location.mutable()),
			encounterDeck: gameState.encounterDeck.map((c) => c.mutable()),
			encounterDiscardPile: gameState.encounterDiscardPile.map((c) => c.mutable()),
			activeCardStack: [...gameState.activeCardStack],
			activePlayerStack: [...gameState.activePlayerStack],
			reactiveCardStack: [...gameState.reactiveCardStack],
			reactivePlayerStack: [...gameState.reactivePlayerStack],
			currentCardStack: [...gameState.currentCardStack],
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
			plannedActions: new Map(gameState.plannedActions)
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
		if (ctx.currentCardId !== undefined) this.currentCardStack.push(ctx.currentCardId);
		if (ctx.activeCardId !== undefined) this.activeCardStack.push(ctx.activeCardId);
		if (ctx.activePlayerId !== undefined) this.activePlayerStack.push(ctx.activePlayerId);
		if (ctx.reactiveCardId !== undefined) this.reactiveCardStack.push(ctx.reactiveCardId);
		if (ctx.reactivePlayerId !== undefined) this.reactivePlayerStack.push(ctx.reactivePlayerId);
		if (ctx.subjectId !== undefined) this.subjectStack.push(ctx.subjectId);
		if (ctx.targetId !== undefined) this.targetStack.push(ctx.targetId);
	}

	popContext(ctx: GameContext): void {
		if (ctx.currentCardId !== undefined) this.currentCardStack.pop();
		if (ctx.targetId !== undefined) this.targetStack.pop();
		if (ctx.subjectId !== undefined) this.subjectStack.pop();
		if (ctx.reactivePlayerId !== undefined) this.reactivePlayerStack.pop();
		if (ctx.reactiveCardId !== undefined) this.reactiveCardStack.pop();
		if (ctx.activePlayerId !== undefined) this.activePlayerStack.pop();
		if (ctx.activeCardId !== undefined) this.activeCardStack.pop();
	}

	setPlayerLocation(
		player: PlayerId | MutablePlayerState,
		location: LocationId | MutableLocationState
	): void {
		const playerId = typeof player === 'string' ? player : player.id;
		const locationId = typeof location === 'string' ? location : location.id;
		const origin = this.getPlayerLocation(playerId);
		if (origin) {
			const idx = origin.players.indexOf(playerId);
			if (idx !== -1) origin.players.splice(idx, 1);
		}
		const destination = this.locations.find((loc) => loc.id === locationId);
		if (destination) {
			destination.players.push(playerId);
		}
	}

	readonly(): ReadonlyGameState {
		return new ReadonlyGameState({
			players: this.players.map((playerAlteration) => playerAlteration.readonly()),
			locations: this.locations.map((location) => location.readonly()),
			encounterDeck: this.encounterDeck.map((c) => c.readonly()),
			encounterDiscardPile: this.encounterDiscardPile.map((c) => c.readonly()),
			activeCardStack: [...this.activeCardStack],
			activePlayerStack: [...this.activePlayerStack],
			reactiveCardStack: [...this.reactiveCardStack],
			reactivePlayerStack: [...this.reactivePlayerStack],
			targetStack: [...this.targetStack],
			subjectStack: [...this.subjectStack],
			testResolutionStack: this.testResolutionStack.map((r) =>
				r instanceof MutableTestResolution ? r.readonly() : r
			),
			woundResolutionStack: this.woundResolutionStack.map((r) =>
				r instanceof MutableWoundResolution ? r.readonly() : r
			),
			plannedActions: new Map(this.plannedActions)
		});
	}

	getCapabilityImpediment(
		capability: Capability,
		cardId: CardId,
		actorId: PlayerId | CreatureId
	): CapabilityImpediment | undefined {
		const actor = this.requireEntityState(actorId);
		const player = actor instanceof PlayerState ? actor : undefined;
		if (capability.cost) {
			const card = this.requireCard(cardId);

			// Charges
			if (capability.cost.charges) {
				if (card.charges < this.evaluate(capability.cost.charges)) {
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
			if (capability.cost.gold && !(player && player.gold >= this.evaluate(capability.cost.gold))) {
				return 'insufficient-gold';
			}

			// Focuses
			for (const focus of Object.keys(focuses) as Array<FocusType>) {
				const focusCostExpr = capability.cost.getCostForType(focus);
				const focusCost = focusCostExpr && this.evaluate(focusCostExpr);
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
}

type CapabilityImpediment =
	| 'insufficient-charges'
	| 'card-exhausted'
	| 'card-unavailable'
	| 'insufficient-gold'
	| 'insufficient-focus';
