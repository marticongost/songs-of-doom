import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { isScalarExpression } from '../expressions/scalar/scalar-expression';
import { MutableAttackResolution } from '../game/attackresolution';
import type { GameGraph } from '../game/gamegraph';
import type { Property } from '../properties';
import { parseResultString, type ResultString } from '../results';
import { Target, type CombatantTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';
import { ResultsTableEffect, resultsTable } from './resultstable';
import { wound } from './wound';

export interface AttackEffectProps {
	expression: ScalarExpressionType;
	results: ResultsTableEffect | Partial<Record<ResultString, number | Array<Effect>>>;
	properties?: Array<Property>;
	target?: TargetSpec<CombatantTargetType>;
}

export class AttackEffect extends Effect {
	readonly expression: ScalarExpressionType;
	readonly results: ResultsTableEffect;
	readonly properties: Array<Property>;
	readonly target?: Target<CombatantTargetType>;

	constructor({ expression, results, properties, target }: AttackEffectProps) {
		super();
		this.expression = expression;
		this.target = finalise(Target, target);
		this.results =
			results instanceof ResultsTableEffect
				? results
				: resultsTable({
						entries: Object.entries(results).map(([result, outcome]) => ({
							result: parseResultString(result as ResultString),
							effects: isScalarExpression(outcome)
								? [wound({ damage: outcome, causedByAttack: true })]
								: outcome
						}))
					});
		this.properties = properties ?? [];
	}

	override async apply(gameGraph: GameGraph, additionalEffects: Array<Effect> = []): Promise<void> {
		const attackerId = gameGraph.current.state.requireSubject().id;
		const defenderIds = await gameGraph.requestTargets(this.target);
		for (const defenderId of defenderIds) {
			await gameGraph.test({
				subjectId: attackerId,
				targetId: defenderId,
				proficiency: this.expression,
				properties: this.properties,
				resolutionFactory: (props) => new MutableAttackResolution({ ...props, defenderId }),
				effects: [this.results, ...additionalEffects],
				beforeTest: async (graph) => {
					await graph.triggerEvent('attack');
				}
			});
		}
	}
}

/** Creates an attack effect. */
export const attack = (props: AttackEffectProps): AttackEffect => new AttackEffect(props);
