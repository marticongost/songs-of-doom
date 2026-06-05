import { Action } from '../../capabilities/action';
import type { Capability } from '../../capability';
import { activated, and, exhausted, not } from '../../expressions/boolean';
import { Target } from '../../target';
import type { CapabilityRef, ReadonlyCardState } from '../cardstate';
import type { GameGraph } from '../gamegraph';
import { TurnPhaseNode } from '../gamenodes';
import type { ReadonlyGameState } from '../gamestate';
import type { CreatureId } from '../identifiers';

export const runCreatureActionsPhase = async (gameGraph: GameGraph): Promise<boolean> => {
	return await gameGraph.group(TurnPhaseNode, { phase: 'creature-actions' }, {}, async () => {
		let anyNonPassAction = false;

		while (true) {
			const state = gameGraph.current.state;

			// Players select which creature to activate
			const { target } = await gameGraph.requestInput(
				new Target({ type: 'enemy', condition: and(not(activated), not(exhausted)) })
			);

			const creatureId = target[0] as CreatureId | undefined;
			if (creatureId === undefined) break;

			// Auto-select the creature's action
			const chosen = chooseEnemyAction(state, creatureId);

			if (chosen !== undefined) {
				await chosen.capability.trigger({
					gameGraph,
					subjectId: creatureId,
					cardId: chosen.cardId
				});
				anyNonPassAction = true;
			}
			// In either case (action or pass), mark the creature as activated

			await gameGraph.mutate((state) => {
				const mutableCreature = state.requireCard(creatureId);
				mutableCreature.activated = true;
			});
		}

		return anyNonPassAction;
	});
};

/**
 * Chooses the action a creature will take this turn.
 *
 * The function iterates through the creature's capabilities (own card first, then
 * attachments recursively), respecting prioritary ordering. An action is eligible if:
 * - The creature can pay its cost (no capability impediment),
 * - At least one effect in the action is condition-free or has satisfiable conditions.
 *
 * Returns the first eligible action found, or undefined if none qualify.
 */
export function chooseEnemyAction(
	state: ReadonlyGameState,
	enemyId: CreatureId
): CapabilityRef<Action> | undefined {
	const enemyCard = state.requireCard(enemyId);

	const findAction = (
		cardState: ReadonlyCardState,
		getCardCapabilities: (cardState: ReadonlyCardState) => Array<Capability>
	): CapabilityRef<Action> | undefined => {
		let chosenCapability: CapabilityRef<Action> | undefined = undefined;
		for (const capability of getCardCapabilities(cardState)) {
			if (
				capability instanceof Action &&
				!state.getCapabilityImpediment(capability, cardState.id, enemyId)
			) {
				const potentialCapability = { capability, cardId: cardState.id };
				if (capability.prioritary) {
					return potentialCapability;
				} else if (!chosenCapability) {
					chosenCapability = potentialCapability;
				}
			}
		}
		for (const attachment of cardState.attachments) {
			const attachmentCapability = findAction(
				attachment,
				(attachmentState) => attachmentState.card.attachmentCapabilities
			);
			if (attachmentCapability?.capability.prioritary) {
				return attachmentCapability;
			} else if (!chosenCapability) {
				chosenCapability = attachmentCapability;
			}
		}
		return chosenCapability;
	};

	return findAction(enemyCard, (cardState) => cardState.card.capabilities);
}
