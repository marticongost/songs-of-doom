import type { LocalisedText } from '$lib/localisation';

export type AttributeType = 'strength' | 'agility' | 'intelligence' | 'charisma' | 'will';
export type IndicatorType = 'health' | 'sanity';

export type StatType = AttributeType | IndicatorType;

export abstract class Stat {
	readonly type: StatType;
	readonly name: LocalisedText;

	constructor(type: StatType, name: LocalisedText) {
		this.type = type;
		this.name = name;
	}
}

export class Attribute extends Stat {
	constructor(type: AttributeType, name: LocalisedText) {
		super(type, name);
	}
}

export class Indicator extends Stat {
	constructor(type: IndicatorType, name: LocalisedText) {
		super(type, name);
	}
}

export const attributeTypes: AttributeType[] = [
	'strength',
	'agility',
	'intelligence',
	'charisma',
	'will'
];
export const indicatorTypes: IndicatorType[] = ['health', 'sanity'];
export const statTypes: StatType[] = [...attributeTypes, ...indicatorTypes];

export const agility = new Attribute('agility', { en: 'Agility', es: 'Agilidad', ca: 'Agilitat' });
export const strength = new Attribute('strength', { en: 'Strength', es: 'Fuerza', ca: 'Força' });
export const intelligence = new Attribute('intelligence', {
	en: 'Intelligence',
	es: 'Inteligencia',
	ca: 'Intel·ligència'
});
export const charisma = new Attribute('charisma', { en: 'Charisma', es: 'Carisma', ca: 'Carisma' });
export const will = new Attribute('will', { en: 'Will', es: 'Voluntad', ca: 'Voluntat' });
export const health = new Indicator('health', { en: 'Health', es: 'Salud', ca: 'Salut' });
export const sanity = new Indicator('sanity', { en: 'Sanity', es: 'Cordura', ca: 'Seny' });

export const stats: Record<StatType, Stat> = {
	agility,
	strength,
	intelligence,
	charisma,
	will,
	health,
	sanity
};
