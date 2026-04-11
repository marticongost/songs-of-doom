import { Counter, shuffle, weightedChoice, type ReadonlyCounter } from '@songsofdoom/common';
import type { FocusToken, Property, Stat } from '../..';
import type { CharacterState } from '../characters';
import {
	CardState,
	type CardOptions,
	type CardParent,
	type MutableCardState,
	type ReadonlyCardState
} from './cardstate';
import { EntityState, type MutableEntityState } from './entitystate';
import type { MutableGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';

export interface PlayerStateProps {
	id: PlayerId;
	character: CharacterState;
	deck: ReadonlyArray<CardState>;
	hand: ReadonlyArray<CardState>;
	discardPile: ReadonlyArray<CardState>;
	attachments?: ReadonlyArray<CardState>;
	properties?: ReadonlyArray<Property>;
	clues?: number;
	focusesBag: ReadonlyCounter<FocusToken>;
	focusesDiscardPile: ReadonlyCounter<FocusToken>;
	focusesHand: ReadonlyCounter<FocusToken>;
	physicalTrauma: number;
	mentalTrauma: number;
}

export class PlayerState extends EntityState<PlayerId> {
	readonly character: CharacterState;
	readonly deck: ReadonlyArray<CardState>;
	readonly hand: ReadonlyArray<CardState>;
	readonly discardPile: ReadonlyArray<CardState>;
	readonly clues: number;
	readonly focusesBag: ReadonlyCounter<FocusToken>;
	readonly focusesDiscardPile: ReadonlyCounter<FocusToken>;
	readonly focusesHand: ReadonlyCounter<FocusToken>;

	constructor({
		id,
		character,
		deck,
		hand,
		discardPile,
		attachments = [],
		properties,
		clues = 0,
		focusesBag,
		focusesDiscardPile,
		focusesHand,
		physicalTrauma,
		mentalTrauma
	}: PlayerStateProps) {
		super({ id, attachments, properties: properties ?? [], physicalTrauma, mentalTrauma });
		this.character = character;
		this.deck = deck;
		this.hand = hand;
		this.discardPile = discardPile;
		this.clues = clues;
		this.focusesBag = focusesBag;
		this.focusesDiscardPile = focusesDiscardPile;
		this.focusesHand = focusesHand;
	}

	cards(options?: CardOptions): Array<CardState> {
		if (options?.ready) {
			return [...this.hand, ...this.attachments].filter((card) => !card.exhausted);
		}
		return [...this.deck, ...this.hand, ...this.discardPile, ...this.attachments];
	}

	getCard(id: CardId): CardState | undefined {
		for (const card of this.cards()) {
			const found = card.getCard(id);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(id: CardId): CardState {
		const card = this.getCard(id);
		if (!card) {
			throw new Error(`Card with id ${id} not found in player's hand or attachments`);
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
	declare readonly discardPile: ReadonlyArray<ReadonlyCardState>;
	declare readonly attachments: ReadonlyArray<ReadonlyCardState>;

	cards(options?: CardOptions): Array<ReadonlyCardState> {
		return super.cards(options) as Array<ReadonlyCardState>;
	}

	getCard(id: CardId): ReadonlyCardState | undefined {
		return super.getCard(id) as ReadonlyCardState | undefined;
	}

	requireCard(id: CardId): ReadonlyCardState {
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

export class MutablePlayerState extends PlayerState implements MutableEntityState<PlayerId> {
	declare character: CharacterState;
	declare deck: Array<MutableCardState>;
	declare hand: Array<MutableCardState>;
	declare discardPile: Array<MutableCardState>;
	declare attachments: Array<MutableCardState>;
	declare properties: Array<Property>;
	declare clues: number;
	declare physicalTrauma: number;
	declare mentalTrauma: number;
	declare focusesBag: Counter<FocusToken>;
	declare focusesHand: Counter<FocusToken>;
	declare focusesDiscardPile: Counter<FocusToken>;

	constructor(playerState: ReadonlyPlayerState) {
		super({
			id: playerState.id,
			character: playerState.character,
			deck: playerState.deck.map((card) => card.mutable()),
			hand: playerState.hand.map((card) => card.mutable()),
			discardPile: playerState.discardPile.map((card) => card.mutable()),
			attachments: playerState.attachments.map((card) => card.mutable()),
			properties: [...playerState.properties],
			clues: playerState.clues,
			physicalTrauma: playerState.physicalTrauma,
			mentalTrauma: playerState.mentalTrauma,
			focusesBag: new Counter(playerState.focusesBag),
			focusesHand: new Counter(playerState.focusesHand),
			focusesDiscardPile: new Counter(playerState.focusesDiscardPile)
		});
	}

	cards(options?: CardOptions): Array<MutableCardState> {
		return super.cards(options) as Array<MutableCardState>;
	}

	getCard(id: CardId): MutableCardState | undefined {
		return super.getCard(id) as MutableCardState | undefined;
	}

	requireCard(id: CardId): MutableCardState {
		return super.requireCard(id) as MutableCardState;
	}

	readonly(): ReadonlyPlayerState {
		return new ReadonlyPlayerState({
			id: this.id,
			character: this.character,
			deck: this.deck.map((card) => card.readonly()),
			hand: this.hand.map((card) => card.readonly()),
			discardPile: this.discardPile.map((card) => card.readonly()),
			attachments: this.attachments.map((card) => card.readonly()),
			properties: [...this.properties],
			clues: this.clues,
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma,
			focusesBag: new Counter(this.focusesBag),
			focusesHand: new Counter(this.focusesHand),
			focusesDiscardPile: new Counter(this.focusesDiscardPile)
		});
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState) {
		attachment.moveToPlayer(gameState, this.id);
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
		const location: CardParent = { type: 'deck', playerId: this.id };
		const discardPile = this.discardPile;
		this.discardPile = [];
		for (const card of discardPile) {
			this.deck.push(card);
			card.container = location;
		}
		shuffle(this.deck);
	}

	drawFocusToken(gameState: MutableGameState): FocusToken {
		if (this.focusesBag.isEmpty()) {
			this.refillFocusBag(gameState);
		}
		const token = weightedChoice(this.focusesBag);
		if (!token) {
			// This should never happen
			throw new Error('Focus bag is empty');
		}
		this.focusesBag.add(token, -1);
		this.focusesHand.add(token);
		return token;
	}

	refillFocusBag(_gameState: MutableGameState) {
		for (const [token, count] of this.focusesDiscardPile.entries()) {
			this.focusesBag.add(token, count);
		}
		this.focusesDiscardPile = new Counter();
	}
}
