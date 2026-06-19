import {
	Counter,
	shuffle,
	weightedChoice,
	type BaseCounter,
	type ReadonlyCounter
} from '@songsofdoom/common';
import type { CharacterState, Property, Stat, StatType } from '@songsofdoom/game';
import {
	getFocusTokenType,
	getFocusTokenValue,
	type FocusToken,
	type FocusType
} from '@songsofdoom/game';
import type { CardOptions } from './cardcontainer';
import type { CardParent, CardState, MutableCardState, ReadonlyCardState } from './cardstate';
import { EntityState, type MutableEntityState } from './entitystate';
import { addPropertyToEntity, moveCardToPlayer, mutate } from './entitystatemutation';
import type { MutableGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';

export interface PlayerStateProps {
	id: PlayerId;
	character: CharacterState;
	deck?: ReadonlyArray<CardState>;
	hand?: ReadonlyArray<CardState>;
	stage?: ReadonlyArray<CardState>;
	discardPile?: ReadonlyArray<CardState>;
	banishedCards?: ReadonlyArray<CardState>;
	attachments?: ReadonlyArray<CardState>;
	properties?: ReadonlyArray<Property>;
	clues?: number;
	gold?: number;
	focusesBag?: BaseCounter<FocusToken>;
	focusesDiscardPile?: BaseCounter<FocusToken>;
	focusesHand?: BaseCounter<FocusToken>;
	physicalTrauma?: number;
	mentalTrauma?: number;
	defeated?: boolean;
	activated?: boolean;
}

export interface ReadonlyPlayerStateProps extends PlayerStateProps {
	deck?: ReadonlyArray<ReadonlyCardState>;
	hand?: ReadonlyArray<ReadonlyCardState>;
	stage?: ReadonlyArray<ReadonlyCardState>;
	discardPile?: ReadonlyArray<ReadonlyCardState>;
	banishedCards?: ReadonlyArray<ReadonlyCardState>;
	attachments?: ReadonlyArray<ReadonlyCardState>;
	properties?: ReadonlyArray<Property>;
	focusesBag?: ReadonlyCounter<FocusToken>;
	focusesDiscardPile?: ReadonlyCounter<FocusToken>;
	focusesHand?: ReadonlyCounter<FocusToken>;
}

export interface MutablePlayerStateProps extends PlayerStateProps {
	deck?: ReadonlyArray<MutableCardState>;
	hand?: ReadonlyArray<MutableCardState>;
	stage?: ReadonlyArray<MutableCardState>;
	discardPile?: ReadonlyArray<MutableCardState>;
	banishedCards?: ReadonlyArray<MutableCardState>;
	attachments?: ReadonlyArray<MutableCardState>;
	properties?: ReadonlyArray<Property>;
	focusesBag?: Counter<FocusToken>;
	focusesDiscardPile?: Counter<FocusToken>;
	focusesHand?: Counter<FocusToken>;
}

export abstract class PlayerState<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default for self-referential generic
	TCard extends CardState<TCard> = CardState<any>
> extends EntityState<PlayerId, TCard> {
	readonly character: CharacterState;
	readonly deck: ReadonlyArray<TCard>;
	readonly hand: ReadonlyArray<TCard>;
	readonly stage: ReadonlyArray<TCard>;
	readonly discardPile: ReadonlyArray<TCard>;
	readonly banishedCards: ReadonlyArray<TCard>;
	readonly clues: number;
	readonly gold: number;
	readonly focusesBag: BaseCounter<FocusToken>;
	readonly focusesDiscardPile: BaseCounter<FocusToken>;
	readonly focusesHand: BaseCounter<FocusToken>;
	readonly defeated: boolean;
	readonly activated: boolean;

	constructor({
		id,
		character,
		deck,
		hand,
		stage,
		discardPile,
		banishedCards,
		attachments,
		properties,
		clues,
		gold,
		focusesBag,
		focusesDiscardPile,
		focusesHand,
		physicalTrauma,
		mentalTrauma,
		defeated,
		activated
	}: PlayerStateProps) {
		super({
			id,
			attachments,
			properties: properties ?? [],
			physicalTrauma,
			mentalTrauma,
			activated
		});
		this.character = character;
		this.deck = (deck ?? []) as ReadonlyArray<TCard>;
		this.hand = (hand ?? []) as ReadonlyArray<TCard>;
		this.stage = (stage ?? []) as ReadonlyArray<TCard>;
		this.discardPile = (discardPile ?? []) as ReadonlyArray<TCard>;
		this.banishedCards = (banishedCards ?? []) as ReadonlyArray<TCard>;
		this.clues = clues ?? 0;
		this.gold = gold ?? 0;
		this.focusesBag = focusesBag ?? new Counter<FocusToken>();
		this.focusesDiscardPile = focusesDiscardPile ?? new Counter<FocusToken>();
		this.focusesHand = focusesHand ?? new Counter<FocusToken>();
		this.defeated = defeated ?? false;
		this.activated = activated ?? false;
	}

	override get playerId(): PlayerId | undefined {
		return this.id;
	}

	override hostile = false;

	cards(options?: CardOptions): Array<TCard> {
		const ready = options?.ready ?? false;
		const includeAttachments = options?.includeAttachments ?? true;
		return [
			...this.hand.flatMap((card) => card.cards(options)),
			...this.stage.flatMap((card) => card.cards(options)),
			...(includeAttachments ? this.attachments.flatMap((card) => card.cards(options)) : []),
			...(ready ? [] : this.deck.flatMap((card) => card.cards(options))),
			...(ready ? [] : this.discardPile.flatMap((card) => card.cards(options))),
			...(ready ? [] : this.banishedCards.flatMap((card) => card.cards(options)))
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

	getStat(stat: Stat | StatType): number {
		// TODO: Apply transient effects
		return this.character.getBaseStat(stat);
	}

	hasEnoughFocusOfType(focusType: FocusType, requiredAmount: number): boolean {
		let availableFocusOfType = 0;
		for (const [token, amount] of this.focusesBag.entries()) {
			if (getFocusTokenType(token) === focusType) {
				availableFocusOfType += getFocusTokenValue(token) * amount;
			}
			if (availableFocusOfType >= requiredAmount) {
				return true;
			}
		}
		return false;
	}
}

export class ReadonlyPlayerState extends PlayerState<ReadonlyCardState> {
	mutable(): MutablePlayerState {
		return new MutablePlayerState({
			id: this.id,
			character: this.character,
			deck: this.deck.map((card) => card.mutable()),
			hand: this.hand.map((card) => card.mutable()),
			stage: this.stage.map((card) => card.mutable()),
			discardPile: this.discardPile.map((card) => card.mutable()),
			banishedCards: this.banishedCards.map((card) => card.mutable()),
			attachments: this.attachments.map((card) => card.mutable()),
			properties: [...this.properties],
			clues: this.clues,
			gold: this.gold,
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma,
			defeated: this.defeated,
			activated: this.activated,
			focusesBag: new Counter(this.focusesBag),
			focusesHand: new Counter(this.focusesHand),
			focusesDiscardPile: new Counter(this.focusesDiscardPile)
		});
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
	declare activated: boolean;
	declare focusesBag: Counter<FocusToken>;
	declare focusesHand: Counter<FocusToken>;
	declare focusesDiscardPile: Counter<FocusToken>;
	declare gold: number;

	constructor(props: MutablePlayerStateProps) {
		super(props);
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
			activated: this.activated,
			focusesBag: new Counter(this.focusesBag),
			focusesHand: new Counter(this.focusesHand),
			focusesDiscardPile: new Counter(this.focusesDiscardPile),
			gold: this.gold
		});
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState): void {
		moveCardToPlayer(attachment, gameState, this.id);
	}

	addProperty(property: Property): void {
		addPropertyToEntity(this, property);
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

	discardFocusToken(token: FocusToken, count: number = 1): void {
		this.focusesHand.remove(token, count);
		this.focusesDiscardPile.add(token, count);
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
