import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';
import type { GameGraph } from './game/gamegraph';
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

	async trigger({ gameGraph, cardId }: TriggerCapabilityProps) {
		gameGraph.capabilityTriggered(this, cardId, (state) => {
			state.activeCardStack.push(cardId);
			state.implicitTargetStack.push(cardId);
			state.implicitSubjectStack.push(cardId);
		});
		await gameGraph.group(async () => {
			for (const effect of this.effects) {
				await effect.trigger(gameGraph);
			}
			gameGraph.capabilityFinished(this, cardId, (state) => {
				const card = state.requireActiveCard();
				if (card.container.type === 'hand') {
					card.moveToTopOfDiscardPile(state);
				}
				state.activeCardStack.pop();
				state.implicitTargetStack.pop();
				state.implicitSubjectStack.pop();
			});
		});
	}
}
