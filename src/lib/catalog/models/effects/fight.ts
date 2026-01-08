import { parseExpression, type StatExpression, type StatExpressionNode } from '../expression';
import { parseResultString, type Result, type ResultRange, type ResultString } from '../results';
import { Effect, type EffectProps } from './effect';

export interface FightEffectProps extends EffectProps {
	expression: StatExpression;
	damage: DamageTable | Partial<Record<ResultString, number>>;
}

export interface DamageTableEntry {
	result: Result | ResultRange;
	inflictedDamage: number;
}

export type DamageTable = Array<DamageTableEntry>;

export class FightEffect extends Effect {
	readonly expression: StatExpressionNode;
	readonly damage: DamageTable;

	constructor({ expression, damage, properties }: FightEffectProps) {
		super({ properties });
		this.expression = typeof expression === 'string' ? parseExpression(expression) : expression;
		this.damage =
			damage instanceof Array
				? damage
				: Object.entries(damage).map(([result, inflictedDamage]) => ({
						result: parseResultString(result as ResultString),
						inflictedDamage
					}));
	}
}
