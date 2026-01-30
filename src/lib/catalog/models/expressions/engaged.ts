import { BooleanExpression } from './boolean-expression';

/**
 * A boolean expression that checks if the subject is engaged in combat.
 * A character is considered engaged when they are in melee range with one or more enemies.
 *
 * To check for NOT engaged, use `not(engaged)` instead of a separate expression.
 */
export class EngagedExpression extends BooleanExpression {}

/**
 * Singleton instance representing the "engaged in combat" condition.
 * Use `not(engaged)` to check if NOT engaged.
 */
export const engaged = new EngagedExpression();
