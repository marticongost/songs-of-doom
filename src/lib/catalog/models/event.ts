import type { LocalisedText } from '$lib/localisation';

export type EventType =
	| 'beforeEnemyEngagesWithSelf'
	| 'attacking'
	| 'receivingAttack'
	| 'afterDefending'
	| 'afterReceivedAttackResolved'
	| 'enemyDefeated'
	| 'payingCapability'
	| 'acquired'
	| 'chapterStart'
	| 'provoked'
	| 'takingDamage'
	| 'fateDrawn';

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
	beforeEnemyEngagesWithSelf: new Event({
		type: 'beforeEnemyEngagesWithSelf',
		name: {
			ca: 'Abans de ser enfrontat per un enemic',
			es: 'Antes de ser enfrentado por un enemigo',
			en: 'Before being engaged by an enemy'
		}
	}),
	attacking: new Event({
		type: 'attacking',
		name: { ca: 'En atacar', es: 'Al atacar', en: 'When attacking' }
	}),
	receivingAttack: new Event({
		type: 'receivingAttack',
		name: { ca: 'En rebre un atac', es: 'Al recibir un ataque', en: 'When attacked' }
	}),
	afterReceivedAttackResolved: new Event({
		type: 'afterReceivedAttackResolved',
		name: {
			ca: 'Després de resoldre un atac rebut',
			es: 'Tras resolver un ataque recibido',
			en: 'After resolving a received attack'
		}
	}),
	afterDefending: new Event({
		type: 'afterDefending',
		name: {
			ca: "Després de defensar-se d'un atac",
			es: 'Tras defenderse de un ataque',
			en: 'After defending against an attack'
		}
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
	}),
	chapterStart: new Event({
		type: 'chapterStart',
		name: { ca: 'En començar el capítol', es: 'Al empezar el capítulo', en: 'Start of chapter' }
	}),
	provoked: new Event({
		type: 'provoked',
		name: { ca: 'En ser provocat', es: 'Al ser provocado', en: 'When provoked' }
	}),
	takingDamage: new Event({
		type: 'takingDamage',
		name: { ca: 'En rebre dany', es: 'Al recibir daño', en: 'When taking damage' }
	}),
	fateDrawn: new Event({
		type: 'fateDrawn',
		name: {
			ca: 'Després de robar una fitxa de destí',
			es: 'Después de robar una ficha de destino',
			en: 'After drawing a fate token'
		}
	})
};
