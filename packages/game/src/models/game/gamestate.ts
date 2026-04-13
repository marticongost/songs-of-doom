import type { BooleanExpressionType } from '../expressions/boolean/boolean-expression';
import type { ScalarExpressionType } from '../expressions/scalar/scalar-expression';
import {
	CardState,
	type CardOptions,
	type MutableCardState,
	type ReadonlyCardState
} from './cardstate';
import { isCardId, isPlayerId, type CardId, type EntityId, type PlayerId } from './identifiers';
import {
	LocationState,
	type MutableLocationState,
	type ReadonlyLocationState
} from './locationstate';
import { mutate } from './mutate';
import { PlayerState, type MutablePlayerState, type ReadonlyPlayerState } from './playerstate';
import { MutableTestResolution, ReadonlyTestResolution, TestResolution } from './testresolution';

export interface GameStateProps {
	players: ReadonlyArray<PlayerState>;
	locations?: ReadonlyArray<LocationState>;
	activeCardStack?: Array<CardId>;
	activePlayerStack?: Array<PlayerId>;
	reactiveCardStack?: Array<CardId>;
	reactivePlayerStack?: Array<PlayerId>;
	targetStack?: Array<EntityId>;
	subjectStack?: Array<EntityId>;
	testResolutionStack?: Array<TestResolution>;
}

export class GameState<
	TCard extends CardState = CardState,
	TPlayer extends PlayerState = PlayerState,
	TLocation extends LocationState = LocationState
> {
	readonly players: ReadonlyArray<TPlayer>;
	readonly locations: ReadonlyArray<TLocation>;
	readonly activeCardStack: Array<CardId>;
	readonly activePlayerStack: Array<PlayerId>;
	readonly reactiveCardStack: Array<CardId>;
	readonly reactivePlayerStack: Array<PlayerId>;
	readonly targetStack: Array<EntityId>;
	readonly subjectStack: Array<EntityId>;
	readonly testResolutionStack: Array<TestResolution>;

	constructor({
		players,
		locations,
		activeCardStack,
		activePlayerStack,
		reactiveCardStack,
		reactivePlayerStack,
		targetStack,
		subjectStack,
		testResolutionStack
	}: GameStateProps) {
		this.players = players as ReadonlyArray<TPlayer>;
		this.locations = (locations ?? []) as ReadonlyArray<TLocation>;
		this.activeCardStack = activeCardStack ?? [];
		this.activePlayerStack = activePlayerStack ?? [];
		this.reactiveCardStack = reactiveCardStack ?? [];
		this.reactivePlayerStack = reactivePlayerStack ?? [];
		this.targetStack = targetStack ?? [];
		this.subjectStack = subjectStack ?? [];
		this.testResolutionStack = testResolutionStack ?? [];
	}

	getEntityState(entityId: CardId): TCard | undefined;
	getEntityState(entityId: PlayerId): TPlayer | undefined;
	getEntityState(entityId: EntityId): TCard | TPlayer | undefined;
	getEntityState(entityId: EntityId): TCard | TPlayer | undefined {
		if (isCardId(entityId)) {
			return this.getCard(entityId);
		} else if (isPlayerId(entityId)) {
			return this.getPlayer(entityId);
		}
		return undefined;
	}

	requireEntityState(entityId: CardId): TCard;
	requireEntityState(entityId: PlayerId): TPlayer;
	requireEntityState(entityId: EntityId): TCard | TPlayer;
	requireEntityState(entityId: EntityId): TCard | TPlayer {
		const entity = this.getEntityState(entityId);
		if (!entity) {
			throw new Error(`Entity with id ${entityId} not found`);
		}
		return entity;
	}

	cards(options?: CardOptions): Array<TCard> {
		const playerCards = this.players.flatMap((player) => player.cards(options)) as Array<TCard>;
		return options?.ready ? playerCards : ([...this.locations, ...playerCards] as Array<TCard>);
	}

	getCard(cardId: CardId): TCard | undefined {
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

	requireCard(cardId: CardId): TCard {
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
	evaluate(expr: BooleanExpressionType | ScalarExpressionType): boolean | number {
		if (typeof expr === 'boolean') return expr;
		if (typeof expr === 'number') return expr;
		return (expr as { evaluate(state: GameState): boolean | number }).evaluate(this);
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
	declare activeCardStack: Array<CardId>;
	declare activePlayerStack: Array<PlayerId>;
	declare reactiveCardStack: Array<CardId>;
	declare reactivePlayerStack: Array<PlayerId>;
	declare targetStack: Array<EntityId>;
	declare subjectStack: Array<EntityId>;
	declare testResolutionStack: Array<ReadonlyTestResolution | MutableTestResolution>;

	constructor(gameState: ReadonlyGameState) {
		const stack = gameState.testResolutionStack as Array<ReadonlyTestResolution>;
		super({
			players: gameState.players.map((player) => player.mutable()),
			locations: gameState.locations.map((location) => location.mutable()),
			activeCardStack: [...gameState.activeCardStack],
			activePlayerStack: [...gameState.activePlayerStack],
			reactiveCardStack: [...gameState.reactiveCardStack],
			reactivePlayerStack: [...gameState.reactivePlayerStack],
			targetStack: [...gameState.targetStack],
			subjectStack: [...gameState.subjectStack],
			testResolutionStack: [
				...stack.slice(0, -1),
				...(stack.length > 0 ? [stack[stack.length - 1].mutable()] : [])
			]
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

	readonly(): ReadonlyGameState {
		return new ReadonlyGameState({
			players: this.players.map((playerAlteration) => playerAlteration.readonly()),
			locations: this.locations.map((location) => location.readonly()),
			activeCardStack: [...this.activeCardStack],
			activePlayerStack: [...this.activePlayerStack],
			reactiveCardStack: [...this.reactiveCardStack],
			reactivePlayerStack: [...this.reactivePlayerStack],
			targetStack: [...this.targetStack],
			subjectStack: [...this.subjectStack],
			testResolutionStack: this.testResolutionStack.map((r) =>
				r instanceof MutableTestResolution ? r.readonly() : r
			)
		});
	}
}
