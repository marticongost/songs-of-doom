import type { AttackEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type AttackEffectState = EffectProcedureState<AttackEffect>;

const { define } = instructions<AttackEffectState>();

export const attackEffectProc = define({
	id: ProcedureId.AttackEffect,
	steps: {
		compute: (state) => state
	}
});
