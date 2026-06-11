import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import { Effect } from './effect';

/**
 * Props for configuring a DrawCardsEffect.
 */
export interface DrawCardsEffectProps {
	/** Number of cards to draw. */
	amount: ScalarExpressionType;
}

/**
 * An effect that makes the active player draw cards from their deck.
 */
export class DrawCardsEffect extends Effect {
	/** Number of cards to draw. */
	readonly amount: ScalarExpressionType;

	constructor({ amount }: DrawCardsEffectProps) {
		super();
		this.amount = amount;
	}
}

const isScalar = (v: ScalarExpressionType | DrawCardsEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates an effect that draws cards. */
export const drawCards = (
	amountOrProps: ScalarExpressionType | DrawCardsEffectProps
): DrawCardsEffect =>
	new DrawCardsEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
