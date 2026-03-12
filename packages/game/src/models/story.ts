import { ChildEntity } from './entity';
import type { Scenario } from './scenario';
import { story } from './properties/entitytypes';

export class Story extends ChildEntity<Scenario> {
	override readonly type = story;
}
