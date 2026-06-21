import type { LooseGoldEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type LooseGoldEffectState = EffectProcedureState<LooseGoldEffect>;

const { define } = instructions<LooseGoldEffectState>();

export const looseGoldEffectProc = define({
	id: ProcedureId.LooseGoldEffect,
	steps: {
		compute: (state) => state
	}
});
