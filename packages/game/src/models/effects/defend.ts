import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import type { Property } from '../properties';
import { Effect } from './effect';

export interface DefendEffectProps {
	expression: ScalarExpressionType;
	properties?: Array<Property>;
}

export class DefendEffect extends Effect {
	readonly expression: ScalarExpressionType;
	readonly properties: Array<Property>;

	constructor({ expression, properties }: DefendEffectProps) {
		super();
		this.expression = expression;
		this.properties = properties ?? [];
	}

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

const isScalar = (v: ScalarExpressionType | DefendEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a defend effect. */
export const defend = (expressionOrProps: ScalarExpressionType | DefendEffectProps): DefendEffect =>
	new DefendEffect(
		isScalar(expressionOrProps) ? { expression: expressionOrProps } : expressionOrProps
	);
