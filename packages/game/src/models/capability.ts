import { finalise } from '@songsofdoom/common';
import type { Reaction } from './capabilities';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';
import { MutableCapabilityResolution } from './game/capabilityresolution';
import type { GameGraph } from './game/gamegraph';
import { CapabilityTriggered } from './game/gamenodes';
import type { GameContext, ReadonlyGameState } from './game/gamestate';
import type { CardId, EntityId } from './game/identifiers';

export interface CapabilityProps {
	cost?: CapabilityCost | CapabilityCostProps;
	effects: Array<Effect>;
}

export interface TriggerCapabilityProps {
	gameGraph: GameGraph;
	subjectId: EntityId;
	cardId: CardId;
	context?: GameContext;
	additionalReactions?: Array<Reaction>;
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

	getTriggerContext(_state: ReadonlyGameState, _cardId: CardId): GameContext {
		return {};
	}

	async trigger({ gameGraph, subjectId, cardId, additionalReactions }: TriggerCapabilityProps) {
		await gameGraph.group(
			CapabilityTriggered,
			{ capability: this, cardId },
			{
				capabilityResolution: new MutableCapabilityResolution({
					capability: this,
					subjectId,
					cardId,
					additionalReactions
				}),
				targetId: cardId,
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
