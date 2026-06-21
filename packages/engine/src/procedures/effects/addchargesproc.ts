import type { AddChargesEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type AddChargesEffectState = EffectProcedureState<AddChargesEffect>;

const { define } = instructions<AddChargesEffectState>();

export const addChargesEffectProc = define({
	id: ProcedureId.AddChargesEffect,
	steps: {
		compute: (state) => state
	}
});
