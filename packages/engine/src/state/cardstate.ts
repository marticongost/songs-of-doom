import type { Capability, Property, Stat, StatType } from '@songsofdoom/game';
import {
	type CreatureStatType,
	type Entity,
	Event,
	isAlly,
	isCreature,
	isSkill,
	Reaction
} from '@songsofdoom/game';
import { MutableCapabilityResolution } from './capabilityresolution';
import type { CardOptions } from './cardcontainer';
import { EntityState, type MutableEntityState } from './entitystate';
import {
	addAttachmentToCard,
	addPropertyToEntity,
	banishCard,
	moveCardToBottomOfDeck,
	moveCardToBottomOfDiscardPile,
	moveCardToHand,
	moveCardToLocation,
	moveCardToPlayer,
	moveCardToStage,
	moveCardToTopOfDeck,
	moveCardToTopOfDiscardPile,
	mutate
} from './entitystatemutation';
import type { MutableGameState, ReadonlyGameState } from './gamestate';
import type { CardId, EntityId, LocationId, PlayerId } from './identifiers';

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

	override get hostile(): boolean {
		return this.card.type.id === 'creature';
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
				if (spec.condition !== undefined && !scopedGameState.evaluateBoolean(spec.condition)) {
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

	getPlayerId(): PlayerId | undefined {
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

	addAttachment(gameState: MutableGameState, attachment: MutableCardState): void {
		addAttachmentToCard(this, gameState, attachment);
	}

	addProperty(property: Property): void {
		addPropertyToEntity(this, property);
	}

	moveToPlayer(gameState: MutableGameState, playerId: PlayerId): void {
		moveCardToPlayer(this, gameState, playerId);
	}

	moveToTopOfDiscardPile(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToTopOfDiscardPile(this, gameState, playerId);
	}

	moveToBottomOfDiscardPile(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToBottomOfDiscardPile(this, gameState, playerId);
	}

	moveToHand(gameState: MutableGameState, playerId: PlayerId): void {
		moveCardToHand(this, gameState, playerId);
	}

	moveToStage(gameState: MutableGameState, playerId: PlayerId): void {
		moveCardToStage(this, gameState, playerId);
	}

	moveToTopOfDeck(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToTopOfDeck(this, gameState, playerId);
	}

	moveToBottomOfDeck(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToBottomOfDeck(this, gameState, playerId);
	}

	moveToLocation(gameState: MutableGameState, locationId: LocationId): void {
		moveCardToLocation(this, gameState, locationId);
	}

	banish(gameState: MutableGameState, playerId?: PlayerId): void {
		banishCard(this, gameState, playerId);
	}
}
