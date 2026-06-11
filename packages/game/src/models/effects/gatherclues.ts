import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import { currentLocation, Target, type LocationTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

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

	/*
	override async apply(gameGraph: GameGraph) {
		const targetIds = (await gameGraph.requestTargets(this.target, {
			default: 'current-target'
		})) as Array<CardId>;

		gameGraph.mutate((state) => {
			const subject = state.requireSubject();
			const gatheredClues = new Counter<CardId>();
			for (const targetId of targetIds) {
				const location = state.requireCard(targetId) as unknown as MutableLocationState;
				const cluesGathered = Math.min(state.evaluateScalar(this.amount), location.clues);
				location.clues -= cluesGathered;
				subject.clues += cluesGathered;
				gatheredClues.add(targetId, cluesGathered);
			}
			return { gatheredClues };
		});
	}
	*/
}

const isScalar = (v: ScalarExpressionType | GatherCluesEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a gather clues effect. */
export const gatherClues = (
	amountOrProps: ScalarExpressionType | GatherCluesEffectProps
): GatherCluesEffect =>
	new GatherCluesEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
