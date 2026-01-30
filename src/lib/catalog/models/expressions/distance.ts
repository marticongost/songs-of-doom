import { ScalarExpression } from './scalar-expression';

/**
 * A scalar expression that returns the distance (in steps) to a target.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * Examples:
 * - `eq(distance, 0)` - at the same location
 * - `lte(distance, 1)` - adjacent or same location
 * - `lte(distance, 2)` - within 2 steps
 */
export class DistanceExpression extends ScalarExpression {}

/**
 * Singleton instance representing the distance to a target.
 * Use in comparisons: `eq(distance, 0)`, `lte(distance, 1)`, etc.
 */
export const distance = new DistanceExpression();
