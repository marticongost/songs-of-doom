import type { Archetype } from './archetype';
import { ChildEntity } from './entity';
import { trait } from './properties';

export class Trait extends ChildEntity<Archetype> {
	override readonly type = trait;
}
