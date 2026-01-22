import { ConditionalEffect, type Effect } from '../effects';

export class Condition {
	/** Convinience method that creates a conditional effect with a single branch based
	 * on this condition.
	 */
	then(...effects: Array<Effect>): ConditionalEffect {
		return new ConditionalEffect({
			cases: [
				{
					condition: this,
					effects: effects
				}
			]
		});
	}
}
