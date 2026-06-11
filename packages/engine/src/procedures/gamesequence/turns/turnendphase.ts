import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';

export interface TurnEndPhaseState extends ProcedureState {}

const { define, emitEvent } = instructions<TurnEndPhaseState>();

export const turnEndPhase = define({
	id: ProcedureId.TurnEndPhase,
	steps: {
		emitTurnEndEvent: emitEvent({ eventType: 'turnEnd' })
	}
});
