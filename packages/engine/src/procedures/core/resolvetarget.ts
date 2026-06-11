import type { Target } from '@songsofdoom/game';
import { TargetField } from '../../core/input';
import { instructions } from '../../core/instructions';
import { type ProcedureState } from '../../core/procedure';
import { ProcedureId } from '../../core/procedureid';
import type { EntityId, PlayerId } from '../../state/identifiers';

export interface ResolveTargetState extends ProcedureState {
	/** The target being resolved. */
	target: Target;

	/**
	 * The player to ask for input, if the target requires player choice. Defaults to the
	 * active player.
	 */
	playerId?: PlayerId;

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
						playerId: state.playerId,
						fields: [
							new TargetField({
								name: 'resolvedTargetIds',
								target: state.target
							})
						]
					})
				: () => state.game.resolveTarget(state.target)
		)
	}
});
