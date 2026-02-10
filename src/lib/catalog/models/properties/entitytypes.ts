import type { LocalisedText } from '$lib/localisation';
import { Property } from './property';

export type EntityTypeId =
	| 'module'
	| 'archetype'
	| 'trait'
	| 'skill'
	| 'item'
	| 'creature'
	| 'ally'
	| 'encounter';

export class EntityType extends Property {
	readonly id: EntityTypeId;
	readonly pluralTitle: LocalisedText;

	constructor(id: EntityTypeId, title: LocalisedText, pluralTitle: LocalisedText) {
		super({ title });
		this.id = id;
		this.pluralTitle = pluralTitle;
	}
}

export const module = new EntityType(
	'module',
	{ ca: 'Mòdul', es: 'Módulo', en: 'Module' },
	{ ca: 'Mòduls', es: 'Módulos', en: 'Modules' }
);
export const archetype = new EntityType(
	'archetype',
	{ ca: 'Arquetip', es: 'Arquetipo', en: 'Archetype' },
	{ ca: 'Arquetips', es: 'Arquetipos', en: 'Archetypes' }
);
export const trait = new EntityType(
	'trait',
	{ ca: 'Tret', es: 'Rasgo', en: 'Trait' },
	{ ca: 'Trets', es: 'Rasgos', en: 'Traits' }
);
export const skill = new EntityType(
	'skill',
	{ ca: 'Habilitat', es: 'Habilidad', en: 'Skill' },
	{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' }
);
export const item = new EntityType(
	'item',
	{ ca: 'Objecte', es: 'Objeto', en: 'Item' },
	{ ca: 'Objectes', es: 'Objetos', en: 'Items' }
);
export const creature = new EntityType(
	'creature',
	{ ca: 'Criatura', es: 'Criatura', en: 'Creature' },
	{ ca: 'Criatures', es: 'Criaturas', en: 'Creatures' }
);
export const ally = new EntityType(
	'ally',
	{ ca: 'Aliat', es: 'Aliado', en: 'Ally' },
	{ ca: 'Aliats', es: 'Aliados', en: 'Allies' }
);
export const encounter = new EntityType(
	'encounter',
	{ ca: 'Encontre', es: 'Encuentro', en: 'Encounter' },
	{ ca: 'Encontres', es: 'Encuentros', en: 'Encounters' }
);

export const entityTypes: Record<EntityTypeId, EntityType> = {
	module,
	archetype,
	trait,
	skill,
	item,
	creature,
	ally,
	encounter
};
