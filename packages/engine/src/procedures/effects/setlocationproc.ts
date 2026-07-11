import type { SetLocationEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import { moveCardToLocation, type MutableCardLike } from '../../state/entitystatemutation';
import { isPlayerId, type EntityId, type LocationId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface SetLocationEffectState extends EffectProcedureState<SetLocationEffect> {
	/** The IDs of the targets to move. */
	targetIds?: EntityId[];

	/** The current entity being moved in the forEach loop. */
	currentEntityId?: EntityId;

	/** The resolved destination location ID. */
	destinationId?: LocationId;

	/** Map of entity ID -> location ID for recording movement outcomes. */
	movements?: Map<EntityId, LocationId>;
}

const { define, forEach, requireSingleTarget, emitEvent, resolveTargetList, dispatch } =
	instructions<SetLocationEffectState>();

export const setLocationEffectProc = define({
	id: ProcedureId.SetLocationEffect,
	defaults: {
		movements: new Map()
	},
	steps: {
		resolveTargets: resolveTargetList(
			({ effect }) => effect.target || 'current-subject',
			'targetIds'
		),
		moveTargets: forEach({
			name: 'currentEntityId',
			items: (state) => state.targetIds ?? [],
			boundContext: 'subjectId',
			steps: {
				resolveDestination: requireSingleTarget(
					({ effect }) => effect.destination,
					'destinationId'
				),
				emitLeaving: dispatch((state) => {
					const entityId = state.currentEntityId!;
					if (!isPlayerId(entityId)) return state;

					const currentLocation = state.game.getEntityLocation(entityId);
					if (!currentLocation) return state;

					return emitEvent({
						eventType: 'leavingLocation',
						eventContext: { targetId: currentLocation.id }
					});
				}),
				applyMove(state: SetLocationEffectState) {
					const entityId = state.currentEntityId!;
					const destinationId = state.destinationId!;

					const modifiedGame = state.game.mutate((game) => {
						if (isPlayerId(entityId)) {
							game.setActorLocation(entityId, destinationId);
						} else {
							const card = game.requireCard(entityId) as unknown as MutableCardLike;
							moveCardToLocation(card, game, destinationId);
						}
					});

					const movements = new Map(state.movements!);
					movements.set(entityId, destinationId);
					return { ...state, game: modifiedGame, movements };
				},
				emitEntering: dispatch((state) => {
					const entityId = state.currentEntityId!;
					if (!isPlayerId(entityId)) return state;

					return emitEvent({
						eventType: 'locationEntered',
						eventContext: {
							subjectId: state.currentEntityId,
							targetId: state.destinationId
						}
					});
				})
			}
		})
	}
});
