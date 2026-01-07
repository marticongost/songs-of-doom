import type { LocalisedText } from '$lib/localisation';

export type AttributeType = 'strength' | 'agility' | 'intelligence' | 'charisma';
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

export const attributeTypes: AttributeType[] = ['strength', 'agility', 'intelligence', 'charisma'];
export const indicatorTypes: IndicatorType[] = ['health', 'sanity'];
export const statTypes: StatType[] = [...attributeTypes, ...indicatorTypes];

export const stats: Record<StatType, Stat> = {
	agility: new Attribute('agility', { en: 'Agility', es: 'Agilidad', ca: 'Agilitat' }),
	strength: new Attribute('strength', { en: 'Strength', es: 'Fuerza', ca: 'Força' }),
	intelligence: new Attribute('intelligence', {
		en: 'Intelligence',
		es: 'Inteligencia',
		ca: 'Intel·ligència'
	}),
	charisma: new Attribute('charisma', { en: 'Charisma', es: 'Carisma', ca: 'Carisma' }),
	health: new Indicator('health', { en: 'Health', es: 'Salud', ca: 'Salut' }),
	sanity: new Indicator('sanity', { en: 'Sanity', es: 'Cordura', ca: 'Seny' })
};
