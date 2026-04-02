import type { Property } from '../..';
import type { Entity } from '../entities';
import type { MutableGameState } from './gamestate';

export type CardLocation =
	| { container: 'deck'; playerId: number }
	| { container: 'hand'; playerId: number }
	| { container: 'discard'; playerId: number }
	| { container: 'play'; playerId: number }
	| { container: 'card'; cardId: number };

export interface CardStateProps {
	id: number;
	card: Entity;
	ownerId: number;
	location: CardLocation;
	exhausted?: boolean;
	charges?: number;
	attachments?: ReadonlyArray<CardState>;
}

export class CardState {
	readonly id: number;
	readonly card: Entity;
	readonly ownerId: number;
	readonly location: CardLocation;
	readonly exhausted: boolean;
	readonly charges: number;
	readonly attachments: ReadonlyArray<CardState>;

	constructor({
		id,
		card,
		ownerId,
		location,
		exhausted = false,
		charges = 0,
		attachments = []
	}: CardStateProps) {
		this.id = id;
		this.card = card;
		this.ownerId = ownerId;
		this.location = location;
		this.exhausted = exhausted;
		this.charges = charges;
		this.attachments = attachments;
	}

	getCard(id: number): CardState | undefined {
		if (this.id === id) {
			return this;
		}
		for (const attachment of this.attachments) {
			const found = attachment.getCard(id);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(id: number): CardState {
		const card = this.getCard(id);
		if (!card) {
			throw new Error(`Card with id ${id} not found`);
		}
		return card;
	}

	/** Determines whether the card has the given property, taking into account any
	 * effects that might modify its properties.
	 * @param property The property to check for.
	 * @return True if the card has the property, false otherwise.
	 */
	hasProperty(property: Property): boolean {
		// TODO: Apply transient effects that might grant or remove properties beyond the
		// card's inherent ones
		return this.card.properties.includes(property);
	}
}

export class ReadonlyCardState extends CardState {
	declare readonly attachments: ReadonlyArray<ReadonlyCardState>;

	getCard(id: number): ReadonlyCardState | undefined {
		return super.getCard(id) as ReadonlyCardState | undefined;
	}

	requireCard(id: number): ReadonlyCardState {
		return super.requireCard(id) as ReadonlyCardState;
	}

	mutable(): MutableCardState {
		return new MutableCardState(this);
	}

	mutate(change: (state: MutableCardState) => void): ReadonlyCardState {
		const mutableState = this.mutable();
		change(mutableState);
		return mutableState.readonly();
	}
}

export class MutableCardState extends CardState {
	declare exhausted: boolean;
	declare charges: number;
	declare attachments: Array<MutableCardState>;
	declare location: CardLocation;

	constructor(cardState: ReadonlyCardState) {
		super({
			id: cardState.id,
			card: cardState.card,
			ownerId: cardState.ownerId,
			location: cardState.location,
			exhausted: cardState.exhausted,
			charges: cardState.charges,
			attachments: cardState.attachments.map((attachment) => attachment.mutable())
		});
	}

	getCard(id: number): MutableCardState | undefined {
		return super.getCard(id) as MutableCardState | undefined;
	}

	requireCard(id: number): MutableCardState {
		return super.requireCard(id) as MutableCardState;
	}

	readonly(): ReadonlyCardState {
		return new ReadonlyCardState({
			id: this.id,
			card: this.card,
			ownerId: this.ownerId,
			location: this.location,
			exhausted: this.exhausted,
			charges: this.charges,
			attachments: this.attachments.map((attachment) => attachment.readonly())
		});
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState) {
		attachment.removeFromCurrentLocation(gameState);
		attachment.location = { container: 'card', cardId: this.id };
		this.attachments.push(attachment);
	}

	moveToPlayArea(gameState: MutableGameState, playerId: number) {
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'play', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.playArea.push(this);
	}

	moveToTopOfDiscardPile(gameState: MutableGameState, playerId: number | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.unshift(this);
	}

	moveToBottomOfDiscardPile(gameState: MutableGameState, playerId: number | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.push(this);
	}

	moveToHand(gameState: MutableGameState, playerId: number) {
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'hand', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.hand.push(this);
	}

	moveToTopOfDeck(gameState: MutableGameState, playerId: number | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.unshift(this);
	}

	moveToBottomOfDeck(gameState: MutableGameState, playerId: number | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.push(this);
	}

	private removeFromCurrentLocation(gameState: MutableGameState) {
		if (this.location.container === 'card') {
			const previousContainer = gameState.requireCard(this.location.cardId);
			previousContainer.attachments = previousContainer.attachments.filter((a) => a.id !== this.id);
		} else if (this.location.container === 'play') {
			const playerState = gameState.requirePlayer(this.location.playerId);
			playerState.playArea = playerState.playArea.filter((c) => c.id !== this.id);
		} else if (this.location.container === 'discard') {
			const playerState = gameState.requirePlayer(this.location.playerId);
			playerState.discardPile = playerState.discardPile.filter((c) => c.id !== this.id);
		} else if (this.location.container === 'hand') {
			const playerState = gameState.requirePlayer(this.location.playerId);
			playerState.hand = playerState.hand.filter((c) => c.id !== this.id);
		} else if (this.location.container === 'deck') {
			const playerState = gameState.requirePlayer(this.location.playerId);
			playerState.deck = playerState.deck.filter((c) => c.id !== this.id);
		}
	}
}
