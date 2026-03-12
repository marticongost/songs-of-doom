import { ParentEntity, type EntityProps } from './entity';
import { scenario } from './properties/entitytypes';

export class Scenario extends ParentEntity {
	override readonly type = scenario;

	constructor(props: EntityProps<Scenario>) {
		super(props);
	}
}
