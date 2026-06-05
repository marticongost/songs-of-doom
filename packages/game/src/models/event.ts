import { mapToRecord } from '@songsofdoom/common';
import type { LocalisedText } from '@songsofdoom/common/localisation';
import {
	AndExpression,
	reactiveCardIsSubject,
	reactiveCardIsTarget,
	reactivePlayerIsSubject,
	reactivePlayerIsTarget,
	type BooleanExpressionType
} from './expressions/boolean';
import type { CardId, EntityId } from './game/identifiers';

export type EventProps = {
	type: EventType;
	name: LocalisedText;
	shortForms?: Array<EventTriggerShortForm>;
};

export interface EventTriggerShortForm {
	match: (expression: BooleanExpressionType) => boolean;
	description: LocalisedText;
}

export interface TriggerDescription {
	description: LocalisedText;
	condition?: BooleanExpressionType;
}

export class Event {
	readonly type: EventType;
	readonly name: LocalisedText;
	readonly shortForms: Array<EventTriggerShortForm>;

	constructor({ type, name, shortForms }: EventProps) {
		this.type = type;
		this.name = name;
		this.shortForms = shortForms ?? [];
	}

	getTriggerDescription(condition?: BooleanExpressionType): TriggerDescription {
		if (condition) {
			const conditionComponents =
				condition instanceof AndExpression ? [...condition.operands] : [condition];
			for (const { match, description } of this.shortForms) {
				for (const conditionComponent of conditionComponents) {
					if (match(conditionComponent)) {
						const remainingConditionComponents = conditionComponents.filter(
							(c) => c !== conditionComponent
						);
						if (remainingConditionComponents.length === 0) {
							return { description, condition: undefined };
						} else if (remainingConditionComponents.length == 1) {
							return { description, condition: remainingConditionComponents[0] };
						} else {
							return { description, condition: new AndExpression(...remainingConditionComponents) };
						}
					}
				}
			}
		}
		return { description: this.name, condition };
	}
}

const conditionIsExactly =
	(matchingExpression: BooleanExpressionType) => (expression: BooleanExpressionType) =>
		expression === matchingExpression;

const eventData = {
	engage: {
		name: {
			ca: "Abans d'un enfrontament",
			es: 'Antes de un enfrentamiento',
			en: 'Before an engagement'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: "Abans que t'enfrontis a un enemic",
					es: 'Antes que te enfrentes a un enemigo',
					en: 'Before you face an enemy'
				}
			},
			{
				match: conditionIsExactly(reactivePlayerIsTarget),
				description: {
					ca: "Abans que un enemic s'enfronti a tu",
					es: 'Antes que un enemigo se enfrente a ti',
					en: 'Before an enemy engages you'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: "Abans que s'enfronti a un enemic",
					es: 'Antes que se enfrente a un enemigo',
					en: 'Before it engages an enemy'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsTarget),
				description: {
					ca: "Abans que un enemic s'hi enfronti",
					es: 'Antes que un enemigo se le enfrente',
					en: 'Before an enemy engages it'
				}
			}
		]
	},
	played: {
		name: { ca: 'En entrar en joc', es: 'Al entrar en juego', en: 'When played' }
	},
	investigation: {
		name: {
			ca: 'Durant una investigació',
			es: 'Durante una investigación',
			en: 'When investigating'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan investiguis',
					es: 'Cuando investigues',
					en: 'When you investigate'
				}
			}
		]
	},
	attack: {
		name: {
			ca: 'Quan es resolgui un atac',
			es: 'Cuando se resuelva un ataque',
			en: 'When resolving an attack'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan ataquis',
					es: 'Cuando ataques',
					en: 'When you attack'
				}
			},
			{
				match: conditionIsExactly(reactivePlayerIsTarget),
				description: {
					ca: 'Quan rebis un atac',
					es: 'Cuando recibas un ataque',
					en: 'When you are attacked'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: 'Quan ataqui',
					es: 'Cuando ataque',
					en: 'When it attacks'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsTarget),
				description: {
					ca: 'Quan sigui atacat',
					es: 'Cuando sea atacado',
					en: 'When attacked'
				}
			}
		]
	},
	enemyDefeated: {
		name: {
			ca: 'Quan un enemic sigui derrotat',
			es: 'Cuando un enemigo sea derrotado',
			en: 'When an enemy is defeated'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan derrotes un enemic',
					es: 'Cuando derrotes a un enemigo',
					en: 'When you defeat an enemy'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: 'Quan derroti un enemic',
					es: 'Cuando derrote a un enemigo',
					en: 'When it defeats an enemy'
				}
			}
		]
	},
	payingCapability: {
		name: {
			ca: 'Quan es pagui una capacitat',
			es: 'Cuando se pague una capacidad',
			en: 'When paying for a capability'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan paguïs una capacitat',
					es: 'Cuando pagues una capacidad',
					en: 'When you pay for a capability'
				}
			}
		]
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
		name: { ca: "Quan s'apliqui dany", es: 'Cuando se inflinja daño', en: 'When damage is dealt' },
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan facis dany',
					es: 'Cuando causes daño',
					en: 'When you deal damage'
				}
			},
			{
				match: conditionIsExactly(reactivePlayerIsTarget),
				description: {
					ca: 'Quan rebis dany',
					es: 'Cuando recibas daño',
					en: 'When you take damage'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: 'Quan causi dany',
					es: 'Cuando cause daño',
					en: 'When it deals damage'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsTarget),
				description: {
					ca: 'Quan rebi dany',
					es: 'Cuando reciba daño',
					en: 'When it takes damage'
				}
			}
		]
	},
	beforeDrawingFate: {
		name: {
			ca: 'Abans que es robi una fitxa de destí',
			es: 'Antes que se robe una ficha de destino',
			en: 'Before a fate token is drawn'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Abans que robis una fitxa de destí',
					es: 'Antes que robes una ficha de destino',
					en: 'Before you draw a fate token'
				}
			}
		]
	},
	fateTokenRevealed: {
		name: {
			ca: 'Quan es reveli una fitxa de destí',
			es: 'Cuando se revele una ficha de destino',
			en: 'When a fate token is revealed'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan es reveli una de les teves fitxes de destí',
					es: 'Cuando se revele una de tus fichas de destino',
					en: 'When one of your fate tokens is revealed'
				}
			}
		]
	},
	afterDrawingFate: {
		name: {
			ca: 'Després que es robi una fitxa de destí',
			es: 'Después de que se robe una ficha de destino',
			en: 'After a fate token is drawn'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Després que robis una fitxa de destí',
					es: 'Después de que robes una ficha de destino',
					en: 'After you draw a fate token'
				}
			}
		]
	},
	encounterRevealed: {
		name: {
			ca: 'Quan es reveli un encontre',
			es: 'Cuando se revele un encuentro',
			en: 'When an encounter is revealed'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: 'Quan sigui revelat',
					es: 'Cuando sea revelado',
					en: 'When revealed'
				}
			}
		]
	},
	movement: {
		name: {
			ca: 'En resoldre un moviment',
			es: 'Al resolver un movimiento',
			en: 'When a movement is resolved'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan et moguis',
					es: 'Cuando te muevas',
					en: 'When you move'
				}
			},
			{
				match: conditionIsExactly(reactivePlayerIsTarget),
				description: {
					ca: 'Quan et moguin',
					es: 'Cuando te muevan',
					en: 'When you are moved'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: 'Quan es mogui',
					es: 'Cuando se mueva',
					en: 'When it moves'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsTarget),
				description: {
					ca: 'Quan el moguin',
					es: 'Cuando lo muevan',
					en: 'When it is moved'
				}
			}
		]
	},
	leavingLocation: {
		name: {
			ca: "Quan s'abandoni una localització",
			es: 'Cuando se abandone una localización',
			en: 'When a location is abandoned'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: "Quan surtis d'una localització",
					es: 'Cuando salgas de una localización',
					en: 'When you leave a location'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsTarget),
				description: {
					ca: "Quan s'abandoni aquesta localització",
					es: 'Cuando se abandone esta localización',
					en: 'When leaving this location'
				}
			}
		]
	},
	locationEntered: {
		name: {
			ca: "Quan s'entri a una localització",
			es: 'Cuando se entre en una localización',
			en: 'When a location is entered'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan entris a una localització',
					es: 'Cuando entres en una localización',
					en: 'When you enter a location'
				}
			},
			{
				match: conditionIsExactly(reactiveCardIsTarget),
				description: {
					ca: "Quan s'entri a aquesta localització",
					es: 'Cuando se entre en esta localización',
					en: 'When entering this location'
				}
			}
		]
	},
	fullyDischarged: {
		name: {
			ca: 'Quan una carta perdi totes les càrregues',
			es: 'Cuando una carta pierda todas las cargas',
			en: 'When a card loses all charges'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactiveCardIsSubject),
				description: {
					ca: 'Quan perdi totes les càrregues',
					es: 'Cuando pierda todas las cargas',
					en: 'When it loses all charges'
				}
			}
		]
	},
	playerDefeated: {
		name: {
			ca: 'Quan un jugador sigui derrotat',
			es: 'Cuando un jugador sea derrotado',
			en: 'When a player is defeated'
		},
		shortForms: [
			{
				match: conditionIsExactly(reactivePlayerIsSubject),
				description: {
					ca: 'Quan siguis derrotat',
					es: 'Cuando seas derrotado',
					en: 'When you are defeated'
				}
			}
		]
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
	activePlayerId?: EntityId;

	/** Card currently being evaluated or triggered as a reactor. */
	reactiveCardId?: CardId;

	/** Player owning the currently evaluated or triggered reactor. */
	reactivePlayerId?: EntityId;
}

export const events: Record<EventType, Event> = mapToRecord(eventData, {
	mapEntries: ([type, data]: [string, Omit<EventProps, 'type'>]) => [
		type as EventType,
		new Event({ type: type as EventType, ...data })
	]
});
