import { getEntryMetadata } from '../catalog';
import type { Discipline } from './discipline';
import { ParentEntity, type EntityProps } from './entity';
import { archetype } from './properties';

export interface ArchetypeProps extends EntityProps<Archetype> {
	disciplines?: ReadonlyArray<string>;
}

export class Archetype extends ParentEntity {
	override readonly type = archetype;
	override readonly maxCopies = 1;

	private readonly _disciplineIds: ReadonlyArray<string>;

	constructor({ disciplines, ...props }: ArchetypeProps) {
		super(props);
		this._disciplineIds = disciplines ?? [];
	}

	override get requiredArchetype(): Archetype | undefined {
		return this.parent;
	}

	/** Returns the disciplines unlocked by this archetype. */
	get disciplines(): Array<Discipline> {
		const catalog = getEntryMetadata(this).catalog;
		return this._disciplineIds.map((id) => catalog.require(id) as Discipline);
	}
}
