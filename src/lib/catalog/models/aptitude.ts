import type { LocalisedText } from '$lib/localisation';
import { attributeTypes, stats, type AttributeType } from './stats';

export type AptitudeType = AttributeType | 'focus' | 'any';

export const aptitudeTypes: AptitudeType[] = [...attributeTypes, 'focus', 'any'];

export class Aptitude {
	readonly type: AptitudeType;
	readonly title: LocalisedText;

	constructor(type: AptitudeType, title: LocalisedText) {
		this.type = type;
		this.title = title;
	}
}

export const aptitudes: Record<AptitudeType, Aptitude> = Object.assign(
	{ focus: new Aptitude('focus', { en: 'Focus', es: 'Focus', ca: 'Focus' }) },
	{ any: new Aptitude('any', { en: 'Any', es: 'Cualquiera', ca: 'Qualsevol' }) },
	...attributeTypes.map((type) => ({
		[type]: new Aptitude(type, stats[type].name)
	}))
);

export type AptitudesProps = Partial<Record<AptitudeType, number>>;

export class Aptitudes {
	readonly strength: number = 0;
	readonly agility: number = 0;
	readonly intelligence: number = 0;
	readonly charisma: number = 0;
	readonly will: number = 0;
	readonly focus: number = 0;
	readonly any: number = 0;

	constructor({ strength, agility, intelligence, charisma, will, focus, any }: AptitudesProps) {
		this.strength = strength ?? 0;
		this.agility = agility ?? 0;
		this.intelligence = intelligence ?? 0;
		this.charisma = charisma ?? 0;
		this.will = will ?? 0;
		this.focus = focus ?? 0;
		this.any = any ?? 0;
	}

	get(aptitude: AptitudeType): number {
		return this[aptitude];
	}

	empty(): boolean {
		return (
			!this.strength &&
			!this.agility &&
			!this.intelligence &&
			!this.charisma &&
			!this.will &&
			!this.focus &&
			!this.any
		);
	}
}
