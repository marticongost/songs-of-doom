import { ChildEntity } from '$lib/catalog/models/entity';
import { Module } from './module';
import { encounter } from './properties/entitytypes';

export class Encounter extends ChildEntity<Module> {
	override readonly type = encounter;
}
