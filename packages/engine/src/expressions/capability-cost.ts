import { ActualCapabilityCost, CapabilityCost } from '@songsofdoom/game';
import type { GameState } from '../state/gamestate';
import { evaluate } from './evaluate';

evaluate.implementFor(
	CapabilityCost,
	function (this: CapabilityCost, state: GameState): ActualCapabilityCost {
		return new ActualCapabilityCost({
			strength: state.evaluate(this.strength),
			agility: state.evaluate(this.agility),
			intelligence: state.evaluate(this.intelligence),
			charisma: state.evaluate(this.charisma),
			will: state.evaluate(this.will),
			heroism: state.evaluate(this.heroism),
			any: state.evaluate(this.any),
			health: state.evaluate(this.health),
			sanity: state.evaluate(this.sanity),
			gold: state.evaluate(this.gold),
			charges: state.evaluate(this.charges),
			cardTransition: this.cardTransition
		});
	}
);
