import { finalise } from '@songsofdoom/common';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export type RechargeAmount = number | 'max';

export interface RechargeEffectProps {
	amount: RechargeAmount;
	target?: TargetSpec;
}

export class AddChargesEffect extends Effect {
	readonly amount: RechargeAmount;
	readonly target?: Target;

	constructor({ amount, target }: RechargeEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<AddChargesEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates an add charges effect. */
export const addCharges = (amountOrProps: RechargeAmount | RechargeEffectProps): AddChargesEffect =>
	new AddChargesEffect(
		typeof amountOrProps === 'number' || amountOrProps === 'max'
			? { amount: amountOrProps }
			: amountOrProps
	);
