import type { Property } from '../..';
import type { CardState, MutableCardState } from './cardstate';
import type { MutableGameState } from './gamestate';
import type { CardId, EntityId } from './identifiers';

export interface EntityStateProps<Id extends EntityId> {
	id: Id;
	attachments?: ReadonlyArray<CardState>;
	properties: ReadonlyArray<Property>;
	physicalTrauma?: number;
	mentalTrauma?: number;
}

export abstract class EntityState<Id extends EntityId> {
	readonly id: Id;
	readonly attachments: ReadonlyArray<CardState>;
	readonly properties: ReadonlyArray<Property>;
	readonly physicalTrauma: number;
	readonly mentalTrauma: number;

	constructor({
		id,
		attachments = [],
		properties,
		physicalTrauma = 0,
		mentalTrauma = 0
	}: EntityStateProps<Id>) {
		this.id = id;
		this.attachments = attachments;
		this.properties = properties;
		this.physicalTrauma = physicalTrauma;
		this.mentalTrauma = mentalTrauma;
	}

	abstract getCard(id: CardId): CardState | undefined;
	abstract requireCard(id: CardId): CardState;

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
}

export interface MutableEntityState<Id extends EntityId> extends EntityState<Id> {
	attachments: Array<MutableCardState>;
	properties: Array<Property>;

	addAttachment(gameState: MutableGameState, attachment: MutableCardState): void;
}
