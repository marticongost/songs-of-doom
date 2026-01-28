import { finalise } from '$lib/modelling';
import { resolveExpression, type Expression, type ExpressionNode } from '../expression';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

export type DiscardCardSelection = 'owner' | 'random';

/**
 * Props for configuring a DiscardCardEffect.
 */
export interface DiscardCardEffectProps {
	/**
	 * Who is affected by the effect.
	 * Defaults to "self".
	 */
	target?: Target | TargetProps;

	/**
	 * How many cards to discard from the target's hand.
	 */
	amount: Expression;

	/**
	 * Who chooses which cards to discard.
	 * - "owner": The owner of the affected character chooses which cards to discard.
	 * - "random": Cards are chosen randomly from the hand.
	 */
	selection: DiscardCardSelection;
}

/**
 * An effect that discards cards from the hand of the target.
 */
export class DiscardCardEffect extends Effect {
	readonly target: Target;
	readonly amount: ExpressionNode;
	readonly selection: DiscardCardSelection;

	constructor({ target, amount, selection }: DiscardCardEffectProps) {
		super();
		this.target = finalise(Target, target ?? 'self');
		this.amount = resolveExpression(amount);
		this.selection = selection ?? 'owner';
	}
}
