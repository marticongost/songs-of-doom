import type { LocalisedText } from '$lib/localisation';

export type EventType =
	| 'attacking'
	| 'defending'
	| 'enemyDefeated'
	| 'payingCapability'
	| 'acquired';

export type EventProps = { type: EventType; name: LocalisedText };

export class Event {
	readonly type: EventType;
	readonly name: LocalisedText;

	constructor({ type, name }: EventProps) {
		this.type = type;
		this.name = name;
	}
}

export const events: Record<EventType, Event> = {
	attacking: new Event({
		type: 'attacking',
		name: { ca: 'En atacar', es: 'Al atacar', en: 'When attacking' }
	}),
	defending: new Event({
		type: 'defending',
		name: { ca: 'En defensar', es: 'Al defender', en: 'When defending' }
	}),
	enemyDefeated: new Event({
		type: 'enemyDefeated',
		name: {
			ca: 'En derrotar un enemic',
			es: 'Al derrotar a un enemigo',
			en: 'When defeating an enemy'
		}
	}),
	payingCapability: new Event({
		type: 'payingCapability',
		name: {
			ca: 'En pagar una capacitat',
			es: 'Al pagar una capacidad',
			en: 'When paying for a capability'
		}
	}),
	acquired: new Event({
		type: 'acquired',
		name: { ca: 'En adquirir', es: 'Al adquirir', en: 'When acquired' }
	})
};
