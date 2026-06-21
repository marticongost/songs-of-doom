import type { ResultsTableEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ResultsTableEffectState = EffectProcedureState<ResultsTableEffect>;

const { define } = instructions<ResultsTableEffectState>();

export const resultsTableEffectProc = define({
	id: ProcedureId.ResultsTableEffect,
	steps: {
		compute: (state) => state
	}
});
