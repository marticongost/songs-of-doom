import { finalise } from '@songsofdoom/common';
import { CapabilityCost, type CapabilityCostProps } from './capabilitycost';
import type { Effect } from './effects/effect';
import { CapabilityFinished, CapabilityTriggered, type GameGraph } from './game/gamegraph';

export interface CapabilityProps {
	cost?: CapabilityCost | CapabilityCostProps;
	effects: Array<Effect>;
}

export interface TriggerCapabilityProps {
	gameGraph: GameGraph;
	cardId: number;
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
		gameGraph.add(CapabilityTriggered, {
			state: gameGraph.current.state.mutate((state) => state.activeCardStack.push(cardId)),
			capability: this,
			cardId
		});
		gameGraph.group(async () => {
			for (const effect of this.effects) {
				await effect.trigger(gameGraph);
			}
			gameGraph.add(CapabilityFinished, {
				state: gameGraph.current.state.mutate((state) => {
					const card = state.requireActiveCard();
					if (card.location.container === 'hand') {
						card.moveToTopOfDiscardPile(state);
					}
					state.activeCardStack.pop();
				}),
				capability: this,
				cardId
			});
		});
	}
}
