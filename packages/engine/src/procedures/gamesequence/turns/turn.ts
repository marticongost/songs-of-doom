import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import { turnCreatureActionsPhase } from './turncreatureactionsphase';
import { turnPlayerActionsPhase } from './turnplayeractionsphase';
import { turnStartPhase } from './turnstartphase';

export interface TurnState extends ProcedureState {
	atLeastOneActivation?: boolean;
}

const { define, call } = instructions<TurnState>();

export const turn = define({
	id: ProcedureId.Turn,
	defaults: () => ({
		atLeastOneActivation: false
	}),
	steps: {
		turnStartPhase,
		turnPlayerActionsPhase: call(turnPlayerActionsPhase, {}, (turnState, phaseState) => ({
			...turnState,
			atLeastOneActivation:
				turnState.atLeastOneActivation ||
				(!!phaseState.actorActions &&
					Object.values(phaseState.actorActions).some((action) => action !== undefined))
		})),
		turnCreatureActionsPhase: call(turnCreatureActionsPhase, {}, (turnState, phaseState) => ({
			...turnState,
			atLeastOneActivation:
				turnState.atLeastOneActivation ||
				(!!phaseState.creatureActions &&
					Object.values(phaseState.creatureActions).some((action) => action !== undefined))
		}))
	}
});
