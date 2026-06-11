import type { AttachEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { CardId, EntityId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface AttachEffectProcedureState extends EffectProcedureState<AttachEffect> {
	/**
	 * The ID of the target to attach to.
	 */
	targetId: EntityId;

	/**
	 * The ID of the card being attached.
	 */
	attachmentId?: CardId;
}

const { define, requireSingleTarget } = instructions<AttachEffectProcedureState>();

export const attachEffectProc = define({
	id: ProcedureId.AttachEffect,
	steps: {
		selectTarget: requireSingleTarget(({ effect }) => effect.target || 'active-player', 'targetId'),
		mutate(state) {
			const attachmentId = state.game.requireCurrentCard().id;
			const modifiedGameState = state.game.mutate((game) => {
				const target = game.requireEntityState(state.targetId);
				const attachment = game.requireCard(attachmentId);
				target.addAttachment(game, attachment);
			});
			return {
				...state,
				attachmentId,
				game: modifiedGameState
			};
		}
	}
});
