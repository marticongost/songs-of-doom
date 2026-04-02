import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { evaluateScalar, ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import { currentLocation, Target, type LocationTargetType, type TargetSpec } from '../target';
import { EffectWithOutcome } from './effect';

/**
 * Props for configuring a GatherCluesEffect.
 */
export interface GatherCluesEffectProps {
	/** The amount of clues to gather. */
	amount: ScalarExpressionType;

	/** The location to gather the clues from. Defaults to the current location. */
	target?: TargetSpec<LocationTargetType>;
}

export interface GatherCluesOutcome {
	/** The amount of clues that were gathered. */
	readonly amount: number;

	/** The location from which the clues were gathered from. */
	readonly locationId: number;
}

/**
 * An effect that gathers clues from a location.
 */
export class GatherCluesEffect extends EffectWithOutcome<GatherCluesOutcome> {
	/** The amount of clues to gather. */
	readonly amount: ScalarExpressionType;

	/** The location to gather the clues from. */
	readonly target: Target<LocationTargetType>;

	constructor({ amount, target }: GatherCluesEffectProps) {
		super();
		this.amount = amount;
		this.target = (finalise(Target, target) ?? currentLocation) as Target<LocationTargetType>;
	}

	override async trigger(gameGraph: GameGraph) {
		// TODO: Add helper to gameState to request a target location or default to the
		// current one
		gameGraph.effectTriggered<GatherCluesEffect>(this, (state) => {
			// TODO: Subtract clues from the location
			// TODO: Limit amount to available clues at the location
			const amount = evaluateScalar(this.amount, state);
			return { amount, locationId: 0 };
		});
	}
}

const isScalar = (v: ScalarExpressionType | GatherCluesEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a gather clues effect. */
export const gatherClues = (
	amountOrProps: ScalarExpressionType | GatherCluesEffectProps
): GatherCluesEffect =>
	new GatherCluesEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
