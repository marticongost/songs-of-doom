import { isSkill, Reaction, type Capability, type Property } from '../..';
import type { Entity } from '../entities';
import { events, type Event, type EventType } from '../event';
import type { MutableGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';

export interface CardOptions {
	ready?: boolean;
}

export interface CapabilityRef {
	cardId: CardId;
	capability: Capability;
}

export type CardLocation =
	| { container: 'deck'; playerId: PlayerId }
	| { container: 'hand'; playerId: PlayerId }
	| { container: 'discard'; playerId: PlayerId }
	| { container: 'card'; cardId: CardId }
	| { container: 'player'; playerId: PlayerId };

export interface CardStateProps {
	id: CardId;
	card: Entity;
	ownerId: PlayerId;
	location: CardLocation;
	exhausted?: boolean;
	charges?: number;
	attachments?: ReadonlyArray<CardState>;
	physicalTrauma?: number;
	mentalTrauma?: number;
}

export class CardState {
	readonly id: CardId;
	readonly card: Entity;
	readonly ownerId: PlayerId;
	readonly location: CardLocation;
	readonly exhausted: boolean;
	readonly charges: number;
	readonly attachments: ReadonlyArray<CardState>;
	readonly physicalTrauma: number;
	readonly mentalTrauma: number;

	constructor({
		id,
		card,
		ownerId,
		location,
		exhausted = false,
		charges = 0,
		attachments = [],
		physicalTrauma = 0,
		mentalTrauma = 0
	}: CardStateProps) {
		this.id = id;
		this.card = card;
		this.ownerId = ownerId;
		this.location = location;
		this.exhausted = exhausted;
		this.charges = charges;
		this.attachments = attachments;
		this.physicalTrauma = physicalTrauma;
		this.mentalTrauma = mentalTrauma;
	}

	getCard(id: CardId): CardState | undefined {
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

	requireCard(id: CardId): CardState {
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

	isAttached(): boolean {
		return this.location.container === 'card' || this.location.container === 'player';
	}

	getReactionsToEvent(event: Event | EventType): Array<Reaction> {
		if (typeof event === 'string') {
			event = events[event];
		}
		let capabilities: Array<Capability>;
		if (isSkill(this.card)) {
			capabilities = this.isAttached() ? this.card.attachmentCapabilities : this.card.capabilities;
		} else {
			capabilities = [
				...this.card.capabilities,
				...(this.isAttached() ? this.card.attachmentCapabilities : [])
			];
		}
		const reactions: Reaction[] = capabilities.filter(
			(capability) => capability instanceof Reaction && capability.triggers.includes(event)
		) as Reaction[];
		return reactions;
	}
}

export class ReadonlyCardState extends CardState {
	declare readonly attachments: ReadonlyArray<ReadonlyCardState>;

	getCard(id: CardId): ReadonlyCardState | undefined {
		return super.getCard(id) as ReadonlyCardState | undefined;
	}

	requireCard(id: CardId): ReadonlyCardState {
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
	declare physicalTrauma: number;
	declare mentalTrauma: number;

	constructor(cardState: ReadonlyCardState) {
		super({
			id: cardState.id,
			card: cardState.card,
			ownerId: cardState.ownerId,
			location: cardState.location,
			exhausted: cardState.exhausted,
			charges: cardState.charges,
			attachments: cardState.attachments.map((attachment) => attachment.mutable()),
			physicalTrauma: cardState.physicalTrauma,
			mentalTrauma: cardState.mentalTrauma
		});
	}

	getCard(id: CardId): MutableCardState | undefined {
		return super.getCard(id) as MutableCardState | undefined;
	}

	requireCard(id: CardId): MutableCardState {
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
			attachments: this.attachments.map((attachment) => attachment.readonly()),
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma
		});
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState) {
		attachment.removeFromCurrentLocation(gameState);
		attachment.location = { container: 'card', cardId: this.id };
		this.attachments.push(attachment);
	}

	moveToPlayer(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'player', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.attachments.push(this);
	}

	moveToTopOfDiscardPile(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.unshift(this);
	}

	moveToBottomOfDiscardPile(
		gameState: MutableGameState,
		playerId: PlayerId | undefined = undefined
	) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.push(this);
	}

	moveToHand(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'hand', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.hand.push(this);
	}

	moveToTopOfDeck(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.location = { container: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.unshift(this);
	}

	moveToBottomOfDeck(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
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
		} else if (this.location.container === 'player') {
			const playerState = gameState.requirePlayer(this.location.playerId);
			playerState.attachments = playerState.attachments.filter((a) => a.id !== this.id);
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
