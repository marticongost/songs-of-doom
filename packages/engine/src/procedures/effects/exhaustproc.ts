import { exhausted, not, Target, type ExhaustEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { CardId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface ExhaustEffectState extends EffectProcedureState<ExhaustEffect> {
	/** The IDs of the cards to exhaust. */
	targetIds?: CardId[];

	/**
	 * The IDs of the cards that were exhausted (excluding cards that were already
	 * exhausted).
	 */
	exhaustedCardIds?: CardId[];
}

const { define, resolveTargetList } = instructions<ExhaustEffectState>();

export const exhaustEffectProc = define({
	id: ProcedureId.ExhaustEffect,
	steps: {
		resolveTargets: resolveTargetList((state) => {
			const target = state.effect.target ?? new Target('current-card');
			return target.satisfying(not(exhausted));
		}, 'targetIds'),
		exhaust(state) {
			const exhaustedCardIds: CardId[] = [];
			const modifiedGame = state.game.mutate((game) => {
				for (const cardId of state.targetIds ?? []) {
					const card = game.requireCard(cardId);
					if (card.exhausted) {
						continue;
					}
					card.exhausted = true;
					exhaustedCardIds.push(card.id);
				}
			});
			return { ...state, game: modifiedGame, exhaustedCardIds };
		}
	}
});
