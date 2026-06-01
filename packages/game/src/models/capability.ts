import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';
import type { GameGraph } from './game/gamegraph';
import { CapabilityTriggered } from './game/gamenodes';
import type { GameContext, ReadonlyGameState } from './game/gamestate';
import type { CardId } from './game/identifiers';

export interface CapabilityProps {
	cost?: CapabilityCost | CapabilityCostProps;
	effects: Array<Effect>;
}

export interface TriggerCapabilityProps {
	gameGraph: GameGraph;
	cardId: CardId;
	context?: GameContext;
}

export abstract class Capability {
	readonly cost: CapabilityCost;
	readonly effects: Array<Effect>;

	constructor({ cost, effects }: CapabilityProps) {
		this.cost = finalise(CapabilityCost, cost ?? {});
		this.effects = effects;
	}

	isFeasible(state: ReadonlyGameState, cardId: CardId): boolean {
		const card = state.requireCard(cardId);
		return this.cost.charges === 0 || card.charges >= this.cost.charges;
	}

	constantEffects(): Array<Effect> {
		return [];
	}

	getTriggerContext(_state: ReadonlyGameState, cardId: CardId): GameContext {
		return { activeCardId: cardId };
	}

	async trigger({ gameGraph, cardId, context }: TriggerCapabilityProps) {
		await gameGraph.group(
			CapabilityTriggered,
			{ capability: this, cardId },
			{
				currentCardId: cardId,
				targetId: cardId,
				subjectId: cardId,
				...this.getTriggerContext(gameGraph.current.state, cardId),
				...context,
				opening: (state) => {
					const card = state.requireCard(cardId);
					if (card.container.type === 'hand') {
						card.moveToStage(state, card.container.playerId);
					}
				},
				closure: (state) => {
					const card = state.requireCard(cardId);
					if (card.container.type === 'stage') {
						card.moveToTopOfDiscardPile(state, card.container.playerId);
					}
				}
			},
			async () => {
				for (const effect of this.effects) {
					await gameGraph.triggerEffect(effect);
				}
			}
		);
	}
}
