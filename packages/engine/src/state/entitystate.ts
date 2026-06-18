import { Action, type Property } from '@songsofdoom/game';
import type { CardContainer, CardOptions } from './cardcontainer';
import type { CardState, MutableCardState, PotentialCapabilityRef } from './cardstate';
import type { GameState, MutableGameState } from './gamestate';
import type { CardId, EntityId, PlayerId } from './identifiers';

export interface EntityStateProps<Id extends EntityId> {
	id: Id;
	attachments?: ReadonlyArray<CardState>;
	properties: ReadonlyArray<Property>;
	physicalTrauma?: number;
	mentalTrauma?: number;
	activated?: boolean;
}

export abstract class EntityState<
	Id extends EntityId = EntityId,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TCard extends CardState<any> = CardState<any>
> implements CardContainer<TCard> {
	readonly id: Id;
	readonly attachments: ReadonlyArray<TCard>;
	readonly properties: ReadonlyArray<Property>;
	readonly physicalTrauma: number;
	readonly mentalTrauma: number;
	readonly activated: boolean;
	abstract readonly playerId: PlayerId | undefined;

	constructor({
		id,
		attachments = [],
		properties,
		physicalTrauma = 0,
		mentalTrauma = 0,
		activated = false
	}: EntityStateProps<Id>) {
		this.id = id;
		this.attachments = attachments as ReadonlyArray<TCard>;
		this.properties = properties;
		this.physicalTrauma = physicalTrauma;
		this.mentalTrauma = mentalTrauma;
		this.activated = activated;
	}

	abstract getCard(id: CardId): TCard | undefined;
	abstract requireCard(id: CardId): TCard;
	abstract cards(options?: CardOptions): Array<TCard>;

	getAvailableActions(gameState: GameState): Array<PotentialCapabilityRef> {
		const cards = this.cards({ ready: true }) as CardState[];
		const location = gameState.getEntityLocation(this);
		if (location) {
			cards.push(...location.cards({ ready: true }));
		}
		return this.cards({ ready: true }).flatMap((card) =>
			card.capabilities
				.filter((capability) => capability instanceof Action)
				.filter(
					(capability) =>
						gameState.getCapabilityImpediment(capability, card.id, this.id) === undefined
				)
				.flatMap((capability) => ({
					capabilityId: capability.id,
					cardId: card.id,
					prioritary: capability.prioritary
				}))
		);
	}

	/** Obtains the given property if the card has it, taking into account any
	 * effects that might modify its properties.
	 * @param property The property to check for.
	 * @return The property if the card has it, undefined otherwise.
	 */
	getProperty(property: Property): Property | undefined {
		for (const ownedProperty of this.properties) {
			if (ownedProperty.is(property)) {
				return ownedProperty;
			}
		}
		return undefined;
	}

	/** Determines whether the card has the given property, taking into account any
	 * effects that might modify its properties.
	 * @param property The property to check for.
	 * @return True if the card has the property, false otherwise.
	 */
	hasProperty(property: Property): boolean {
		return this.getProperty(property) !== undefined;
	}

	/** Indicates if the entity is hostile (an enemy creature). */
	abstract get hostile(): boolean;
}

export interface MutableEntityState<Id extends EntityId> extends EntityState<Id, MutableCardState> {
	attachments: Array<MutableCardState>;
	properties: Array<Property>;
	physicalTrauma: number;
	mentalTrauma: number;
	activated: boolean;

	addAttachment(gameState: MutableGameState, attachment: MutableCardState): void;

	/**
	 * Adds or merges a property onto this entity.
	 */
	addProperty(property: Property): void;
}
