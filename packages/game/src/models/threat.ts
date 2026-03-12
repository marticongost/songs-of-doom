import { ChildEntity } from './entity';
import type { Scenario } from './scenario';
import { threat } from './properties/entitytypes';

export class Threat extends ChildEntity<Scenario> {
	override readonly type = threat;
}
