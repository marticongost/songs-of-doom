import type { BooleanExpressionType } from '../expressions/boolean/boolean-expression';
import type { ScalarExpressionType } from '../expressions/scalar/scalar-expression';
import {
	CardState,
	type CardOptions,
	type MutableCardState,
	type ReadonlyCardState
} from './cardstate';
import { isCardId, isPlayerId, type CardId, type PlayerId, type TargetId } from './identifiers';
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
	implicitTargetStack?: Array<TargetId>;
}

export class GameState {
	readonly players: ReadonlyArray<PlayerState>;
	readonly locations: ReadonlyArray<LocationState>;
	readonly activeCardStack: Array<CardId>;
	readonly activePlayerStack: Array<PlayerId>;
	readonly implicitTargetStack: Array<TargetId>;

	constructor({
		players,
		locations,
		activeCardStack,
		activePlayerStack,
		implicitTargetStack
	}: GameStateProps) {
		this.players = players;
		this.locations = locations ?? [];
		this.activeCardStack = activeCardStack ?? [];
		this.activePlayerStack = activePlayerStack ?? [];
		this.implicitTargetStack = implicitTargetStack ?? [];
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
	declare implicitTargetStack: Array<TargetId>;

	constructor(gameState: ReadonlyGameState) {
		super({
			players: gameState.players.map((player) => player.mutable()),
			locations: gameState.locations.map((location) => location.mutable()),
			activeCardStack: [...gameState.activeCardStack],
			activePlayerStack: [...gameState.activePlayerStack],
			implicitTargetStack: [...gameState.implicitTargetStack]
		});
	}

	cards(options?: CardOptions): Array<MutableCardState> {
		return super.cards(options) as Array<MutableCardState>;
	}

	getCard(cardId: CardId): MutableCardState | undefined {
		return super.getCard(cardId) as MutableCardState | undefined;
	}

	requireTarget(id: TargetId): MutableCardState | MutablePlayerState {
		if (isCardId(id)) {
			return this.requireCard(id);
		} else if (isPlayerId(id)) {
			return this.requirePlayer(id);
		}
		throw new Error(`Invalid TargetId: ${id}`);
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

	readonly(): ReadonlyGameState {
		return new ReadonlyGameState({
			players: this.players.map((playerAlteration) => playerAlteration.readonly()),
			locations: this.locations.map((location) => location.readonly()),
			activeCardStack: [...this.activeCardStack],
			activePlayerStack: [...this.activePlayerStack],
			implicitTargetStack: [...this.implicitTargetStack]
		});
	}
}
