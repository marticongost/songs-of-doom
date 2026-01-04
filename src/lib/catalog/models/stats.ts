import type { LocalisedText } from '$lib/localisation';

export type StatType = 'agility' | 'strength' | 'intelligence' | 'charisma';

export class Stat {
	readonly type: StatType;
	readonly name: LocalisedText;

	constructor(type: StatType, name: LocalisedText) {
		this.type = type;
		this.name = name;
	}
}

export const statTypes: StatType[] = ['agility', 'strength', 'intelligence', 'charisma'];

export const stats: Record<StatType, Stat> = {
	agility: new Stat('agility', { en: 'Agility', es: 'Agilidad', ca: 'Agilitat' }),
	strength: new Stat('strength', { en: 'Strength', es: 'Fuerza', ca: 'Força' }),
	intelligence: new Stat('intelligence', {
		en: 'Intelligence',
		es: 'Inteligencia',
		ca: 'Intel·ligència'
	}),
	charisma: new Stat('charisma', { en: 'Charisma', es: 'Carisma', ca: 'Carisma' })
};
