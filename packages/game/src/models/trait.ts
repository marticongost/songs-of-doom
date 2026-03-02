import type { Archetype } from './archetype';
import type { Discipline } from './discipline';
import type { Effect } from './effects';
import { ChildEntity } from './entity';
import { trait } from './properties';

export class Trait extends ChildEntity<Discipline | Archetype> {
	override readonly type = trait;
	override readonly maxCopies = 1;

	override permanentEffects(): Array<Effect> {
		return this.capabilities.flatMap((capability) => capability.constantEffects());
	}
}
