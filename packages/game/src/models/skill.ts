import { finalise } from '@songsofdoom/common';
import type { Archetype } from './archetype';
import type { Discipline } from './discipline';
import { ChildEntity, type EntityProps } from './entity';
import { Focuses, type FocusesProps } from './focus';
import { skill } from './properties';

export interface SkillProps extends EntityProps<Skill> {
	discardReward?: Focuses | FocusesProps;
}

export class Skill extends ChildEntity<Discipline | Archetype> {
	override readonly type = skill;
	override readonly maxCopies = 2;

	readonly discardReward?: Focuses;

	constructor({ discardReward, ...baseProps }: SkillProps) {
		super(baseProps);
		this.discardReward = finalise(Focuses, discardReward);
	}
}
