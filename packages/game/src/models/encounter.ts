import { ChildEntity } from './entity';
import { Module } from './module';
import { encounter } from './properties/entitytypes';

export class Encounter extends ChildEntity<Module> {
	override readonly type = encounter;
}
