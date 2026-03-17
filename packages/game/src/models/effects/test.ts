import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';
import { ResultsTableEffect, type ResultsTableEffectProps } from './resultstable';

/**
 * Input type for the results prop that accepts either the shorthand or the full ResultsTableEffect.
 */
export type ResultsSpec = ResultsTableEffect | ResultsTableEffectProps;

/**
 * Props for configuring a TestEffect.
 */
export interface TestEffectProps {
	/**
	 * The target(s) that must perform the test.
	 * Defaults to "active-player" if not specified.
	 */
	target?: TargetSpec;
	/** The expression that sets the proficiency level for the test. */
	expression: ScalarExpressionType;
	/** The effects to apply based on the test result. */
	results: ResultsSpec;
}

/**
 * An effect that causes a target to resolve a test with a certain proficiency level,
 * and apply different effects based on the obtained results.
 */
export class TestEffect extends Effect {
	/** The target(s) that must perform the test. */
	readonly target: Target;
	/** The expression that sets the proficiency level for the test. */
	readonly expression: ScalarExpressionType;
	/** The effects to apply based on the test result. */
	readonly results: ResultsTableEffect;

	constructor({ target = 'active-player', expression, results }: TestEffectProps) {
		super();
		this.target = finalise(Target, target);
		this.expression = expression;
		this.results = finalise(ResultsTableEffect, results);
	}
}

/** Creates a test effect. */
export const test = (props: TestEffectProps): TestEffect => new TestEffect(props);
