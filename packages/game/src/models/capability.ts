import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';
import type { GameGraph, GroupContext } from './game/gamegraph';
import { CapabilityTriggered } from './game/gamenodes';
import type { CardId } from './game/identifiers';

export interface CapabilityProps {
	cost?: CapabilityCost | CapabilityCostProps;
	effects: Array<Effect>;
}

export interface TriggerCapabilityProps {
	gameGraph: GameGraph;
	cardId: CardId;
}

export abstract class Capability {
	readonly cost: CapabilityCost;
	readonly effects: Array<Effect>;

	constructor({ cost, effects }: CapabilityProps) {
		this.cost = finalise(CapabilityCost, cost ?? {});
		this.effects = effects;
	}

	constantEffects(): Array<Effect> {
		return [];
	}

	protected getTriggerContext(_gameGraph: GameGraph, cardId: CardId): Partial<GroupContext> {
		return { activeCardId: cardId };
	}

	async trigger({ gameGraph, cardId }: TriggerCapabilityProps) {
		await gameGraph.group(
			CapabilityTriggered,
			{ capability: this, cardId },
			{
				...this.getTriggerContext(gameGraph, cardId),
				targetId: cardId,
				subjectId: cardId,
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
