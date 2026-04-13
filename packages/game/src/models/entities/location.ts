import { ChildEntity } from './entity';
import type { Scenario } from './scenario';
import { location } from '../properties/entitytypes';

export class Location extends ChildEntity<Scenario> {
	override readonly type = location;
	override readonly reactionOrder = 2;
}
