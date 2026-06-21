import type { RedrawFocusEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type RedrawFocusEffectState = EffectProcedureState<RedrawFocusEffect>;

const { define } = instructions<RedrawFocusEffectState>();

export const redrawFocusEffectProc = define({
	id: ProcedureId.RedrawFocusEffect,
	steps: {
		compute: (state) => state
	}
});
