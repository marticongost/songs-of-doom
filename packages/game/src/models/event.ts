import type { LocalisedText } from '@songsofdoom/common/localisation';
import { mapToRecord } from '@songsofdoom/common';

export type EventProps = { type: EventType; name: LocalisedText };

export class Event {
	readonly type: EventType;
	readonly name: LocalisedText;

	constructor({ type, name }: EventProps) {
		this.type = type;
		this.name = name;
	}
}

const eventData: Record<string, Omit<EventProps, 'type'>> = {
	beforeEnemyEngagesWithSelf: {
		name: {
			ca: 'Abans de ser enfrontat per un enemic',
			es: 'Antes de ser enfrentado por un enemigo',
			en: 'Before being engaged by an enemy'
		}
	},
	played: {
		name: { ca: 'En entrar en joc', es: 'Al entrar en juego', en: 'When played' }
	},
	investigating: {
		name: { ca: 'En investigar', es: 'Al investigar', en: 'When investigating' }
	},
	attacking: {
		name: { ca: 'En atacar', es: 'Al atacar', en: 'When attacking' }
	},
	receivingAttack: {
		name: { ca: 'En rebre un atac', es: 'Al recibir un ataque', en: 'When attacked' }
	},
	afterReceivedAttackResolved: {
		name: {
			ca: 'Després de resoldre un atac rebut',
			es: 'Tras resolver un ataque recibido',
			en: 'After resolving a received attack'
		}
	},
	afterDefending: {
		name: {
			ca: "Després de defensar-se d'un atac",
			es: 'Tras defenderse de un ataque',
			en: 'After defending against an attack'
		}
	},
	enemyDefeated: {
		name: {
			ca: 'En derrotar un enemic',
			es: 'Al derrotar a un enemigo',
			en: 'When defeating an enemy'
		}
	},
	payingCapability: {
		name: {
			ca: 'En pagar una capacitat',
			es: 'Al pagar una capacidad',
			en: 'When paying for a capability'
		}
	},
	acquired: {
		name: { ca: 'En adquirir', es: 'Al adquirir', en: 'When acquired' }
	},
	scenarioStart: {
		name: { ca: "En començar l'escenari", es: 'Al empezar el escenario', en: 'Start of scenario' }
	},
	scenarioEnd: {
		name: { ca: "En acabar l'escenari", es: 'Al terminar el escenario', en: 'End of scenario' }
	},
	chapterStart: {
		name: { ca: 'En començar el capítol', es: 'Al empezar el capítulo', en: 'Start of chapter' }
	},
	chapterEnd: {
		name: { ca: 'En acabar el capítol', es: 'Al terminar el capítulo', en: 'End of chapter' }
	},
	turnStart: {
		name: { ca: 'En començar el torn', es: 'Al empezar el turno', en: 'Start of turn' }
	},
	turnEnd: {
		name: { ca: 'En acabar el torn', es: 'Al terminar el turno', en: 'End of turn' }
	},
	provoked: {
		name: { ca: 'En ser provocat', es: 'Al ser provocado', en: 'When provoked' }
	},
	takingDamage: {
		name: { ca: 'En rebre dany', es: 'Al recibir daño', en: 'When taking damage' }
	},
	beforeDrawingFate: {
		name: {
			ca: 'Abans de robar una fitxa de destí',
			es: 'Antes de robar una ficha de destino',
			en: 'Before drawing a fate token'
		}
	},
	afterDrawingFate: {
		name: {
			ca: 'Després de robar una fitxa de destí',
			es: 'Después de robar una ficha de destino',
			en: 'After drawing a fate token'
		}
	},
	beforeOtherPlayerDrawsFate: {
		name: {
			ca: 'Abans que un altre jugador robi una fitxa de destí',
			es: 'Antes de que otro jugador robe una ficha de destino',
			en: 'Before another player draws a fate token'
		}
	},
	revealed: {
		name: { ca: 'Revelació', es: 'Revelación', en: 'When revealed' }
	},
	moving: {
		name: { ca: "En moure's", es: 'Al moverse', en: 'When moving' }
	},
	resolvingEncounter: {
		name: {
			ca: 'En resoldre un encontre',
			es: 'Al resolver un encuentro',
			en: 'When resolving an encounter'
		}
	},
	fullyDischarged: {
		name: {
			ca: 'En perdre totes les càrregues',
			es: 'Al perder todas las cargas',
			en: 'When fully discharged'
		}
	}
};

export type EventType = keyof typeof eventData;

export const events: Record<EventType, Event> = mapToRecord(eventData, {
	mapEntries: ([type, data]: [string, Omit<EventProps, 'type'>]) => [
		type as EventType,
		new Event({ type: type as EventType, ...data })
	]
});
