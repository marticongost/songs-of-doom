import { ParentEntity } from '$lib/catalog/models/entity';
import type { LocalisedText } from '$lib/localisation';
import { module } from './properties/entitytypes';

export interface ModuleProps {
	title: LocalisedText;
}

export class Module extends ParentEntity {
	override readonly type = module;

	constructor({ title }: ModuleProps) {
		super({ title });
	}
}
