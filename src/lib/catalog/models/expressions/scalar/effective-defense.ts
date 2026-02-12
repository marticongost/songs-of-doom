import type { LocalisedText } from '$lib/localisation';
import { ScalarExpression } from './scalar-expression';

/**
 * A scalar expression that returns the effective defense value — the difference between
 * the defense and attack proficiencies.
 *
 * If the effective defense is positive, the attack proficiency is reduced by that
 * amount. If it's zero or negative, the attack proficiency is unaffected.
 *
 * Examples:
 * - `gt(defenseMargin, 0)` — effective defense
 * - `gte(defenseMargin, 3)` — defense exceeds attack by 3+
 */
export class EffectiveDefenseExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'Defensa efectiva',
			es: 'Defensa efectiva',
			en: 'Effective defense'
		};
	}
}

/**
 * Singleton instance representing the effective defense.
 * Use in comparisons: `gt(effectiveDefense, 0)`, `gte(effectiveDefense, 3)`, etc.
 */
export const effectiveDefense = new EffectiveDefenseExpression();
