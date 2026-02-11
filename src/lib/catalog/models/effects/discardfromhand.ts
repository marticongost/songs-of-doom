import { finalise } from '$lib/modelling';
import { type ScalarExpressionType } from '../expressions';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export type DiscardFromHandSelection = 'owner' | 'random';

/**
 * Props for configuring a DiscardFromHandEffect.
 */
export interface DiscardFromHandEffectProps {
	/**
	 * Who is affected by the effect.
	 * Defaults to "self" (the card triggering the effect).
	 */
	target?: TargetSpec;

	/**
	 * How many cards to discard.
	 */
	amount?: ScalarExpressionType;

	/**
	 * Who chooses which cards to discard.
	 * - "owner": The owner of the affected character chooses which cards to discard.
	 * - "random": Cards are chosen randomly from the hand.
	 * Defaults to "owner".
	 */
	selection?: DiscardFromHandSelection;
}

/**
 * An effect that discards cards from the hand of the target.
 */
export class DiscardFromHandEffect extends Effect {
	/** Who is affected by the effect. */
	readonly target: Target;

	/** How many cards to discard. */
	readonly amount: ScalarExpressionType;

	/** Who chooses which cards to discard. */
	readonly selection: DiscardFromHandSelection;

	constructor({ target, amount, selection }: DiscardFromHandEffectProps) {
		super();
		this.target = finalise(Target, target ?? 'self');
		this.amount = amount ?? 1;
		this.selection = selection ?? 'owner';
	}
}
