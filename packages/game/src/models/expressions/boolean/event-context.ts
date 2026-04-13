import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { GameState } from '../../game/gamestate';
import { entityTypes, type EntityType, type EntityTypeId } from '../../properties/entitytypes';
import { BooleanExpression } from './boolean-expression';

class ActiveCardIsTargetExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta activa es el destinatari de l'esdeveniment",
			es: 'la carta activa es el objetivo del evento',
			en: 'active card is the event target'
		};
	}

	override evaluate(state: GameState): boolean {
		const activeCard = state.getActiveCard();
		const target = state.getTarget();
		return activeCard !== undefined && target !== undefined && activeCard.id === target.id;
	}
}

class ActiveCardIsActorExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta activa es l'actor de l'esdeveniment",
			es: 'la carta activa es el actor del evento',
			en: 'active card is the event actor'
		};
	}

	override evaluate(state: GameState): boolean {
		const activeCard = state.getActiveCard();
		const subject = state.getSubject();
		return activeCard !== undefined && subject !== undefined && activeCard.id === subject.id;
	}
}

class ActiveCardOwnerIsNotActivePlayerExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'el propietari de la carta activa no es el jugador actiu',
			es: 'el propietario de la carta activa no es el jugador activo',
			en: 'active card owner is not the active player'
		};
	}

	override evaluate(state: GameState): boolean {
		const reactivePlayer = state.getReactivePlayer();
		const activePlayer = state.getActivePlayer();
		return (
			reactivePlayer !== undefined &&
			activePlayer !== undefined &&
			reactivePlayer.id !== activePlayer.id
		);
	}
}

class ReactivePlayerIsTargetExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "el jugador reactiu és el destinatari de l'esdeveniment",
			es: 'el jugador reactivo es el objetivo del evento',
			en: 'reactive player is the event target'
		};
	}

	override evaluate(state: GameState): boolean {
		const reactivePlayer = state.getReactivePlayer();
		const target = state.getTarget();
		return reactivePlayer !== undefined && target !== undefined && reactivePlayer.id === target.id;
	}
}

class ReactivePlayerIsSubjectExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "el jugador reactiu és el subjecte de l'esdeveniment",
			es: 'el jugador reactivo es el sujeto del evento',
			en: 'reactive player is the event subject'
		};
	}

	override evaluate(state: GameState): boolean {
		const reactivePlayer = state.getReactivePlayer();
		const subject = state.getSubject();
		return (
			reactivePlayer !== undefined && subject !== undefined && reactivePlayer.id === subject.id
		);
	}
}

class ReactiveCardIsSubjectExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta reactiva és el subjecte de l'esdeveniment",
			es: 'la carta reactiva es el sujeto del evento',
			en: 'reactive card is the event subject'
		};
	}

	override evaluate(state: GameState): boolean {
		const reactiveCard = state.getReactiveCard();
		const subject = state.getSubject();
		return reactiveCard !== undefined && subject !== undefined && reactiveCard.id === subject.id;
	}
}

class ReactiveCardIsTargetExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: "la carta reactiva és el destinatari de l'esdeveniment",
			es: 'la carta reactiva es el objetivo del evento',
			en: 'reactive card is the event target'
		};
	}

	override evaluate(state: GameState): boolean {
		const reactiveCard = state.getReactiveCard();
		const target = state.getTarget();
		return reactiveCard !== undefined && target !== undefined && reactiveCard.id === target.id;
	}
}

class ActiveCardHasTypeExpression extends BooleanExpression {
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

	override evaluate(state: GameState): boolean {
		const activeCard = state.getActiveCard();
		return activeCard !== undefined && activeCard.card.type.id === this.type.id;
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
