import { Action } from '../capabilities/action';
import type { Capability } from '../capability';
import type { CapabilityRef, ReadonlyCardState } from './cardstate';
import type { ReadonlyGameState } from './gamestate';
import { type CreatureId } from './identifiers';

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
