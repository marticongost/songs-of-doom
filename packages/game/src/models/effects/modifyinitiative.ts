import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

export interface ModifyInitiativeEffectProps {
	modifier: number;
}

/**
 * An effect that modifies the initiative of a character, which is used to determine
 * turn order.
 */
export class ModifyInitiativeEffect extends Effect {
	readonly modifier: number;

	constructor({ modifier }: ModifyInitiativeEffectProps) {
		super();
		this.modifier = modifier;
	}

	override setInitiative(currentValue: number): number {
		return currentValue + this.modifier;
	}

	override async apply(_gameGraph: GameGraph) {
		// Passive — read at T1 by calculateInitiative(), not applied through the effect pipeline.
	}
}

/** Creates a modify initiative effect. */
export const modifyInitiative = (modifier: number): ModifyInitiativeEffect =>
	new ModifyInitiativeEffect({ modifier });
