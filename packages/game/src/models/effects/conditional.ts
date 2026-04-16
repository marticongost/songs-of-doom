import type { BooleanExpressionType } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

export interface ConditionalEffectProps {
	cases: Case[];
	default?: Effect[];
}

export interface Case {
	condition: BooleanExpressionType;
	effects: Effect[];
}

export class ConditionalEffect extends Effect {
	readonly cases: Case[];
	readonly default?: Effect[];

	constructor({ cases, default: defaultEffect }: ConditionalEffectProps) {
		super();
		this.cases = cases;
		this.default = defaultEffect;
	}

	elseIf(condition: BooleanExpressionType, ...effects: Effect[]): ConditionalEffect {
		return new ConditionalEffect({
			cases: [...this.cases, { condition, effects }],
			default: this.default
		});
	}

	orElse(...effects: Effect[]): ConditionalEffect {
		return new ConditionalEffect({
			cases: this.cases,
			default: [...(this.default ?? []), ...effects]
		});
	}

	override async apply(gameGraph: GameGraph) {
		for (const { condition, effects } of this.cases) {
			if (gameGraph.current.state.evaluate(condition)) {
				for (const effect of effects) {
					await gameGraph.triggerEffect(effect);
				}
			} else if (this.default) {
				for (const effect of this.default) {
					await gameGraph.triggerEffect(effect);
				}
			}
		}
	}
}

/** Creates a conditional effect. */
export const conditional = (
	casesOrProps: Case[] | ConditionalEffectProps,
	defaultEffects?: Effect[]
): ConditionalEffect =>
	new ConditionalEffect(
		Array.isArray(casesOrProps) ? { cases: casesOrProps, default: defaultEffects } : casesOrProps
	);
