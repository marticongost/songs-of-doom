import { ParametricRule } from '../../models/properties';
import type { Property } from '../../models/properties';

export interface VulnerableParams {
	attackType: Property;
	value: number;
}

export class VulnerableRule extends ParametricRule<VulnerableParams> {}

export default new VulnerableRule({
	title: {
		ca: 'Vulnerable',
		es: 'Vulnerable',
		en: 'Vulnerable'
	}
});
