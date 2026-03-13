import type { Effect } from './effects';
import { ParentEntity, type EntityProps } from './entity';
import { scenario } from './properties/entitytypes';
import type { Sigil } from './results';

export interface ScenarioProps extends EntityProps<Scenario> {
	/** Effects of drawing a sigil fate token. */
	sigils: Record<Sigil, Effect[]>;
}

export class Scenario extends ParentEntity {
	override readonly type = scenario;

	/** Effects of drawing a sigil fate token. */
	readonly sigils: Record<Sigil, Effect[]>;

	constructor({ sigils, ...baseProps }: ScenarioProps) {
		super(baseProps);
		this.sigils = sigils;
	}
}
