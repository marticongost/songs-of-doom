import { type ScalarExpressionType } from '../expressions/scalar/scalar-expression';
import { plus } from '../expressions/scalar/scalar-operation';
import { type Property } from './property';
import { Rule } from './rule';

export class ParametricRule<P> extends Rule {
	with(params: P): ParametricRuleInstance<P> {
		return new ParametricRuleInstance<P>({ rule: this, params });
	}

	/**
	 * Merges the parameter payloads of two instances of this rule.
	 *
	 * The default behavior performs a shallow object merge where values from
	 * `params2` override overlapping keys from `params1`.
	 *
	 * @param params1 The first parameter payload.
	 * @param params2 The second parameter payload.
	 * @returns A merged parameter payload.
	 */
	mergeParams(params1: P, params2: P): P {
		return { ...params1, ...params2 };
	}
}

export interface ParametricRuleProps<P> {
	rule: ParametricRule<P>;
	params: P;
}

export class ParametricRuleInstance<P> extends Rule {
	readonly rule: ParametricRule<P>;
	readonly params: P;

	constructor({ rule, params }: ParametricRuleProps<P>) {
		super({ title: rule.title, description: rule.description });
		this.rule = rule;
		this.params = params;
	}

	override is(property: Property): boolean {
		return this.rule === property;
	}

	/**
	 * Merges this rule instance with another instance of the same underlying rule.
	 *
	 * @param other Another rule instance.
	 * @returns A new rule instance containing merged parameters.
	 * @throws Error If the two instances were created from different rules.
	 */
	override merge(other: this): this {
		if (this.rule !== other.rule) {
			throw new Error('Cannot merge rules of different types');
		}
		return new ParametricRuleInstance({
			rule: this.rule,
			params: this.rule.mergeParams(this.params, other.params)
		}) as this;
	}
}

export interface ScalarRuleParams {
	value: ScalarExpressionType;
}

export class ScalarRule extends ParametricRule<ScalarRuleParams> {
	/**
	 * Merges scalar rule parameters by adding both scalar values.
	 *
	 * @param params1 The first scalar parameter payload.
	 * @param params2 The second scalar parameter payload.
	 * @returns The merged scalar parameter payload.
	 */
	override mergeParams(params1: ScalarRuleParams, params2: ScalarRuleParams): ScalarRuleParams {
		return {
			value: plus(params1.value, params2.value)
		};
	}
}
