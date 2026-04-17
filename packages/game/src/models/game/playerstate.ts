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
import { mutate } from './mutate';

export interface PlayerStateProps {
	id: PlayerId;
	character: CharacterState;
	deck: ReadonlyArray<CardState>;
	hand: ReadonlyArray<CardState>;
	stage?: ReadonlyArray<CardState>;
	discardPile: ReadonlyArray<CardState>;
	banishedCards?: ReadonlyArray<CardState>;
	attachments?: ReadonlyArray<CardState>;
	properties?: ReadonlyArray<Property>;
	clues?: number;
	focusesBag: ReadonlyCounter<FocusToken>;
	focusesDiscardPile: ReadonlyCounter<FocusToken>;
	focusesHand: ReadonlyCounter<FocusToken>;
	physicalTrauma: number;
	mentalTrauma: number;
	defeated?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PlayerState<TCard extends CardState<TCard> = CardState<any>> extends EntityState<
	PlayerId,
	TCard
> {
	readonly character: CharacterState;
	readonly deck: ReadonlyArray<TCard>;
	readonly hand: ReadonlyArray<TCard>;
	readonly stage: ReadonlyArray<TCard>;
	readonly discardPile: ReadonlyArray<TCard>;
	readonly banishedCards: ReadonlyArray<TCard>;
	readonly clues: number;
	readonly focusesBag: ReadonlyCounter<FocusToken>;
	readonly focusesDiscardPile: ReadonlyCounter<FocusToken>;
	readonly focusesHand: ReadonlyCounter<FocusToken>;
	readonly defeated: boolean;

	constructor({
		id,
		character,
		deck,
		hand,
		stage = [],
		discardPile,
		banishedCards = [],
		attachments = [],
		properties,
		clues = 0,
		focusesBag,
		focusesDiscardPile,
		focusesHand,
		physicalTrauma,
		mentalTrauma,
		defeated = false
	}: PlayerStateProps) {
		super({ id, attachments, properties: properties ?? [], physicalTrauma, mentalTrauma });
		this.character = character;
		this.deck = deck as ReadonlyArray<TCard>;
		this.hand = hand as ReadonlyArray<TCard>;
		this.stage = stage as ReadonlyArray<TCard>;
		this.discardPile = discardPile as ReadonlyArray<TCard>;
		this.banishedCards = banishedCards as ReadonlyArray<TCard>;
		this.clues = clues;
		this.focusesBag = focusesBag;
		this.focusesDiscardPile = focusesDiscardPile;
		this.focusesHand = focusesHand;
		this.defeated = defeated;
	}

	cards(options?: CardOptions): Array<TCard> {
		if (options?.ready) {
			return [...this.hand, ...this.stage, ...this.attachments].filter((card) => !card.exhausted);
		}
		return [
			...this.deck,
			...this.hand,
			...this.stage,
			...this.discardPile,
			...this.attachments,
			...this.banishedCards
		];
	}

	getCard(id: CardId): TCard | undefined {
		for (const card of this.cards()) {
			const found = card.getCard(id);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(id: CardId): TCard {
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

export class ReadonlyPlayerState extends PlayerState<ReadonlyCardState> {
	mutable(): MutablePlayerState {
		return new MutablePlayerState(this);
	}

	mutate(change: (state: MutablePlayerState) => void): ReadonlyPlayerState {
		return mutate(this as ReadonlyPlayerState, change);
	}
}

export class MutablePlayerState
	extends PlayerState<MutableCardState>
	implements MutableEntityState<PlayerId>
{
	declare character: CharacterState;
	declare deck: Array<MutableCardState>;
	declare hand: Array<MutableCardState>;
	declare stage: Array<MutableCardState>;
	declare discardPile: Array<MutableCardState>;
	declare banishedCards: Array<MutableCardState>;
	declare attachments: Array<MutableCardState>;
	declare properties: Array<Property>;
	declare clues: number;
	declare physicalTrauma: number;
	declare mentalTrauma: number;
	declare defeated: boolean;
	declare focusesBag: Counter<FocusToken>;
	declare focusesHand: Counter<FocusToken>;
	declare focusesDiscardPile: Counter<FocusToken>;

	constructor(playerState: ReadonlyPlayerState) {
		super({
			id: playerState.id,
			character: playerState.character,
			deck: playerState.deck.map((card) => card.mutable()),
			hand: playerState.hand.map((card) => card.mutable()),
			stage: playerState.stage.map((card) => card.mutable()),
			discardPile: playerState.discardPile.map((card) => card.mutable()),
			banishedCards: playerState.banishedCards.map((card) => card.mutable()),
			attachments: playerState.attachments.map((card) => card.mutable()),
			properties: [...playerState.properties],
			clues: playerState.clues,
			physicalTrauma: playerState.physicalTrauma,
			mentalTrauma: playerState.mentalTrauma,
			defeated: playerState.defeated,
			focusesBag: new Counter(playerState.focusesBag),
			focusesHand: new Counter(playerState.focusesHand),
			focusesDiscardPile: new Counter(playerState.focusesDiscardPile)
		});
	}

	readonly(): ReadonlyPlayerState {
		return new ReadonlyPlayerState({
			id: this.id,
			character: this.character,
			deck: this.deck.map((card) => card.readonly()),
			hand: this.hand.map((card) => card.readonly()),
			stage: this.stage.map((card) => card.readonly()),
			discardPile: this.discardPile.map((card) => card.readonly()),
			banishedCards: this.banishedCards.map((card) => card.readonly()),
			attachments: this.attachments.map((card) => card.readonly()),
			properties: [...this.properties],
			clues: this.clues,
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma,
			defeated: this.defeated,
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
