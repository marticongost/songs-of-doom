import type { LocalisedText } from '@songsofdoom/common/localisation';
import { attributeTypes, Stat, stats, type AttributeType } from './stats';

export type FocusType = AttributeType | 'heroism' | 'any';

export const focusTypes: FocusType[] = [...attributeTypes, 'heroism', 'any'];

export type FocusValue = 1 | 2 | 3;

export class Focus {
	readonly type: FocusType;
	readonly title: LocalisedText;
	readonly stat?: Stat;

	constructor(type: FocusType, title: LocalisedText, stat: Stat | undefined = undefined) {
		this.type = type;
		this.title = title;
		this.stat = stat;
	}
}

export const focuses: Record<FocusType, Focus> = Object.assign(
	{ heroism: new Focus('heroism', { en: 'Heroism', es: 'Heroísmo', ca: 'Heroisme' }) },
	{ any: new Focus('any', { en: 'Any focus', es: 'Foco cualquiera', ca: 'Focus qualsevol' }) },
	...attributeTypes.map((type) => ({
		[type]: new Focus(type, stats[type].name, stats[type])
	}))
);

export type FocusesProps = Partial<Record<FocusType, number>>;

export class Focuses {
	readonly strength: number = 0;
	readonly agility: number = 0;
	readonly intelligence: number = 0;
	readonly charisma: number = 0;
	readonly will: number = 0;
	readonly heroism: number = 0;
	readonly any: number = 0;

	constructor({ strength, agility, intelligence, charisma, will, heroism, any }: FocusesProps) {
		this.strength = strength ?? 0;
		this.agility = agility ?? 0;
		this.intelligence = intelligence ?? 0;
		this.charisma = charisma ?? 0;
		this.will = will ?? 0;
		this.heroism = heroism ?? 0;
		this.any = any ?? 0;
	}

	get(focus: FocusType): number {
		return this[focus];
	}

	empty(): boolean {
		return (
			!this.strength &&
			!this.agility &&
			!this.intelligence &&
			!this.charisma &&
			!this.will &&
			!this.heroism &&
			!this.any
		);
	}
}

export interface FocusTokenProps {
	focus: Focus | FocusType;
	value: FocusValue;
}

export type FocusToken = `${FocusType}-${FocusValue}`;

export const makeFocusToken = (focus: Focus | FocusType, value: FocusValue): FocusToken =>
	`${typeof focus === 'string' ? focus : focus.type}-${value}` as FocusToken;

export const getFocusTokenType = (token: FocusToken): FocusType => token.split('-')[0] as FocusType;

export const getFocusTokenValue = (token: FocusToken): FocusValue =>
	Number(token.split('-')[1]) as FocusValue;

export const FOCUS_TOKENS_FOR_STAT_VALUES: Record<number, Partial<Record<FocusValue, number>>> = {
	1: { 1: 1 },
	2: { 1: 2 },
	3: { 1: 1, 2: 1 },
	4: { 1: 1, 2: 1, 3: 1 },
	5: { 2: 2, 3: 2 },
	6: { 2: 2, 3: 3 }
};
