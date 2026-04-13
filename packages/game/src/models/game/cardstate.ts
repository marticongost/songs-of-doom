import { isSkill, type Capability, type Property } from '../..';
import { Reaction } from '../capabilities/reaction';
import type { Entity } from '../entities';
import type { EventEnvelope } from '../event';
import { EntityState, type MutableEntityState } from './entitystate';
import type { MutableGameState, ReadonlyGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';
import { mutate } from './mutate';

export interface CardOptions {
	ready?: boolean;
}

export interface CapabilityRef {
	cardId: CardId;
	capability: Capability;
}

export type CardParent =
	| { type: 'deck'; playerId: PlayerId }
	| { type: 'hand'; playerId: PlayerId }
	| { type: 'stage'; playerId: PlayerId }
	| { type: 'discard'; playerId: PlayerId }
	| { type: 'card'; cardId: CardId }
	| { type: 'player'; playerId: PlayerId }
	| { type: 'location'; locationId: CardId };

export interface CardStateProps {
	id: CardId;
	card: Entity;
	ownerId: PlayerId;
	container: CardParent;
	exhausted?: boolean;
	charges?: number;
	clues?: number;
	attachments?: ReadonlyArray<CardState>;
	physicalTrauma?: number;
	mentalTrauma?: number;
	properties?: Array<Property>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CardState<Self extends CardState<Self> = CardState<any>> extends EntityState<
	CardId,
	Self
> {
	readonly card: Entity;
	readonly ownerId: PlayerId;
	readonly container: CardParent;
	readonly exhausted: boolean;
	readonly charges: number;
	readonly clues: number;

	constructor({
		id,
		card,
		ownerId,
		container,
		exhausted = false,
		charges = 0,
		clues = 0,
		attachments = [],
		physicalTrauma = 0,
		mentalTrauma = 0,
		properties
	}: CardStateProps) {
		super({
			id,
			attachments,
			properties: properties ?? card.properties,
			physicalTrauma,
			mentalTrauma
		});
		this.card = card;
		this.ownerId = ownerId;
		this.container = container;
		this.exhausted = exhausted;
		this.charges = charges;
		this.clues = clues;
	}

	getCard(id: CardId): Self | undefined {
		if (this.id === id) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return this as any as Self;
		}
		for (const attachment of this.attachments) {
			const found = attachment.getCard(id);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	requireCard(id: CardId): Self {
		const card = this.getCard(id);
		if (!card) {
			throw new Error(`Card with id ${id} not found`);
		}
		return card;
	}

	isAttached(): boolean {
		return this.container.type === 'card' || this.container.type === 'player';
	}

	getReactionsToEvent(
		eventEnvelope: EventEnvelope,
		gameState?: ReadonlyGameState
	): Array<Reaction> {
		const context = eventEnvelope.context ?? {};

		let capabilities: Array<Capability>;
		if (isSkill(this.card)) {
			capabilities = this.isAttached() ? this.card.attachmentCapabilities : this.card.capabilities;
		} else {
			capabilities = [
				...this.card.capabilities,
				...(this.isAttached() ? this.card.attachmentCapabilities : [])
			];
		}

		const scopedGameState =
			gameState === undefined
				? undefined
				: gameState.mutate((state) => {
						state.activeCardStack.push(this.id);
						state.reactiveCardStack.push(context.reactiveCardId ?? this.id);
						state.reactivePlayerStack.push(context.reactivePlayerId ?? this.ownerId);
						if (context.subjectId !== undefined) {
							state.subjectStack.push(context.subjectId);
						}
						if (context.targetId !== undefined) {
							state.targetStack.push(context.targetId);
						}
						if (context.activePlayerId !== undefined) {
							state.activePlayerStack.push(context.activePlayerId);
						}
					});

		const reactions: Reaction[] = capabilities.filter((capability) => {
			if (!(capability instanceof Reaction)) {
				return false;
			}
			return capability.triggers.some((spec) => {
				if (spec.event !== eventEnvelope.event) {
					return false;
				}
				if (
					spec.condition !== undefined &&
					scopedGameState !== undefined &&
					!scopedGameState.evaluate(spec.condition)
				) {
					return false;
				}
				return true;
			});
		}) as Reaction[];

		return reactions;
	}
}

export class ReadonlyCardState extends CardState<ReadonlyCardState> {
	mutable(): MutableCardState {
		return new MutableCardState(this);
	}

	mutate(change: (state: MutableCardState) => void): ReadonlyCardState {
		return mutate(this as ReadonlyCardState, change);
	}
}

export class MutableCardState
	extends CardState<MutableCardState>
	implements MutableEntityState<CardId>
{
	declare exhausted: boolean;
	declare charges: number;
	declare clues: number;
	declare attachments: Array<MutableCardState>;
	declare properties: Array<Property>;
	declare container: CardParent;
	declare physicalTrauma: number;
	declare mentalTrauma: number;

	constructor(cardState: ReadonlyCardState) {
		super({
			id: cardState.id,
			card: cardState.card,
			ownerId: cardState.ownerId,
			container: cardState.container,
			exhausted: cardState.exhausted,
			charges: cardState.charges,
			clues: cardState.clues,
			attachments: cardState.attachments.map((attachment) => attachment.mutable()),
			properties: [...cardState.properties],
			physicalTrauma: cardState.physicalTrauma,
			mentalTrauma: cardState.mentalTrauma
		});
	}

	readonly(): ReadonlyCardState {
		return new ReadonlyCardState({
			id: this.id,
			card: this.card,
			ownerId: this.ownerId,
			container: this.container,
			exhausted: this.exhausted,
			charges: this.charges,
			clues: this.clues,
			attachments: this.attachments.map((attachment) => attachment.readonly()),
			properties: [...this.properties],
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma
		});
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState) {
		attachment.removeFromCurrentLocation(gameState);
		attachment.container = { type: 'card', cardId: this.id };
		this.attachments.push(attachment);
	}

	moveToPlayer(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'player', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.attachments.push(this);
	}

	moveToTopOfDiscardPile(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.unshift(this);
	}

	moveToBottomOfDiscardPile(
		gameState: MutableGameState,
		playerId: PlayerId | undefined = undefined
	) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.push(this);
	}

	moveToHand(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'hand', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.hand.push(this);
	}

	moveToStage(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'stage', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.stage.push(this);
	}

	moveToTopOfDeck(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.unshift(this);
	}

	moveToBottomOfDeck(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		playerId = playerId ?? this.ownerId;
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.push(this);
	}

	moveToLocation(gameState: MutableGameState, locationId: CardId) {
		this.removeFromCurrentLocation(gameState);
		this.container = { type: 'location', locationId };
		const locationState = gameState.requireCard(locationId);
		locationState.attachments.push(this);
	}

	private removeFromCurrentLocation(gameState: MutableGameState) {
		if (this.container.type === 'card') {
			const previousContainer = gameState.requireCard(this.container.cardId);
			previousContainer.attachments = previousContainer.attachments.filter((a) => a.id !== this.id);
		} else if (this.container.type === 'player') {
			const playerState = gameState.requirePlayer(this.container.playerId);
			playerState.attachments = playerState.attachments.filter((a) => a.id !== this.id);
		} else if (this.container.type === 'discard') {
			const playerState = gameState.requirePlayer(this.container.playerId);
			playerState.discardPile = playerState.discardPile.filter((c) => c.id !== this.id);
		} else if (this.container.type === 'hand') {
			const playerState = gameState.requirePlayer(this.container.playerId);
			playerState.hand = playerState.hand.filter((c) => c.id !== this.id);
		} else if (this.container.type === 'stage') {
			const playerState = gameState.requirePlayer(this.container.playerId);
			playerState.stage = playerState.stage.filter((c) => c.id !== this.id);
		} else if (this.container.type === 'deck') {
			const playerState = gameState.requirePlayer(this.container.playerId);
			playerState.deck = playerState.deck.filter((c) => c.id !== this.id);
		} else if (this.container.type === 'location') {
			const locationState = gameState.requireCard(this.container.locationId);
			locationState.attachments = locationState.attachments.filter((a) => a.id !== this.id);
		}
	}
}
