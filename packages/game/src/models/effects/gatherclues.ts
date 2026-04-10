import { Counter, finalise, type ReadonlyCounter } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import type { CardId, TargetId } from '../game/identifiers';
import type { MutableLocationState } from '../game/locationstate';
import {
	currentLocation,
	Target,
	type ActorTargetType,
	type LocationTargetType,
	type TargetSpec
} from '../target';
import { EffectWithOutcome } from './effect';

/**
 * Props for configuring a GatherCluesEffect.
 */
export interface GatherCluesEffectProps {
	/** The subject(s) gathering the clues. */
	subject?: TargetSpec<ActorTargetType>;

	/** The amount of clues to gather. */
	amount: ScalarExpressionType;

	/** The location to gather the clues from. Defaults to the current location. */
	target?: TargetSpec<LocationTargetType>;
}

export interface GatherCluesOutcome {
	/** The clues that were gathered at each location, grouped by subject. */
	readonly gatheredClues: Map<TargetId, ReadonlyCounter<CardId>>;
}

/**
 * An effect that gathers clues from a location.
 */
export class GatherCluesEffect extends EffectWithOutcome<GatherCluesOutcome> {
	/** The subject(s) gathering the clues. */
	readonly subject?: Target<ActorTargetType>;

	/** The amount of clues to gather. */
	readonly amount: ScalarExpressionType;

	/** The location to gather the clues from. */
	readonly target: Target<LocationTargetType>;

	constructor({ subject, amount, target }: GatherCluesEffectProps) {
		super();
		this.subject = finalise(Target, subject);
		this.amount = amount;
		this.target = (finalise(Target, target) ?? currentLocation) as Target<LocationTargetType>;
	}

	override async trigger(gameGraph: GameGraph) {
		const subjectIds = await gameGraph.requestSubjects(this.subject);
		const subjectTargetIds = new Map<TargetId, Array<CardId>>();

		// Find the locations to investigate in for each subject (it could be different for
		// each subject)
		for (const subjectId of subjectIds) {
			subjectTargetIds.set(
				subjectId,
				(await gameGraph.requestMultipleTargetsOrImplicitTarget(this.subject)) as Array<CardId>
			);
		}

		gameGraph.effectTriggered<GatherCluesEffect>(this, (state) => {
			const outcome: GatherCluesOutcome = { gatheredClues: new Map() };
			for (const [subjectId, targetIds] of subjectTargetIds) {
				const subject = state.requireEntityState(subjectId);
				const subjectGatheredClues = new Counter<CardId>();
				outcome.gatheredClues.set(subjectId, subjectGatheredClues);
				for (const targetId of targetIds) {
					const location = state.requireCard(targetId) as unknown as MutableLocationState;
					const gatheredClues = Math.min(state.evaluate(this.amount), location.clues);
					location.clues -= gatheredClues;
					subject.clues += gatheredClues;
					subjectGatheredClues.add(targetId, gatheredClues);
				}
			}
			return outcome;
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
