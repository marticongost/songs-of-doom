import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../..';
import { isScalarExpression } from '../expressions/scalar/scalar-expression';
import type { GameGraph } from '../game/gamegraph';
import type { Property } from '../properties';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export interface WoundEffectProps {
	damage: ScalarExpressionType;
	target?: TargetSpec;
	properties?: Array<Property>;
	causedByAttack?: boolean;
}

export class WoundEffect extends Effect {
	readonly damage: ScalarExpressionType;
	readonly target?: Target;
	readonly properties: Array<Property>;
	readonly causedByAttack: boolean;

	constructor({ damage, target, properties, causedByAttack }: WoundEffectProps) {
		super();
		this.damage = damage;
		this.target = finalise(Target, target);
		this.properties = properties ?? [];
		this.causedByAttack = causedByAttack ?? false;
	}

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/** Creates an effect that inflicts a wound. */
export const wound = (damageOrProps: ScalarExpressionType | WoundEffectProps): WoundEffect =>
	new WoundEffect(isScalarExpression(damageOrProps) ? { damage: damageOrProps } : damageOrProps);
