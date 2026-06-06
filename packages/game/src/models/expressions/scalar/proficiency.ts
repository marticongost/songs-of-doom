import { ScalarExpression } from './scalar-expression';

/**
 * A scalar expression that represents the effective level of proficiency for the
 * current test.
 */
export class ProficiencyExpression extends ScalarExpression {}

/**
 * Singleton instance representing the proficiency of a test.
 */
export const proficiency = new ProficiencyExpression();
