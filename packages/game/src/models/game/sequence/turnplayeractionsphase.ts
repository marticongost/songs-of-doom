import { Action } from '../../capabilities';
import { activated, and, exhausted, not } from '../../expressions/boolean';
import { Target } from '../../target';
import type { GameGraph } from '../gamegraph';
import { TurnPhaseNode } from '../gamenodes';
import { type EntityId } from '../identifiers';
import { CapabilityChoiceField } from '../playerinput';

/**
 * T1 — Player and ally actions phase.
 *
 * Loops while there are non-activated, non-exhausted players or allies with available
 * actions. Players choose an action from any eligible actor, or pass. The chosen action
 * executes immediately.
 *
 * Returns true if at least one non-pass action was taken.
 */
export const runPlayerActionsPhase = async (gameGraph: GameGraph): Promise<boolean> => {
	return await gameGraph.group(TurnPhaseNode, { phase: 'player-actions' }, {}, async () => {
		let anyNonPassAction = false;

		while (true) {
			// Choose which actor will perform an action (player or ally)
			const actorId = await chooseActor(gameGraph);
			if (actorId === undefined) {
				break;
			}
			const actor = gameGraph.current.state.requireEntityState(actorId);

			// Find available actions; give precedence to prioritary ones
			const availableActions = actor.getAvailableActions(gameGraph.current.state);
			const prioritaryActions = availableActions.filter((ref) => ref.capability.prioritary);
			const choices = prioritaryActions.length > 0 ? prioritaryActions : availableActions;

			// Choose which action to perform (or pass)
			const { action } = await gameGraph.requestInput(
				[
					new CapabilityChoiceField({
						name: 'action',
						choices: new Set(choices),
						required: false
					})
				] as const,
				{ playerId: actor.playerId }
			);

			// If a player chooses no capability, treat it as passing — break out of the loop
			if (action === undefined || !(action.capability instanceof Action)) {
				break;
			}

			// Execute the action immediately
			await action.capability.trigger({
				gameGraph,
				subjectId: action.cardId,
				cardId: action.cardId
			});

			// Mark the actor as activated
			await gameGraph.mutate((state) => {
				const actor = state.requireEntityState(action.cardId as EntityId);
				actor.activated = true;
			});

			anyNonPassAction = true;
		}

		return anyNonPassAction;
	});
};

const chooseActor = (gameGraph: GameGraph): Promise<EntityId | undefined> => {
	const decidingPlayer = gameGraph.current.state.players[0]; // The first player is in charge of choosing turn order
	return gameGraph.requestSingleTarget(
		new Target({ type: ['player', 'ally'], condition: and(not(activated), not(exhausted)) }),
		{
			playerId: decidingPlayer.id
		}
	);
};
