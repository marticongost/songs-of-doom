import { Expression } from './expression';

/**
 * Base class for expressions that produce numeric (scalar) values.
 * Scalar expressions can be used in arithmetic operations and comparisons.
 */
export abstract class ScalarExpression extends Expression {}
