import type { WoundEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type WoundEffectState = EffectProcedureState<WoundEffect>;

const { define } = instructions<WoundEffectState>();

export const woundEffectProc = define({
	id: ProcedureId.WoundEffect,
	steps: {
		compute: (state) => state
	}
});
