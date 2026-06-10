import type { Capability } from '@songsofdoom/game';
import { Action } from '@songsofdoom/game';
import { EntityField } from '../../../core/input';
import { instructions } from '../../../core/instructions';
import { ProcedureId, type ProcedureState } from '../../../core/procedure';
import type { CapabilityRef, ReadonlyCardState } from '../../../state/cardstate';
import type { ReadonlyGameState } from '../../../state/gamestate';
import type { CreatureId } from '../../../state/identifiers';
import { triggerCapability } from '../../core/triggercapability';

export interface TurnCreatureActionsPhaseState extends ProcedureState {
	/** The ID of the creature currently taking its action. */
	creatureId?: CreatureId;

	/** The action that the active creature has chosen. */
	creatureActions?: Record<CreatureId, CapabilityRef<Action> | undefined>;
}

const { define, dispatch, input, call } = instructions<TurnCreatureActionsPhaseState>();

export const turnCreatureActionsPhase = define({
	id: ProcedureId.TurnCreatureActionsPhase,
	steps: {
		askPlayersToChooseCreature: dispatch((state) => {
			const remainingCreatures = state.game
				.cards({ type: 'creature', ready: true })
				.filter((creature) => !creature.exhausted && !creature.activated);
			if (remainingCreatures.length === 0) {
				return (state: TurnCreatureActionsPhaseState) => ({ ...state, status: 'complete' });
			}
			return input({
				fields: [
					new EntityField<CreatureId>({
						name: 'creatureId',
						entities: remainingCreatures.map((creature) => creature.id as CreatureId)
					})
				]
			});
		}),
		chooseCreatureAction(state) {
			const { game, creatureId } = state;
			const chosenAction = chooseEnemyAction(game, creatureId!);
			return {
				...state,
				step: chosenAction ? 'executeCreatureAction' : 'askPlayersToChooseCreature',
				game: game.mutate((gameState) => {
					const mutableCreature = gameState.requireCard(creatureId!);
					mutableCreature.activated = true;
				}),
				creatureActions: {
					...state.creatureActions,
					[creatureId!]: chosenAction
				}
			};
		},
		executeCreatureAction: call(
			triggerCapability,
			(state) => ({
				subjectId: state.creatureId,
				...state.creatureActions?.[state.creatureId!]
			}),
			(state) => ({ ...state, step: 'askPlayersToChooseCreature' })
		)
	}
});

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
