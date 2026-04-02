import type { Stat } from '../..';
import type { CharacterState } from '../characters';
import { type Focus } from '../focus';
import {
	CardState,
	type CardLocation,
	type MutableCardState,
	type ReadonlyCardState
} from './cardstate';
import type { MutableGameState } from './gamestate';

export interface PlayerStateProps {
	id: number;
	character: CharacterState;
	deck: ReadonlyArray<CardState>;
	hand: ReadonlyArray<CardState>;
	playArea: ReadonlyArray<CardState>;
	discardPile: ReadonlyArray<CardState>;
	focusesBag: ReadonlyMap<Focus, Record<number, number>>;
	focusesHand: ReadonlyMap<Focus, Record<number, number>>;
	physicalTrauma: number;
	mentalTrauma: number;
}

export class PlayerState {
	readonly id: number;
	readonly character: CharacterState;
	readonly deck: ReadonlyArray<CardState>;
	readonly hand: ReadonlyArray<CardState>;
	readonly playArea: ReadonlyArray<CardState>;
	readonly discardPile: ReadonlyArray<CardState>;
	readonly physicalTrauma: number;
	readonly mentalTrauma: number;
	readonly focusesBag: ReadonlyMap<Focus, Record<number, number>>;
	readonly focusesHand: ReadonlyMap<Focus, Record<number, number>>;

	constructor({
		id,
		character,
		deck,
		hand,
		playArea,
		discardPile,
		focusesBag,
		focusesHand,
		physicalTrauma,
		mentalTrauma
	}: PlayerStateProps) {
		this.id = id;
		this.character = character;
		this.deck = deck;
		this.hand = hand;
		this.playArea = playArea;
		this.discardPile = discardPile;
		this.focusesBag = focusesBag;
		this.focusesHand = focusesHand;
		this.physicalTrauma = physicalTrauma;
		this.mentalTrauma = mentalTrauma;
	}

	cards(): Array<CardState> {
		return [...this.hand, ...this.playArea];
	}

	getCard(id: number): CardState | undefined {
		for (const card of this.cards()) {
			const found = card.getCard(id);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(id: number): CardState {
		const card = this.getCard(id);
		if (!card) {
			throw new Error(`Card with id ${id} not found in player's hand or play area`);
		}
		return card;
	}

	getStat(stat: Stat): number {
		// TODO: Apply transient effects
		return this.character.getBaseStat(stat);
	}
}

export class ReadonlyPlayerState extends PlayerState {
	declare readonly deck: ReadonlyArray<ReadonlyCardState>;
	declare readonly hand: ReadonlyArray<ReadonlyCardState>;
	declare readonly playArea: ReadonlyArray<ReadonlyCardState>;
	declare readonly discardPile: ReadonlyArray<ReadonlyCardState>;

	cards(): Array<ReadonlyCardState> {
		return [...this.hand, ...this.playArea];
	}

	getCard(id: number): ReadonlyCardState | undefined {
		return super.getCard(id) as ReadonlyCardState | undefined;
	}

	requireCard(id: number): ReadonlyCardState {
		return super.requireCard(id) as ReadonlyCardState;
	}

	mutable(): MutablePlayerState {
		return new MutablePlayerState(this);
	}

	mutate(change: (state: MutablePlayerState) => void): ReadonlyPlayerState {
		const mutableState = this.mutable();
		change(mutableState);
		return mutableState.readonly();
	}
}

export class MutablePlayerState extends PlayerState {
	declare character: CharacterState;
	declare deck: Array<MutableCardState>;
	declare hand: Array<MutableCardState>;
	declare playArea: Array<MutableCardState>;
	declare discardPile: Array<MutableCardState>;
	declare physicalTrauma: number;
	declare mentalTrauma: number;
	declare focusesBag: Map<Focus, Record<number, number>>;
	declare focusesHand: Map<Focus, Record<number, number>>;

	constructor(playerState: ReadonlyPlayerState) {
		super({
			id: playerState.id,
			character: playerState.character,
			deck: playerState.deck.map((card) => card.mutable()),
			hand: playerState.hand.map((card) => card.mutable()),
			playArea: playerState.playArea.map((card) => card.mutable()),
			discardPile: playerState.discardPile.map((card) => card.mutable()),
			physicalTrauma: playerState.physicalTrauma,
			mentalTrauma: playerState.mentalTrauma,
			focusesBag: new Map(playerState.focusesBag),
			focusesHand: new Map(playerState.focusesHand)
		});
	}

	cards(): Array<MutableCardState> {
		return [...this.hand, ...this.playArea];
	}

	getCard(id: number): MutableCardState | undefined {
		return super.getCard(id) as MutableCardState | undefined;
	}

	requireCard(id: number): MutableCardState {
		return super.requireCard(id) as MutableCardState;
	}

	readonly(): ReadonlyPlayerState {
		return new ReadonlyPlayerState({
			id: this.id,
			character: this.character,
			deck: this.deck.map((card) => card.readonly()),
			hand: this.hand.map((card) => card.readonly()),
			playArea: this.playArea.map((card) => card.readonly()),
			discardPile: this.discardPile.map((card) => card.readonly()),
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma,
			focusesBag: new Map(this.focusesBag),
			focusesHand: new Map(this.focusesHand)
		});
	}

	drawFromDeck(gameState: MutableGameState, amount: number = 1): Array<MutableCardState> {
		const drawnCards: Array<MutableCardState> = [];
		for (let i = 0; i < amount; i++) {
			if (this.deck.length === 0) {
				this.shuffleDiscardIntoDeck(gameState);
			}
			const drawnCard = this.deck[0];
			if (drawnCard) {
				drawnCard.moveToHand(gameState, this.id);
				drawnCards.push(drawnCard);
			}
		}
		return drawnCards;
	}

	shuffleDiscardIntoDeck(_state: MutableGameState) {
		const location: CardLocation = { container: 'deck', playerId: this.id };
		for (const card of this.discardPile) {
			this.deck.push(card);
			card.location = location;
		}
		shuffle(this.deck);
	}
}

const shuffle = <T>(array: Array<T>) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};
