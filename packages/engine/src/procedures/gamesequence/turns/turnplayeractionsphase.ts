import type { Action } from '@songsofdoom/game';
import { CapabilityChoiceField, EntityField } from '../../../core/input';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import type { CapabilityRef } from '../../../state/cardstate';
import type { AllyId, EntityId, PlayerId } from '../../../state/identifiers';
import { triggerCapability } from '../../core/triggercapability';

export interface TurnPlayerActionsPhaseState extends ProcedureState {
	/**
	 * The ID of the actor (player or ally) currently choosing an action.
	 */
	actorId?: PlayerId | AllyId;

	/**
	 * The actions chosen by each actor during this phase.
	 */
	actorActions?: Record<EntityId, CapabilityRef<Action> | undefined>;
}

const { define, dispatch, input, call } = instructions<TurnPlayerActionsPhaseState>();

/**
 * T1 — Player and ally actions phase.
 *
 * Loops while there are non-activated, non-exhausted players or allies with available
 * actions. Players choose an action from any eligible actor, or pass. The chosen action
 * executes immediately.
 */
export const turnPlayerActionsPhase = define({
	id: ProcedureId.TurnPlayerActionsPhase,
	steps: {
		askPlayersToChooseActor: dispatch((state) => {
			const { game } = state;
			const remainingActors = [
				...game.players,
				...game.cards({ type: 'ally', ready: true })
			].filter((actor) => !actor.activated);

			if (!remainingActors.length) {
				return (state: TurnPlayerActionsPhaseState) => ({ ...state, status: 'complete' });
			}

			return input({
				fields: [
					new EntityField<EntityId>({
						name: 'actorId',
						entities: remainingActors.map((actor) => actor.id as EntityId)
					})
				],
				// The first player is in charge of choosing turn order
				playerId: game.players[0].id
			});
		}),
		chooseAction: dispatch((state) => {
			const { game, actorId } = state;
			const actor = game.requireEntityState(actorId!);
			const availableActions = actor.getAvailableActions(game);
			const prioritaryActions = availableActions.filter((ref) => ref.capability.prioritary);
			const choices = prioritaryActions.length > 0 ? prioritaryActions : availableActions;
			const modifiedGameState = game.mutate((gameState) => {
				gameState.requireEntityState(actorId!).activated = true;
			});

			// No actions available - mark actor as activated and loop back to choosing the
			// next actor
			if (!choices.length) {
				return {
					...state,
					step: 'askPlayersToChooseActor',
					game: modifiedGameState,
					actorActions: {
						...state.actorActions,
						[actorId!]: undefined
					}
				};
			}

			// 1+ actions available: ask the actor's player to choose, or pass
			return input({
				fields: [
					new CapabilityChoiceField({
						name: 'action',
						choices: new Set(choices),
						required: false // Allow players to pass (choose no action)
					})
				],
				playerId: actor.playerId,
				then: (state, inputs) => ({
					...state,
					step: inputs.action === undefined ? 'askPlayersToChooseActor' : 'executeAction',
					game: modifiedGameState,
					actorActions: { ...state.actorActions, [actorId!]: inputs.action }
				})
			});
		}),
		executeAction: call(
			triggerCapability,
			(state) => ({
				subjectId: state.actorId!,
				...state.actorActions?.[state.actorId!]
			}),
			(state) => ({ ...state, step: 'askPlayersToChooseActor' })
		)
	}
});
