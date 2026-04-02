import { CardState, type MutableCardState, type ReadonlyCardState } from './cardstate';
import { PlayerState, type MutablePlayerState, type ReadonlyPlayerState } from './playerstate';

export interface GameStateProps {
	players: ReadonlyArray<PlayerState>;
	activeCardStack?: Array<number>;
	activePlayerStack?: Array<number>;
}

export class GameState {
	readonly players: ReadonlyArray<PlayerState>;
	readonly activeCardStack: Array<number>;
	readonly activePlayerStack: Array<number>;

	constructor({ players, activeCardStack, activePlayerStack }: GameStateProps) {
		this.players = players;
		this.activeCardStack = activeCardStack ?? [];
		this.activePlayerStack = activePlayerStack ?? [];
	}

	getCard(cardId: number): CardState | undefined {
		for (const player of this.players) {
			const found = player.getCard(cardId);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(cardId: number): CardState {
		const card = this.getCard(cardId);
		if (!card) {
			throw new Error(`Card with id ${cardId} not found`);
		}
		return card;
	}

	getPlayer(playerId: number): PlayerState | undefined {
		return this.players.find((player) => player.id === playerId);
	}

	requirePlayer(playerId: number): PlayerState {
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
}

export class ReadonlyGameState extends GameState {
	declare readonly players: ReadonlyArray<ReadonlyPlayerState>;

	getCard(cardId: number): ReadonlyCardState | undefined {
		return super.getCard(cardId) as ReadonlyCardState | undefined;
	}

	requireCard(cardId: number): ReadonlyCardState {
		return super.requireCard(cardId) as ReadonlyCardState;
	}

	getPlayer(playerId: number): ReadonlyPlayerState | undefined {
		return super.getPlayer(playerId) as ReadonlyPlayerState | undefined;
	}

	requirePlayer(playerId: number): ReadonlyPlayerState {
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
	declare activeCardStack: Array<number>;
	declare activePlayerStack: Array<number>;

	constructor(gameState: ReadonlyGameState) {
		super({
			players: gameState.players.map((player) => player.mutable()),
			activeCardStack: [...gameState.activeCardStack],
			activePlayerStack: [...gameState.activePlayerStack]
		});
	}

	getCard(cardId: number): MutableCardState | undefined {
		return super.getCard(cardId) as MutableCardState | undefined;
	}

	requireCard(cardId: number): MutableCardState {
		return super.requireCard(cardId) as MutableCardState;
	}

	getPlayer(playerId: number): MutablePlayerState | undefined {
		return super.getPlayer(playerId) as MutablePlayerState | undefined;
	}

	requirePlayer(playerId: number): MutablePlayerState {
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

	readonly(): ReadonlyGameState {
		return new ReadonlyGameState({
			players: this.players.map((playerAlteration) => playerAlteration.readonly()),
			activeCardStack: [...this.activeCardStack],
			activePlayerStack: [...this.activePlayerStack]
		});
	}
}
