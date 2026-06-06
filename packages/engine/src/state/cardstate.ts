import { Reaction } from '@songsofdoom/game';
import type { Capability } from '@songsofdoom/game';
import {
	type CreatureStatType,
	type Entity,
	isAlly,
	isCreature,
	isEncounter,
	isSkill
} from '@songsofdoom/game';
import { Event } from '@songsofdoom/game';
import type { Property } from '@songsofdoom/game';
import type { Stat, StatType } from '@songsofdoom/game';
import { MutableCapabilityResolution } from './capabilityresolution';
import type { CardOptions } from './cardcontainer';
import { EntityState, type MutableEntityState } from './entitystate';
import type { MutableGameState, ReadonlyGameState } from './gamestate';
import type { CardId, EntityId, LocationId, PlayerId } from './identifiers';
import { mutate } from './mutate';

export interface CapabilityRef<T extends Capability = Capability> {
	cardId: CardId;
	capability: T;
}

export type CardParent =
	| { type: 'deck'; playerId: PlayerId }
	| { type: 'hand'; playerId: PlayerId }
	| { type: 'stage'; playerId: PlayerId }
	| { type: 'discard'; playerId: PlayerId }
	| { type: 'card'; cardId: CardId }
	| { type: 'player'; playerId: PlayerId }
	| { type: 'location'; locationId: LocationId }
	| { type: 'banish'; playerId: PlayerId }
	| { type: 'encounter-deck' }
	| { type: 'encounter-discard' };

export interface CardStateProps {
	id: CardId;
	card: Entity;
	ownerId: EntityId;
	container: CardParent;
	exhausted?: boolean;
	activated?: boolean;
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
	readonly ownerId: EntityId;
	readonly container: CardParent;
	readonly exhausted: boolean;
	readonly activated: boolean;
	readonly charges: number;
	readonly clues: number;

	constructor({
		id,
		card,
		ownerId,
		container,
		exhausted = false,
		activated = false,
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
			mentalTrauma,
			activated
		});
		this.card = card;
		this.ownerId = ownerId;
		this.container = container;
		this.exhausted = exhausted;
		this.activated = activated;
		this.charges = charges;
		this.clues = clues;
	}

	override get playerId(): PlayerId | undefined {
		return this.container.type === 'player' ? this.container.playerId : undefined;
	}

	get capabilities(): Array<Capability> {
		if (this.container.type === 'card') {
			return this.card.attachmentCapabilities;
		} else {
			return this.card.capabilities;
		}
	}

	cards(options?: CardOptions): Array<Self> {
		const includeAttachments = options?.includeAttachments ?? true;
		const cards: CardState[] = [];
		if (
			(!options?.ready || !this.exhausted) &&
			(!options?.type || this.card.type.id === options.type)
		) {
			cards.push(this);
		}
		if (includeAttachments) {
			cards.push(...this.attachments.flatMap((attachment) => attachment.cards(options)));
		}
		return cards as Self[];
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

	getReactionsToEvent(event: Event, gameState: ReadonlyGameState): Array<Reaction> {
		let capabilities: Array<Capability>;
		if (isSkill(this.card)) {
			capabilities = this.isAttached() ? this.card.attachmentCapabilities : this.card.capabilities;
		} else {
			capabilities = [
				...this.card.capabilities,
				...(this.isAttached() ? this.card.attachmentCapabilities : [])
			];
		}

		const reactions: Reaction[] = capabilities.filter((capability) => {
			if (!(capability instanceof Reaction)) {
				return false;
			}
			const resolution = new MutableCapabilityResolution({
				subjectId: this.id,
				cardId: this.id,
				capability
			});
			const scopedGameState = gameState.mutate((state) =>
				state.pushContext({ capabilityResolution: resolution })
			);
			return capability.triggers.some((spec) => {
				if (spec.event !== event) {
					return false;
				}
				if (spec.condition !== undefined && !scopedGameState.evaluate(spec.condition)) {
					return false;
				}
				return true;
			});
		}) as Reaction[];

		return reactions;
	}

	getStat(stat: Stat | StatType): number | undefined {
		const statType = typeof stat === 'string' ? stat : stat.type;
		if (isCreature(this.card)) {
			return stat === 'sanity' ? undefined : this.card.stats[statType as CreatureStatType];
		} else if (isAlly(this.card)) {
			return this.card.stats[statType];
		}
		return undefined;
	}

	inPlay(): boolean {
		return (
			this.container.type === 'hand' ||
			this.container.type === 'stage' ||
			this.container.type === 'player' ||
			this.container.type === 'card' ||
			this.container.type === 'location'
		);
	}

	getPlayerId(): EntityId | undefined {
		return 'playerId' in this.container ? this.container.playerId : undefined;
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
	declare activated: boolean;
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
			activated: cardState.activated,
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
			activated: this.activated,
			charges: this.charges,
			clues: this.clues,
			attachments: this.attachments.map((attachment) => attachment.readonly()),
			properties: [...this.properties],
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma
		});
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState) {
		attachment.removeFromCurrentParent(gameState);
		attachment.container = { type: 'card', cardId: this.id };
		this.attachments.push(attachment);
	}

	moveToPlayer(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentParent(gameState);
		this.container = { type: 'player', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.attachments.push(this);
	}

	moveToTopOfDiscardPile(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		if (isCreature(this.card) || isEncounter(this.card)) {
			if (playerId !== undefined) {
				throw new Error('Encounter/creature cards do not belong to a player discard pile');
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'encounter-discard' };
			gameState.encounterDiscardPile.unshift(this);
		} else {
			playerId = playerId ?? this.playerId;
			if (!playerId) {
				throw new Error("Can't move a card without specifying its player id");
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'discard', playerId };
			const playerState = gameState.requirePlayer(playerId);
			playerState.discardPile.unshift(this);
		}
	}

	moveToBottomOfDiscardPile(
		gameState: MutableGameState,
		playerId: PlayerId | undefined = undefined
	) {
		if (isCreature(this.card) || isEncounter(this.card)) {
			if (playerId !== undefined) {
				throw new Error('Encounter/creature cards do not belong to a player discard pile');
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'encounter-discard' };
			gameState.encounterDiscardPile.push(this);
		} else {
			playerId = playerId ?? this.playerId;
			if (!playerId) {
				throw new Error("Can't move a card without specifying its player id");
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'discard', playerId };
			const playerState = gameState.requirePlayer(playerId);
			playerState.discardPile.push(this);
		}
	}

	moveToHand(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentParent(gameState);
		this.container = { type: 'hand', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.hand.push(this);
	}

	moveToStage(gameState: MutableGameState, playerId: PlayerId) {
		this.removeFromCurrentParent(gameState);
		this.container = { type: 'stage', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.stage.push(this);
	}

	moveToTopOfDeck(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		if (isCreature(this.card) || isEncounter(this.card)) {
			if (playerId !== undefined) {
				throw new Error('Encounter/creature cards do not belong to a player deck');
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'encounter-deck' };
			gameState.encounterDeck.unshift(this);
		} else {
			playerId = playerId ?? this.playerId;
			if (!playerId) {
				throw new Error("Can't move a card without specifying its player id");
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'deck', playerId };
			const playerState = gameState.requirePlayer(playerId);
			playerState.deck.unshift(this);
		}
	}

	moveToBottomOfDeck(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		if (isCreature(this.card) || isEncounter(this.card)) {
			if (playerId !== undefined) {
				throw new Error('Encounter/creature cards do not belong to a player deck');
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'encounter-deck' };
			gameState.encounterDeck.push(this);
		} else {
			playerId = playerId ?? this.playerId;
			if (!playerId) {
				throw new Error("Can't move a card without specifying its player id");
			}
			this.removeFromCurrentParent(gameState);
			this.container = { type: 'deck', playerId };
			const playerState = gameState.requirePlayer(playerId);
			playerState.deck.push(this);
		}
	}

	moveToLocation(gameState: MutableGameState, locationId: LocationId) {
		this.removeFromCurrentParent(gameState);
		this.container = { type: 'location', locationId };
		const locationState = gameState.requireCard(locationId);
		locationState.attachments.push(this);
	}

	banish(gameState: MutableGameState, playerId: PlayerId | undefined = undefined) {
		playerId = playerId ?? this.playerId;
		if (!playerId) {
			throw new Error("Can't banish a card without specifying its player id");
		}
		this.removeFromCurrentParent(gameState);
		this.container = { type: 'banish', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.banishedCards.push(this);
	}

	private removeFromCurrentParent(gameState: MutableGameState) {
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
		} else if (this.container.type === 'banish') {
			const playerState = gameState.requirePlayer(this.container.playerId);
			playerState.banishedCards = playerState.banishedCards.filter((c) => c.id !== this.id);
		} else if (this.container.type === 'encounter-deck') {
			gameState.encounterDeck = gameState.encounterDeck.filter((c) => c.id !== this.id);
		} else if (this.container.type === 'encounter-discard') {
			gameState.encounterDiscardPile = gameState.encounterDiscardPile.filter(
				(c) => c.id !== this.id
			);
		}
	}
}
