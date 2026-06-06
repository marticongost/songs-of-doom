import { instructions } from '../../../core/instructions';
import { ProcedureId, type ProcedureState } from '../../../core/procedure';

export interface TurnEndPhaseState extends ProcedureState {}

const { define, emitEvent } = instructions<TurnEndPhaseState>();

export const turnEndPhase = define({
	id: ProcedureId.TurnEndPhase,
	steps: {
		emitTurnEndEvent: emitEvent({ eventType: 'turnEnd' })
	}
});
