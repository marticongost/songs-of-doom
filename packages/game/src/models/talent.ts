import type { LocalisedText } from '@songsofdoom/common';
import { stats, type Stat, type StatType } from './stats';

export interface TalentProps {
	id: string;
	title: LocalisedText;
	stat?: Stat | StatType;
}

export class Talent {
	readonly id: string;
	readonly title: LocalisedText;
	readonly stat?: Stat;

	constructor({ id, title, stat }: TalentProps) {
		this.id = id;
		this.title = title;
		this.stat = typeof stat === 'string' ? stats[stat] : stat;
	}
}
