import type { BooleanExpressionType } from '../expressions/boolean/boolean-expression';
import type { ScalarExpressionType } from '../expressions/scalar/scalar-expression';
import { mutate } from './mutate';
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
import { PlayerState, type MutablePlayerState, type ReadonlyPlayerState } from './playerstate';

export interface GameStateProps {
	players: ReadonlyArray<PlayerState>;
	locations?: ReadonlyArray<LocationState>;
	activeCardStack?: Array<CardId>;
	activePlayerStack?: Array<PlayerId>;
	implicitTargetStack?: Array<EntityId>;
	implicitSubjectStack?: Array<EntityId>;
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
	readonly implicitTargetStack: Array<EntityId>;
	readonly implicitSubjectStack: Array<EntityId>;

	constructor({
		players,
		locations,
		activeCardStack,
		activePlayerStack,
		implicitTargetStack,
		implicitSubjectStack
	}: GameStateProps) {
		this.players = players as ReadonlyArray<TPlayer>;
		this.locations = (locations ?? []) as ReadonlyArray<TLocation>;
		this.activeCardStack = activeCardStack ?? [];
		this.activePlayerStack = activePlayerStack ?? [];
		this.implicitTargetStack = implicitTargetStack ?? [];
		this.implicitSubjectStack = implicitSubjectStack ?? [];
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

	/**
	 * Returns the implicit target for the current context, if any.
	 *
	 * Implicit target resolution:
	 * - For effects in an attached card, the subject is the attachment owner (example: sanctuary)
	 * - If the effect is on a 'receivingAttack' reaction, the subject is the attack target (example: shield-against-the-dark)
	 * - If the effect is on an 'attacking' reaction, the subject is the attacker (example: critical-impact)
	 * - If the effect is on a triggerAttack({modifiers}) prop, the subject is the attack (example: shield-against-the-dark)
	 * - If the effect is on an equipped piece of equipment, the subject is the wearer (example: chainmail)
	 * - Otherwise, default to the active player
	 */
	getImplicitTarget(): TCard | TPlayer | undefined {
		if (this.implicitTargetStack.length === 0) {
			return undefined;
		}
		const id = this.implicitTargetStack[this.implicitTargetStack.length - 1];
		if (isCardId(id)) return this.getCard(id);
		return this.getPlayer(id);
	}

	requireImplicitTarget(): TCard | TPlayer {
		const target = this.getImplicitTarget();
		if (!target) {
			throw new Error('No implicit target');
		}
		return target;
	}

	getImplicitSubject(): TCard | TPlayer | undefined {
		if (this.implicitSubjectStack.length === 0) {
			return undefined;
		}
		const id = this.implicitSubjectStack[this.implicitSubjectStack.length - 1];
		if (isCardId(id)) return this.getCard(id);
		return this.getPlayer(id);
	}

	requireImplicitSubject(): TCard | TPlayer {
		const subject = this.getImplicitSubject();
		if (!subject) {
			throw new Error('No implicit subject');
		}
		return subject;
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
	declare implicitTargetStack: Array<EntityId>;
	declare implicitSubjectStack: Array<EntityId>;

	constructor(gameState: ReadonlyGameState) {
		super({
			players: gameState.players.map((player) => player.mutable()),
			locations: gameState.locations.map((location) => location.mutable()),
			activeCardStack: [...gameState.activeCardStack],
			activePlayerStack: [...gameState.activePlayerStack],
			implicitTargetStack: [...gameState.implicitTargetStack],
			implicitSubjectStack: [...gameState.implicitSubjectStack]
		});
	}

	requireTarget(id: EntityId): MutableCardState | MutablePlayerState {
		if (isCardId(id)) {
			return this.requireCard(id);
		} else if (isPlayerId(id)) {
			return this.requirePlayer(id);
		}
		throw new Error(`Invalid EntityId: ${id}`);
	}

	readonly(): ReadonlyGameState {
		return new ReadonlyGameState({
			players: this.players.map((playerAlteration) => playerAlteration.readonly()),
			locations: this.locations.map((location) => location.readonly()),
			activeCardStack: [...this.activeCardStack],
			activePlayerStack: [...this.activePlayerStack],
			implicitTargetStack: [...this.implicitTargetStack],
			implicitSubjectStack: [...this.implicitSubjectStack]
		});
	}
}
