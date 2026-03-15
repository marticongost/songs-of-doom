import { ChildEntity } from './entity';
import type { Module } from './module';
import type { Scenario } from './scenario';
import { encounter } from '../properties/entitytypes';

export class Encounter extends ChildEntity<Module | Scenario> {
	override readonly type = encounter;
}
