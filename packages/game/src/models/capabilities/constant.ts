import { Capability } from '../capability';
import type { Effect } from '../effects';

export class Constant extends Capability {
	override constantEffects(): Array<Effect> {
		return this.effects;
	}
}
