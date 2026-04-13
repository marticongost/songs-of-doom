import { mapToRecord } from '@songsofdoom/common';
import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { CardId, EntityId, PlayerId } from './game/identifiers';

export type EventProps = {
	type: EventType;
	name: LocalisedText;
};

export class Event {
	readonly type: EventType;
	readonly name: LocalisedText;

	constructor({ type, name }: EventProps) {
		this.type = type;
		this.name = name;
	}
}

const eventData: Record<string, Omit<EventProps, 'type'>> = {
	engage: {
		name: {
			ca: "Abans d'un enfrontament",
			es: 'Antes de un enfrentamiento',
			en: 'Before an engagement'
		}
	},
	played: {
		name: { ca: 'En entrar en joc', es: 'Al entrar en juego', en: 'When played' }
	},
	investigation: {
		name: {
			ca: 'Durant una investigació',
			es: 'Durante una investigación',
			en: 'When investigating'
		}
	},
	attack: {
		name: {
			ca: 'Quan es resolgui un atac',
			es: 'Cuando se resuelva un ataque',
			en: 'When resolving an attack'
		}
	},
	enemyDefeated: {
		name: {
			ca: 'Quan un enemic sigui derrotat',
			es: 'Cuando un enemigo sea derrotado',
			en: 'When an enemy is defeated'
		}
	},
	payingCapability: {
		name: {
			ca: 'Quan es pagui una capacitat',
			es: 'Cuando se pague una capacidad',
			en: 'When paying for a capability'
		}
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
	damageDealt: {
		name: { ca: "Quan s'apliqui dany", es: 'Cuando se inflinja daño', en: 'When damage is dealt' }
	},
	beforeDrawingFate: {
		name: {
			ca: 'Abans que es robi una fitxa de destí',
			es: 'Antes que se robe una ficha de destino',
			en: 'Before a fate token is drawn'
		}
	},
	fateTokenRevealed: {
		name: {
			ca: 'Quan es reveli una fitxa de destí',
			es: 'Cuando se revele una ficha de destino',
			en: 'When a fate token is revealed'
		}
	},
	afterDrawingFate: {
		name: {
			ca: 'Després que es robi una fitxa de destí',
			es: 'Después de que se robe una ficha de destino',
			en: 'After a fate token is drawn'
		}
	},
	encounterRevealed: {
		name: {
			ca: 'Quan es reveli un encontre',
			es: 'Cuando se revele un encuentro',
			en: 'When an encounter is revealed'
		}
	},
	movement: {
		name: {
			ca: 'En resoldre un moviment',
			es: 'Al resolver un movimiento',
			en: 'When a movement is resolved'
		}
	},
	fullyDischarged: {
		name: {
			ca: 'Quan una carta perdi totes les càrregues',
			es: 'Cuando una carta pierda todas las cargas',
			en: 'When a card loses all charges'
		}
	}
};

export type EventType = keyof typeof eventData;

export interface EventContext {
	/** Entity performing the triggering action. */
	actorId?: EntityId;

	/** Implicit subject for the current operation (for tests, usually attacker). */
	subjectId?: EntityId;

	/** Implicit target for the current operation (for tests, usually defender). */
	targetId?: EntityId;

	/** Currently active player, if any. */
	activePlayerId?: PlayerId;

	/** Card currently being evaluated or triggered as a reactor. */
	reactiveCardId?: CardId;

	/** Player owning the currently evaluated or triggered reactor. */
	reactivePlayerId?: PlayerId;
}

export interface EventEnvelope {
	event: Event | EventType;
	context?: EventContext;
}

export const normaliseEvent = (event: Event | EventType): Event | undefined =>
	typeof event === 'string' ? events[event as EventType] : event;

export const normaliseEventEnvelope = (
	eventOrEnvelope: Event | EventType | EventEnvelope
): { event: Event | undefined; context: EventContext } => {
	if (typeof eventOrEnvelope === 'string' || eventOrEnvelope instanceof Event) {
		return { event: normaliseEvent(eventOrEnvelope), context: {} };
	}
	return {
		event: normaliseEvent(eventOrEnvelope.event),
		context: eventOrEnvelope.context ?? {}
	};
};

export const events: Record<EventType, Event> = mapToRecord(eventData, {
	mapEntries: ([type, data]: [string, Omit<EventProps, 'type'>]) => [
		type as EventType,
		new Event({ type: type as EventType, ...data })
	]
});
