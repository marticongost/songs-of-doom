import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { currentLocation, Target, type LocationTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';
import { ScalarExpression } from '../expressions';

/**
 * Props for configuring a GatherCluesEffect.
 */
export interface GatherCluesEffectProps {
	/** The amount of clues to gather. */
	amount: ScalarExpressionType;

	/** The location to gather the clues from. Defaults to the current location. */
	target?: TargetSpec<LocationTargetType>;
}

/**
 * An effect that gathers clues from a location.
 */
export class GatherCluesEffect extends Effect {
	/** The amount of clues to gather. */
	readonly amount: ScalarExpressionType;

	/** The location to gather the clues from. */
	readonly target: Target<LocationTargetType>;

	constructor({ amount, target }: GatherCluesEffectProps) {
		super();
		this.amount = amount;
		this.target = (finalise(Target, target) ?? currentLocation) as Target<LocationTargetType>;
	}
}

const isScalar = (v: ScalarExpressionType | GatherCluesEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a gather clues effect. */
export const gatherClues = (
	amountOrProps: ScalarExpressionType | GatherCluesEffectProps
): GatherCluesEffect =>
	new GatherCluesEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
