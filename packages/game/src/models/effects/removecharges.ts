import { finalise } from '@songsofdoom/common';
import type { ScalarExpressionType } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a RemoveChargesEffect.
 */
export interface RemoveChargesEffectProps {
	amount?: ScalarExpressionType;
	target?: TargetSpec;
}

/**
 * An effect that removes charges from a target.
 */
export class RemoveChargesEffect extends Effect {
	readonly amount?: ScalarExpressionType;
	readonly target?: Target;

	constructor({ amount, target }: RemoveChargesEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<RemoveChargesEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates an effect that removes charges from a target. */
export const removeCharges = (props: RemoveChargesEffectProps = {}): RemoveChargesEffect =>
	new RemoveChargesEffect(props);
