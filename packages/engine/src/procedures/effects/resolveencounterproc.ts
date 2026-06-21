import type { ResolveEncounterEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ResolveEncounterEffectState = EffectProcedureState<ResolveEncounterEffect>;

const { define } = instructions<ResolveEncounterEffectState>();

export const resolveEncounterEffectProc = define({
	id: ProcedureId.ResolveEncounterEffect,
	steps: {
		compute: (state) => state
	}
});
