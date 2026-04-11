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
import { PlayerState, type MutablePlayerState, type ReadonlyPlayerState } from './playerstate';

export interface GameStateProps {
	players: ReadonlyArray<PlayerState>;
	locations?: ReadonlyArray<LocationState>;
	activeCardStack?: Array<CardId>;
	activePlayerStack?: Array<PlayerId>;
	implicitTargetStack?: Array<EntityId>;
	implicitSubjectStack?: Array<EntityId>;
}

export class GameState {
	readonly players: ReadonlyArray<PlayerState>;
	readonly locations: ReadonlyArray<LocationState>;
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
		this.players = players;
		this.locations = locations ?? [];
		this.activeCardStack = activeCardStack ?? [];
		this.activePlayerStack = activePlayerStack ?? [];
		this.implicitTargetStack = implicitTargetStack ?? [];
		this.implicitSubjectStack = implicitSubjectStack ?? [];
	}

	getEntityState(entityId: CardId): CardState | undefined;
	getEntityState(entityId: PlayerId): PlayerState | undefined;
	getEntityState(entityId: EntityId): CardState | PlayerState | undefined;
	getEntityState(entityId: EntityId): CardState | PlayerState | undefined {
		if (isCardId(entityId)) {
			return this.getCard(entityId);
		} else if (isPlayerId(entityId)) {
			return this.getPlayer(entityId);
		}
		return undefined;
	}

	requireEntityState(entityId: CardId): CardState;
	requireEntityState(entityId: PlayerId): PlayerState;
	requireEntityState(entityId: EntityId): CardState | PlayerState;
	requireEntityState(entityId: EntityId): CardState | PlayerState {
		const entity = this.getEntityState(entityId);
		if (!entity) {
			throw new Error(`Entity with id ${entityId} not found`);
		}
		return entity;
	}

	cards(options?: CardOptions): Array<CardState> {
		const playerCards = this.players.flatMap((player) => player.cards(options));
		return options?.ready ? playerCards : [...this.locations, ...playerCards];
	}

	getCard(cardId: CardId): CardState | undefined {
		for (const location of this.locations) {
			const found = location.getCard(cardId);
			if (found) {
				return found;
			}
		}
		for (const player of this.players) {
			const found = player.getCard(cardId);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(cardId: CardId): CardState {
		const card = this.getCard(cardId);
		if (!card) {
			throw new Error(`Card with id ${cardId} not found`);
		}
		return card;
	}

	getPlayer(playerId: PlayerId): PlayerState | undefined {
		return this.players.find((player) => player.id === playerId);
	}

	requirePlayer(playerId: PlayerId): PlayerState {
		const player = this.getPlayer(playerId);
		if (!player) {
			throw new Error(`Player with id ${playerId} not found`);
		}
		return player;
	}

	getActiveCard(): CardState | undefined {
		if (this.activeCardStack.length === 0) {
			return undefined;
		}
		const activeCardId = this.activeCardStack[this.activeCardStack.length - 1];
		return this.requireCard(activeCardId);
	}

	requireActiveCard(): CardState {
		const activeCard = this.getActiveCard();
		if (!activeCard) {
			throw new Error('No active card');
		}
		return activeCard;
	}

	getActivePlayer(): PlayerState | undefined {
		if (this.activePlayerStack.length === 0) {
			return undefined;
		}
		const activePlayerId = this.activePlayerStack[this.activePlayerStack.length - 1];
		return this.requirePlayer(activePlayerId);
	}

	requireActivePlayer(): PlayerState {
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

	getImplicitTarget(): CardState | PlayerState | undefined {
		if (this.implicitTargetStack.length === 0) {
			return undefined;
		}
		const id = this.implicitTargetStack[this.implicitTargetStack.length - 1];
		if (isCardId(id)) return this.getCard(id);
		return this.getPlayer(id);
	}

	requireImplicitTarget(): CardState | PlayerState {
		const target = this.getImplicitTarget();
		if (!target) {
			throw new Error('No implicit target');
		}
		return target;
	}

	getImplicitSubject(): CardState | PlayerState | undefined {
		if (this.implicitSubjectStack.length === 0) {
			return undefined;
		}
		const id = this.implicitSubjectStack[this.implicitSubjectStack.length - 1];
		if (isCardId(id)) return this.getCard(id);
		return this.getPlayer(id);
	}

	requireImplicitSubject(): CardState | PlayerState {
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

export class ReadonlyGameState extends GameState {
	declare readonly players: ReadonlyArray<ReadonlyPlayerState>;
	declare readonly locations: ReadonlyArray<ReadonlyLocationState>;

	getEntityState(entityId: CardId): ReadonlyCardState | undefined;
	getEntityState(entityId: PlayerId): ReadonlyPlayerState | undefined;
	getEntityState(entityId: EntityId): ReadonlyCardState | ReadonlyPlayerState | undefined;
	getEntityState(entityId: EntityId): ReadonlyCardState | ReadonlyPlayerState | undefined {
		if (isCardId(entityId)) {
			return this.getCard(entityId);
		} else if (isPlayerId(entityId)) {
			return this.getPlayer(entityId);
		}
		return undefined;
	}

	requireEntityState(entityId: CardId): ReadonlyCardState;
	requireEntityState(entityId: PlayerId): ReadonlyPlayerState;
	requireEntityState(entityId: EntityId): ReadonlyCardState | ReadonlyPlayerState;
	requireEntityState(entityId: EntityId): ReadonlyCardState | ReadonlyPlayerState {
		const entity = this.getEntityState(entityId);
		if (!entity) {
			throw new Error(`Entity with id ${entityId} not found`);
		}
		return entity;
	}

	cards(options?: CardOptions): Array<ReadonlyCardState> {
		return super.cards(options) as Array<ReadonlyCardState>;
	}

	getCard(cardId: CardId): ReadonlyCardState | undefined {
		return super.getCard(cardId) as ReadonlyCardState | undefined;
	}

	requireCard(cardId: CardId): ReadonlyCardState {
		return super.requireCard(cardId) as ReadonlyCardState;
	}

	getPlayer(playerId: PlayerId): ReadonlyPlayerState | undefined {
		return super.getPlayer(playerId) as ReadonlyPlayerState | undefined;
	}

	requirePlayer(playerId: PlayerId): ReadonlyPlayerState {
		return super.requirePlayer(playerId) as ReadonlyPlayerState;
	}

	getActiveCard(): ReadonlyCardState | undefined {
		return super.getActiveCard() as ReadonlyCardState | undefined;
	}

	requireActiveCard(): ReadonlyCardState {
		return super.requireActiveCard() as ReadonlyCardState;
	}

	getActivePlayer(): ReadonlyPlayerState | undefined {
		return super.getActivePlayer() as ReadonlyPlayerState | undefined;
	}

	requireActivePlayer(): ReadonlyPlayerState {
		return super.requireActivePlayer() as ReadonlyPlayerState;
	}

	getImplicitTarget(): ReadonlyCardState | ReadonlyPlayerState | undefined {
		return super.getImplicitTarget() as ReadonlyCardState | ReadonlyPlayerState | undefined;
	}

	requireImplicitTarget(): ReadonlyCardState | ReadonlyPlayerState {
		return super.requireImplicitTarget() as ReadonlyCardState | ReadonlyPlayerState;
	}

	getImplicitSubject(): ReadonlyCardState | ReadonlyPlayerState | undefined {
		return super.getImplicitSubject() as ReadonlyCardState | ReadonlyPlayerState | undefined;
	}

	requireImplicitSubject(): ReadonlyCardState | ReadonlyPlayerState {
		return super.requireImplicitSubject() as ReadonlyCardState | ReadonlyPlayerState;
	}

	mutable(): MutableGameState {
		return new MutableGameState(this);
	}

	mutate(callback: (mutableState: MutableGameState) => void): ReadonlyGameState {
		const mutableState = this.mutable();
		callback(mutableState);
		return mutableState.readonly();
	}
}

export class MutableGameState extends GameState {
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

	getEntityState(entityId: CardId): MutableCardState | undefined;
	getEntityState(entityId: PlayerId): MutablePlayerState | undefined;
	getEntityState(entityId: EntityId): MutableCardState | MutablePlayerState | undefined;
	getEntityState(entityId: EntityId): MutableCardState | MutablePlayerState | undefined {
		if (isCardId(entityId)) {
			return this.getCard(entityId);
		} else if (isPlayerId(entityId)) {
			return this.getPlayer(entityId);
		}
		return undefined;
	}

	requireEntityState(entityId: CardId): MutableCardState;
	requireEntityState(entityId: PlayerId): MutablePlayerState;
	requireEntityState(entityId: EntityId): MutableCardState | MutablePlayerState;
	requireEntityState(entityId: EntityId): MutableCardState | MutablePlayerState {
		const entity = this.getEntityState(entityId);
		if (!entity) {
			throw new Error(`Entity with id ${entityId} not found`);
		}
		return entity;
	}

	cards(options?: CardOptions): Array<MutableCardState> {
		return super.cards(options) as Array<MutableCardState>;
	}

	getCard(cardId: CardId): MutableCardState | undefined {
		return super.getCard(cardId) as MutableCardState | undefined;
	}

	requireTarget(id: EntityId): MutableCardState | MutablePlayerState {
		if (isCardId(id)) {
			return this.requireCard(id);
		} else if (isPlayerId(id)) {
			return this.requirePlayer(id);
		}
		throw new Error(`Invalid EntityId: ${id}`);
	}

	requireCard(cardId: CardId): MutableCardState {
		return super.requireCard(cardId) as MutableCardState;
	}

	getPlayer(playerId: PlayerId): MutablePlayerState | undefined {
		return super.getPlayer(playerId) as MutablePlayerState | undefined;
	}

	requirePlayer(playerId: PlayerId): MutablePlayerState {
		return super.requirePlayer(playerId) as MutablePlayerState;
	}

	getActiveCard(): MutableCardState | undefined {
		return super.getActiveCard() as MutableCardState | undefined;
	}

	requireActiveCard(): MutableCardState {
		return super.requireActiveCard() as MutableCardState;
	}

	getActivePlayer(): MutablePlayerState | undefined {
		return super.getActivePlayer() as MutablePlayerState | undefined;
	}

	requireActivePlayer(): MutablePlayerState {
		return super.requireActivePlayer() as MutablePlayerState;
	}

	getImplicitTarget(): MutableCardState | MutablePlayerState | undefined {
		return super.getImplicitTarget() as MutableCardState | MutablePlayerState | undefined;
	}

	requireImplicitTarget(): MutableCardState | MutablePlayerState {
		return super.requireImplicitTarget() as MutableCardState | MutablePlayerState;
	}

	getImplicitSubject(): MutableCardState | MutablePlayerState | undefined {
		return super.getImplicitSubject() as MutableCardState | MutablePlayerState | undefined;
	}

	requireImplicitSubject(): MutableCardState | MutablePlayerState {
		return super.requireImplicitSubject() as MutableCardState | MutablePlayerState;
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
