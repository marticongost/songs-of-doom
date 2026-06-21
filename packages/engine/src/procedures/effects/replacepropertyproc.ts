import type { ReplacePropertyEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ReplacePropertyEffectState = EffectProcedureState<ReplacePropertyEffect>;

const { define } = instructions<ReplacePropertyEffectState>();

export const replacePropertyEffectProc = define({
	id: ProcedureId.ReplacePropertyEffect,
	steps: {
		compute: (state) => state
	}
});
