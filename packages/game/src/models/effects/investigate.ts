import type { ScalarExpressionType } from '../expressions';
import type { Property } from '../properties';
import { parseResultString, type ResultString } from '../results';
import { Effect } from './effect';
import { gatherClues } from './gatherclues';
import { ResultsTableEffect, resultsTable } from './resultstable';

/**
 * Props for configuring an InvestigateEffect.
 */
export interface InvestigateEffectProps {
	/** The expression establishing the proficiency level for the investigation test. */
	expression: ScalarExpressionType;

	/** Specifies the results of the test. Normalised to ResultsTableEffect. */
	results: ResultsTableEffect | Partial<Record<ResultString, number | Array<Effect>>>;

	/** An optional set of properties assigned to the skill test, offering interaction opportunities to other rules. */
	properties?: Array<Property>;
}

/**
 * An effect that triggers an investigation action, resolving a skill test
 * against a proficiency expression and producing results from a results table.
 */
export class InvestigateEffect extends Effect {
	/** The expression establishing the proficiency level for the investigation test. */
	readonly expression: ScalarExpressionType;

	/** Specifies the results of the test. */
	readonly results: ResultsTableEffect;

	/** An optional set of properties assigned to the skill test, offering interaction opportunities to other rules. */
	readonly properties: Array<Property>;

	constructor({ expression, results, properties }: InvestigateEffectProps) {
		super();
		this.expression = expression;
		this.results =
			results instanceof ResultsTableEffect
				? results
				: resultsTable({
						entries: Object.entries(results).map(([result, outcome]) => ({
							result: parseResultString(result as ResultString),
							effects: typeof outcome === 'number' ? [gatherClues(outcome)] : outcome
						}))
					});
		this.properties = properties ?? [];
	}
}

/** Creates an investigate effect. */
export const investigate = (props: InvestigateEffectProps): InvestigateEffect =>
	new InvestigateEffect(props);
