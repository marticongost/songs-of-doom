import type { TestEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type TestEffectState = EffectProcedureState<TestEffect>;

const { define } = instructions<TestEffectState>();

export const testEffectProc = define({
	id: ProcedureId.TestEffect,
	steps: {
		compute: (state) => state
	}
});
