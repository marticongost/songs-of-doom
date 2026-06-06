import { drawCards } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState, ProcedureId } from '../../../core/procedure';
import type { ReadonlyPlayerState } from '../../../state/playerstate';

export type DrawPhaseStepId = 'everyPlayer';

export interface DrawPhaseState extends ProcedureState {
	player?: ReadonlyPlayerState;
}

const { define, forEach, triggerEffect } = instructions<DrawPhaseState>();

/** C4 — Draw phase. Each non-defeated player draws 1 card. */
export const drawPhase = define({
	id: ProcedureId.DrawPhase,
	steps: {
		everyPlayer: forEach({
			name: 'player',
			items: (state) => state.game.players,
			where: (_state, player) => !player!.defeated,
			steps: {
				drawOne: triggerEffect({ effect: drawCards(1) })
			}
		})
	}
});
