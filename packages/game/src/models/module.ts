import { ParentEntity } from './entity';
import type { LocalisedText } from '@songsofdoom/common/localisation';
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
