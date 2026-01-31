import { Entity, type EntityProps } from '$lib/catalog/models/entity';
import { finalise } from '$lib/modelling';
import { getEntryMetadata } from '..';
import { Archetype } from './archetype';
import { Focuses, type FocusesProps } from './focus';
import { skill, type EntityType } from './properties';

export interface SkillProps extends EntityProps<Skill> {
	discardReward?: Focuses | FocusesProps;
}

const NOT_COMPUTED = Symbol('not computed');

export class Skill extends Entity {
	private _archetype: Archetype | undefined | typeof NOT_COMPUTED;
	override readonly type: EntityType = skill;
	readonly discardReward?: Focuses;

	constructor({ discardReward, ...baseProps }: SkillProps) {
		super(baseProps);
		this._archetype = NOT_COMPUTED;
		this.discardReward = finalise(Focuses, discardReward);
	}

	override get archetype(): Archetype | undefined {
		if (this._archetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			if (metadata.path.length >= 2) {
				const archetypeId = metadata.path[metadata.path.length - 2];
				const parentEntity = metadata.catalog.require(archetypeId);
				if (parentEntity instanceof Archetype) {
					return (this._archetype = parentEntity);
				}
			}
			return (this._archetype = undefined);
		}
		return this._archetype;
	}
}
