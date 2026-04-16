import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * Props for configuring a ModifyCarryingCapacityEffect.
 */
export interface ModifyCarryingCapacityEffectProps {
	/** The amount to modify the carrying capacity by. Positive values increase, negative values decrease. */
	modifier: ScalarExpressionType;
}

/**
 * An effect that modifies the player's carrying capacity for items.
 * Grants extra space for carried items (or reduces it, if negative).
 */
export class ModifyCarryingCapacityEffect extends Effect {
	/** The amount to modify the carrying capacity by. Positive values increase, negative values decrease. */
	readonly modifier: ScalarExpressionType;

	constructor({ modifier }: ModifyCarryingCapacityEffectProps) {
		super();
		this.modifier = modifier;
	}

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

const isScalar = (
	v: ScalarExpressionType | ModifyCarryingCapacityEffectProps
): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a modify carrying capacity effect. */
export const modifyCarryingCapacity = (
	modifierOrProps: ScalarExpressionType | ModifyCarryingCapacityEffectProps
): ModifyCarryingCapacityEffect =>
	new ModifyCarryingCapacityEffect(
		isScalar(modifierOrProps) ? { modifier: modifierOrProps } : modifierOrProps
	);
