import { Entity, type EntityProps, type EntityType } from '$lib/catalog/models/entity';
import { finalise } from '$lib/modelling';
import { getEntryMetadata } from '..';
import skill from '../data/properties/skill';
import { Focuses, type FocusesProps } from './focus';
import { type Property } from './properties';
import { Trait } from './trait';

export interface SkillProps extends EntityProps {
	discardReward?: Focuses | FocusesProps;
}

const NOT_COMPUTED = Symbol('not computed');

export class Skill extends Entity {
	private _archetype: Trait | undefined | typeof NOT_COMPUTED;
	readonly discardReward?: Focuses;

	constructor({ discardReward, ...baseProps }: SkillProps) {
		super(baseProps);
		this._archetype = NOT_COMPUTED;
		this.discardReward = finalise(Focuses, discardReward);
	}

	override get type(): EntityType {
		return 'skill';
	}

	override get archetype(): Trait | undefined {
		if (this._archetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			if (metadata.path.length >= 2) {
				const archetypeId = metadata.path[metadata.path.length - 2];
				const parentEntity = metadata.catalog.require(archetypeId);
				if (parentEntity instanceof Trait) {
					return (this._archetype = parentEntity);
				}
			}
			return (this._archetype = undefined);
		}
		return this._archetype;
	}

	override getImplicitProperties(): Array<Property> {
		return [...super.getImplicitProperties(), skill];
	}
}
