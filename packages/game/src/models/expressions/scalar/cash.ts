import { ScalarExpression } from './scalar-expression';

/** Represents the amount of gold a character carries on their person. */
export class CashExpression extends ScalarExpression {}

export const cash = new CashExpression();
