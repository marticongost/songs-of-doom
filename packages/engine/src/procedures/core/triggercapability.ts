import type { Capability, Effect, Reaction } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { type ProcedureState, ProcedureId } from '../../core/procedure';
import { MutableCapabilityResolution } from '../../state/capabilityresolution';
import type { ActorId, CardId } from '../../state/identifiers';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

export type TriggerCapabilityStepId = 'init' | 'triggerEffects' | 'finalise';

export interface TriggerCapabilityState extends ProcedureState {
	/**
	 * The capability being triggered.
	 *
	 * Only needed for the resolution stack — effect dispatch uses {@link effects}.
	 * Once `CapabilityResolution` is decoupled from `Capability`, this can be removed.
	 */
	capability: Capability;

	/** The card whose capability is being triggered. */
	cardId: CardId;

	/** Who is triggering the capability (player, ally, creature). */
	actorId: ActorId;

	/** Additional reactions injected by effects like {@link TriggerActionEffect}. */
	additionalReactions?: Array<Reaction>;

	/**
	 * The effect that is being processed.
	 * @defaultValue `0` — set internally by {@link triggerCapability.createState}.
	 */
	effect?: Effect;
}

const { define, forEach, triggerEffect } = instructions<TriggerCapabilityState>();

export const triggerCapability = define({
	id: ProcedureId.TriggerCapability,
	steps: {
		init(state) {
			const { game, capability, cardId, actorId, additionalReactions } = state;
			return {
				...state,
				game: game.mutate((gameState) => {
					gameState.pushContext({
						capabilityResolution: new MutableCapabilityResolution({
							capability,
							subjectId: actorId,
							cardId,
							additionalReactions
						}),
						subjectId: actorId,
						targetId: cardId
					});

					const card = gameState.requireCard(cardId);
					if (card.container.type === 'hand') {
						card.moveToStage(gameState, card.container.playerId);
					}
				})
			};
		},
		triggerEffects: forEach({
			name: 'effect',
			items: ({ capability }) => capability.effects,
			steps: {
				triggerEffect: triggerEffect({ effect: (state) => state.effect! })
			}
		}),
		finalise(state) {
			return {
				...state,
				status: 'complete',
				game: state.game.mutate((mutable) => {
					const card = mutable.requireCard(state.cardId);
					if (card.container.type === 'stage') {
						card.moveToTopOfDiscardPile(mutable, card.container.playerId);
					}

					mutable.popContext({
						capabilityResolution: new MutableCapabilityResolution({
							capability: state.capability,
							subjectId: state.actorId,
							cardId: state.cardId
						}),
						subjectId: state.actorId,
						targetId: state.cardId
					});
				})
			};
		}
	}
});
