import type { LocalisedText } from '$lib/localisation';

/**
 * Base class for all expressions in the game system.
 * Expressions can be either scalar (producing numeric values) or boolean (producing true/false values).
 */
export abstract class Expression {
	/**
	 * Returns a localized text representation of this expression if a shorthand form exists.
	 * Returns undefined to use the default rendering logic.
	 *
	 * This allows expressions to provide custom, human-readable translations for common patterns
	 * (e.g., "distance = 0" → "Same location", "receivedWounds > 0" → "Wounded").
	 */
	translate(): LocalisedText | undefined {
		return undefined;
	}
}
