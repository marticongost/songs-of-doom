import type { ScalarExpressionType } from '../../models/expressions/scalar/scalar-expression';
import type { Property } from '../../models/properties';
import { ParametricRule } from '../../models/properties';

export interface InvulnerableParams {
	attackType?: Property;
	value?: ScalarExpressionType;
}

export class InvulnerableRule extends ParametricRule<InvulnerableParams> {}

export default new InvulnerableRule({
	title: {
		ca: 'Invulnerable',
		es: 'Invulnerable',
		en: 'Invulnerable'
	}
});
