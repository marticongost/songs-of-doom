import { Effect } from './effect';

export interface ModifyConcentrationEffectProps {
	modifier: number;
}

/**
 * An effect that modifies the *concentration* available to a character, which is used
 * to determine how many focus tokens they can retain when the turn ends.
 */
export class ModifyConcentrationEffect extends Effect {
	readonly modifier: number;

	constructor({ modifier }: ModifyConcentrationEffectProps) {
		super();
		this.modifier = modifier;
	}

	override setConcentration(currentValue: number): number {
		return currentValue + this.modifier;
	}
}

/** Creates a modify concentration effect. */
export const modifyConcentration = (modifier: number): ModifyConcentrationEffect =>
	new ModifyConcentrationEffect({ modifier });
