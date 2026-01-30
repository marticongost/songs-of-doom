import { gte } from './comparison';
import { ScalarExpression } from './scalar-expression';

export class RemainingWoundsExpression extends ScalarExpression {}

export const remainingWounds = new RemainingWoundsExpression();

export class ReceivedWoundsExpression extends ScalarExpression {}

export const receivedWounds = new ReceivedWoundsExpression();

export const wounded = gte(receivedWounds, 1);
