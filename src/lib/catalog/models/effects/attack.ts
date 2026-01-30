import { type ScalarExpressionType } from '../expressions';
import type { Property } from '../properties';
import { parseResultString, type Result, type ResultRange, type ResultString } from '../results';
import { Effect } from './effect';

export interface FightEffectProps {
	expression: ScalarExpressionType;
	damage: DamageTable | Partial<Record<ResultString, number>>;
	properties?: Array<Property>;
}

export interface DamageTableEntry {
	result: Result | ResultRange;
	inflictedDamage: number;
}

export type DamageTable = Array<DamageTableEntry>;

export class AttackEffect extends Effect {
	readonly expression: ScalarExpressionType;
	readonly damage: DamageTable;
	readonly properties: Array<Property>;

	constructor({ expression, damage, properties }: FightEffectProps) {
		super();
		this.expression = expression;
		this.damage =
			damage instanceof Array
				? damage
				: Object.entries(damage).map(([result, inflictedDamage]) => ({
						result: parseResultString(result as ResultString),
						inflictedDamage
					}));
		this.properties = properties ?? [];
	}
}
