import { Action } from '../capabilities/action';
import type { CapabilityRef } from './cardstate';
import type { PlannedAction } from './gamesequence';
import type { ReadonlyGameState } from './gamestate';
import { type CardId } from './identifiers';

/**
 * Chooses the action an enemy will take this turn.
 * Returns the chosen action with its calculated initiative, or undefined if the enemy passes.
 *
 * Selection rules:
 * - Collect Action capabilities from the enemy card and all attachments (in definition order).
 * - Check prioritary actions first, then non-prioritary.
 * - The first feasible action wins: cost is payable AND at least one effect is
 *   condition-free (or all conditions are met).
 */
export function chooseEnemyAction(
	state: ReadonlyGameState,
	enemyId: CardId
): PlannedAction | undefined {
	const enemyCard = state.requireCard(enemyId);
	const ownActions: CapabilityRef<Action>[] = enemyCard.card.capabilities
		.filter((c): c is Action => c instanceof Action)
		.map((capability) => ({ capability, cardId: enemyId }));
	const attachmentActions: CapabilityRef<Action>[] = enemyCard.attachments.flatMap((att) =>
		att.card.attachmentCapabilities
			.filter((c): c is Action => c instanceof Action)
			.map((capability) => ({ capability, cardId: att.id }))
	);
	const allActions = [...ownActions, ...attachmentActions];
	const prioritary = allActions.filter((a) => a.capability.prioritary);
	const normal = allActions.filter((a) => !a.capability.prioritary);

	for (const { capability, cardId } of [...prioritary, ...normal]) {
		if (capability.isFeasible(state, enemyId)) {
			return {
				cardId,
				action: capability,
				initiative: state.calculateInitiative(enemyId, capability)
			};
		}
	}
	return undefined;
}
