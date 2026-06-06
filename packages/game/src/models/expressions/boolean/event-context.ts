import type { LocalisedText } from '@songsofdoom/common/localisation';
import { entityTypes, type EntityType, type EntityTypeId } from '../../properties/entitytypes';
import { BooleanExpression } from './boolean-expression';

export class ActiveCardIsTargetExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta activa es el destinatari de l'esdeveniment",
			es: 'la carta activa es el objetivo del evento',
			en: 'active card is the event target'
		};
	}
}

export class ActiveCardIsActorExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta activa es l'actor de l'esdeveniment",
			es: 'la carta activa es el actor del evento',
			en: 'active card is the event actor'
		};
	}
}

export class ActiveCardOwnerIsNotActivePlayerExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'el propietari de la carta activa no es el jugador actiu',
			es: 'el propietario de la carta activa no es el jugador activo',
			en: 'active card owner is not the active player'
		};
	}
}

export class ReactivePlayerIsTargetExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "el jugador reactiu és el destinatari de l'esdeveniment",
			es: 'el jugador reactivo es el objetivo del evento',
			en: 'reactive player is the event target'
		};
	}
}

export class ReactivePlayerIsSubjectExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "el jugador reactiu és el subjecte de l'esdeveniment",
			es: 'el jugador reactivo es el sujeto del evento',
			en: 'reactive player is the event subject'
		};
	}
}

export class ReactiveCardIsSubjectExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta reactiva és el subjecte de l'esdeveniment",
			es: 'la carta reactiva es el sujeto del evento',
			en: 'reactive card is the event subject'
		};
	}
}

export class ReactiveCardIsTargetExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta reactiva és el destinatari de l'esdeveniment",
			es: 'la carta reactiva es el objetivo del evento',
			en: 'reactive card is the event target'
		};
	}
}

export class ActiveCardHasTypeExpression extends BooleanExpression {
	readonly type: EntityType;

	constructor(type: EntityTypeId | EntityType) {
		super();
		this.type = typeof type === 'string' ? entityTypes[type] : type;
	}

	translate(): LocalisedText {
		return {
			ca: `la carta activa és de tipus ${this.type.title.ca}`,
			es: `la carta activa es de tipo ${this.type.title.es}`,
			en: `active card is of type ${this.type.title.en}`
		};
	}
}

export const activeCardIsTarget = new ActiveCardIsTargetExpression();
export const activeCardIsActor = new ActiveCardIsActorExpression();
export const reactivePlayerIsNotActivePlayer = new ActiveCardOwnerIsNotActivePlayerExpression();
export const reactiveCardIsSubject = new ReactiveCardIsSubjectExpression();
export const reactiveCardIsTarget = new ReactiveCardIsTargetExpression();
export const reactivePlayerIsSubject = new ReactivePlayerIsSubjectExpression();
export const reactivePlayerIsTarget = new ReactivePlayerIsTargetExpression();
export const activeCardHasType = (type: EntityTypeId | EntityType) =>
	new ActiveCardHasTypeExpression(type);
