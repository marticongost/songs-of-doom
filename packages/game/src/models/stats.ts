import type { LocalisedText } from '@songsofdoom/common/localisation';

import type { GameState } from './game/gamestate';
import { ScalarExpression } from './expressions/scalar/scalar-expression';

export type AttributeType = 'strength' | 'agility' | 'intelligence' | 'charisma' | 'will';
export type IndicatorType = 'health' | 'sanity';

export type StatType = AttributeType | IndicatorType;

export const STARTING_ATTRIBUTE_VALUE = 3;
export const STARTING_INDICATOR_VALUE = 7;

export abstract class Stat extends ScalarExpression {
	readonly type: StatType;
	readonly name: LocalisedText;
	readonly startingValue: number;

	constructor(type: StatType, name: LocalisedText, startingValue: number) {
		super();
		this.type = type;
		this.name = name;
		this.startingValue = startingValue;
	}

	evaluate(state: GameState): number {
		return state.requireActivePlayer().getStat(this);
	}
}

export class Attribute extends Stat {
	constructor(type: AttributeType, name: LocalisedText) {
		super(type, name, STARTING_ATTRIBUTE_VALUE);
	}
}

export class Indicator extends Stat {
	constructor(type: IndicatorType, name: LocalisedText) {
		super(type, name, STARTING_INDICATOR_VALUE);
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

export const attributes: Record<AttributeType, Attribute> = {
	agility,
	strength,
	intelligence,
	charisma,
	will
};

export const indicators: Record<IndicatorType, Indicator> = {
	health,
	sanity
};

export const stats: Record<StatType, Stat> = { ...attributes, ...indicators };
