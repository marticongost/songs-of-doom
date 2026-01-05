import type { LocalisedText } from '$lib/localisation';

export type AttributeType = 'strength' | 'agility' | 'intelligence' | 'charisma';
export type IndicatorType = 'health' | 'sanity';

export type StatType = AttributeType | IndicatorType;

export class Stat {
	readonly type: StatType;
	readonly name: LocalisedText;

	constructor(type: StatType, name: LocalisedText) {
		this.type = type;
		this.name = name;
	}
}

export const attributeTypes: AttributeType[] = ['strength', 'agility', 'intelligence', 'charisma'];
export const indicatorTypes: IndicatorType[] = ['health', 'sanity'];
export const statTypes: StatType[] = [...attributeTypes, ...indicatorTypes];

export const stats: Record<StatType, Stat> = {
	agility: new Stat('agility', { en: 'Agility', es: 'Agilidad', ca: 'Agilitat' }),
	strength: new Stat('strength', { en: 'Strength', es: 'Fuerza', ca: 'Força' }),
	intelligence: new Stat('intelligence', {
		en: 'Intelligence',
		es: 'Inteligencia',
		ca: 'Intel·ligència'
	}),
	charisma: new Stat('charisma', { en: 'Charisma', es: 'Carisma', ca: 'Carisma' }),
	health: new Stat('health', { en: 'Health', es: 'Salud', ca: 'Salut' }),
	sanity: new Stat('sanity', { en: 'Sanity', es: 'Cordura', ca: 'Seny' })
};
