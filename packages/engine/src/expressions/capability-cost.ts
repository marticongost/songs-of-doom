import { ActualCapabilityCost, CapabilityCost } from '@songsofdoom/game';
import type { GameState } from '../state/gamestate';
import { evaluate } from './evaluate';

evaluate.implementFor(
	CapabilityCost,
	(cost: CapabilityCost, state: GameState): ActualCapabilityCost => {
		return new ActualCapabilityCost({
			strength: state.evaluate(cost.strength),
			agility: state.evaluate(cost.agility),
			intelligence: state.evaluate(cost.intelligence),
			charisma: state.evaluate(cost.charisma),
			will: state.evaluate(cost.will),
			heroism: state.evaluate(cost.heroism),
			any: state.evaluate(cost.any),
			health: state.evaluate(cost.health),
			sanity: state.evaluate(cost.sanity),
			gold: state.evaluate(cost.gold),
			charges: state.evaluate(cost.charges),
			cardTransition: cost.cardTransition
		});
	}
);
