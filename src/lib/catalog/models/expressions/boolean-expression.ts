import type { Effect } from '../effects/effect';
import { ConditionalEffect } from '../effects/conditional';
import { Expression } from './expression';

/**
 * Base class for expressions that produce boolean (true/false) values.
 * Boolean expressions can be used as conditions for effects and targets.
 */
export abstract class BooleanExpression extends Expression {
	/**
	 * Convenience method that creates a conditional effect with a single branch based
	 * on this boolean expression.
	 * @param effects The effects to execute if this expression evaluates to true.
	 * @returns A ConditionalEffect that wraps these effects.
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
