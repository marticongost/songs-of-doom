import type { Target } from '@songsofdoom/game';
import { TargetField } from '../../core/input';
import { instructions } from '../../core/instructions';
import { ProcedureId, type ProcedureState } from '../../core/procedure';
import type { EntityId } from '../../state/identifiers';

export interface ResolveTargetState extends ProcedureState {
	/** The target being resolved. */
	target: Target;

	/** The resolved target(s). */
	resolvedTargetIds?: EntityId[];
}

const { define, dispatch, input } = instructions<ResolveTargetState>();

export const resolveTarget = define({
	id: ProcedureId.ResolveTarget,
	steps: {
		resolve: dispatch((state) =>
			state.target.selection === 'player-chosen'
				? input({
						fields: [
							new TargetField({
								name: 'resolvedTargetIds',
								target: state.target
							})
						]
					})
				: state.game.resolveTarget(state.target)
		)
	}
});
