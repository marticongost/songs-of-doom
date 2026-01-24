import { Rule } from './rule';

export class ParametricRule<P> extends Rule {
	with(params: P): ParametricRuleInstance<P> {
		return new ParametricRuleInstance<P>({ rule: this, params });
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
}

export interface ScalarRuleParams {
	value: number;
}

export class ScalarRule extends ParametricRule<ScalarRuleParams> {}
