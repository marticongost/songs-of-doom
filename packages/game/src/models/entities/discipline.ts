import { getEntryMetadata } from '../../catalog';
import { type Archetype } from './archetype';
import { isArchetype, ParentEntity } from './entity';
import { discipline } from '../properties';

export class Discipline extends ParentEntity {
	override readonly type = discipline;
	override readonly maxCopies = undefined;

	/** Returns the archetypes that unlock this discipline. Computed by scanning the catalog. */
	get unlockingArchetypes(): Array<Archetype> {
		return getEntryMetadata(this)
			.catalog.all()
			.filter((entity) => isArchetype(entity) && entity.disciplines.includes(this)) as Archetype[];
	}
}
