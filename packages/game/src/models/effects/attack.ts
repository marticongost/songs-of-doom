import type { ScalarExpressionType } from '../expressions';
import type { Property } from '../properties';
import { parseResultString, type Result, type ResultRange, type ResultString } from '../results';
import { Effect } from './effect';
import { ResultsTableEffect, resultsTable } from './resultstable';
import { wound } from './wound';

export interface FightEffectProps {
	expression: ScalarExpressionType;
	results: ResultsTableEffect | Partial<Record<ResultString, number | Array<Effect>>>;
	properties?: Array<Property>;
}

export interface AttackResult {
	result: Result | ResultRange;
	effects: Array<Effect>;
}

export class AttackEffect extends Effect {
	readonly expression: ScalarExpressionType;
	readonly results: ResultsTableEffect;
	readonly properties: Array<Property>;

	constructor({ expression, results, properties }: FightEffectProps) {
		super();
		this.expression = expression;
		this.results =
			results instanceof ResultsTableEffect
				? results
				: resultsTable({
						entries: Object.entries(results).map(([result, outcome]) => ({
							result: parseResultString(result as ResultString),
							effects: typeof outcome === 'number' ? [wound(outcome)] : outcome
						}))
					});
		this.properties = properties ?? [];
	}
}

/** Creates an attack effect. */
export const attack = (props: FightEffectProps): AttackEffect => new AttackEffect(props);
