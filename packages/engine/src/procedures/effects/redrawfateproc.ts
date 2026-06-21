import type { RedrawFateEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type RedrawFateEffectState = EffectProcedureState<RedrawFateEffect>;

const { define } = instructions<RedrawFateEffectState>();

export const redrawFateEffectProc = define({
	id: ProcedureId.RedrawFateEffect,
	steps: {
		compute: (state) => state
	}
});
