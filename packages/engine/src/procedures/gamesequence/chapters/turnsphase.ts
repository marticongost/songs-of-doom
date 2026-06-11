import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import { turn } from '../turns/turn';

export type TurnsPhaseStepId = 'executeTurn' | 'checkLoop';

export interface TurnsPhaseState extends ProcedureState {}

const { define, call } = instructions<TurnsPhaseState>();

/**
 * C3 — Turns phase.
 * Runs turns in a loop until no entity performs an action.
 */
export const turnsPhase = define({
	id: ProcedureId.TurnsPhase,
	steps: {
		turn: call(turn, {}, (chapterState, turnState) => ({
			...chapterState,
			step: turnState.atLeastOneActivation ? 'turn' : undefined
		}))
	}
});
