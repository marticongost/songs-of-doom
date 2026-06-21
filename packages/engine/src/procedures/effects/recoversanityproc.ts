import type { RecoverSanityEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type RecoverSanityEffectState = EffectProcedureState<RecoverSanityEffect>;

const { define } = instructions<RecoverSanityEffectState>();

export const recoverSanityEffectProc = define({
	id: ProcedureId.RecoverSanityEffect,
	steps: {
		compute: (state) => state
	}
});
