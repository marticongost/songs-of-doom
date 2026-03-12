import { ChildEntity } from './entity';
import type { Scenario } from './scenario';
import { mission } from './properties/entitytypes';

export class Mission extends ChildEntity<Scenario> {
	override readonly type = mission;
}
