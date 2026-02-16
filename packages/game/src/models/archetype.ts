import { ParentEntity } from './entity';
import { archetype } from './properties';

export class Archetype extends ParentEntity {
	override readonly type = archetype;
	override readonly maxCopies = 1;

	override get requiredArchetype(): Archetype | undefined {
		return this.parent;
	}
}
