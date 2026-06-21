import type { AddChargesEffect } from '@songsofdoom/game';
import type { CardId } from '../..';
import { Counter, ReadonlyCounter } from '../../../../common/src/counter';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export interface AddChargesEffectState extends EffectProcedureState<AddChargesEffect> {
	/**
	 * The IDs of the entities to which the charges will be added.
	 */
	targetIds?: CardId[];

	/**
	 * The number of charges to added to each target entity.
	 */
	addedCharges?: ReadonlyCounter<CardId>;
}

const { define, resolveTargetList } = instructions<AddChargesEffectState>();

export const addChargesEffectProc = define({
	id: ProcedureId.AddChargesEffect,
	steps: {
		resolveTargets: resolveTargetList(
			(state) => state.effect.target ?? 'current-card',
			'targetIds'
		),
		addCharges: (state) => {
			const { game, effect } = state;
			const chargesToAdd = effect.amount === 'max' ? Infinity : game.evaluateScalar(effect.amount);
			const addedCharges = new Counter<CardId>();
			game.mutate((mutableGame) => {
				for (const targetId of state.targetIds!) {
					const cardState = mutableGame.requireCard(targetId);
					const rechargeableAmount = cardState.card.maxCharges - cardState.charges;
					const rechargedAmount = Math.min(chargesToAdd, rechargeableAmount);
					cardState.charges += rechargedAmount;
					addedCharges.add(targetId, rechargedAmount);
				}
			});
			return { ...state, addedCharges };
		}
	}
});
