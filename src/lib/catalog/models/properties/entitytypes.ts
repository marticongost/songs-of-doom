import type { LocalisedText } from '$lib/localisation';
import { Property } from './property';

export type EntityTypeId = 'archetype' | 'trait' | 'skill' | 'item' | 'creature' | 'ally';

export class EntityType extends Property {
	readonly id: EntityTypeId;

	constructor(id: EntityTypeId, title: LocalisedText) {
		super({ title });
		this.id = id;
	}
}

export const archetype = new EntityType('archetype', {
	ca: 'Arquetip',
	es: 'Arquetipo',
	en: 'Archetype'
});
export const trait = new EntityType('trait', { ca: 'Tret', es: 'Rasgo', en: 'Trait' });
export const skill = new EntityType('skill', { ca: 'Habilitat', es: 'Habilidad', en: 'Skill' });
export const item = new EntityType('item', { ca: 'Objecte', es: 'Objeto', en: 'Item' });
export const creature = new EntityType('creature', {
	ca: 'Criatura',
	es: 'Criatura',
	en: 'Creature'
});
export const ally = new EntityType('ally', { ca: 'Aliat', es: 'Aliado', en: 'Ally' });

export const entityTypes: Record<EntityTypeId, EntityType> = {
	archetype,
	trait,
	skill,
	item,
	creature,
	ally
};
