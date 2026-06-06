import { finalise } from '@songsofdoom/common';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a SaveTargetToVariableEffect.
 */
export interface SaveTargetToVariableEffectProps {
	/** The name of the variable to save the selected target(s) into. */
	name: string;

	/** The target specification describing which target(s) to select and save. */
	value: TargetSpec;
}

/**
 * An effect that selects target(s) and saves them to a named variable for later
 * reference in other effects or capabilities.
 */
export class SaveTargetToVariableEffect extends Effect {
	/** The name of the variable to save the selected target(s) into. */
	readonly name: string;

	/** The target to select and save. */
	readonly value: Target;

	constructor({ name, value }: SaveTargetToVariableEffectProps) {
		super();
		this.name = name;
		this.value = finalise(Target, value);
	}
}

/** Creates a save-target-to-variable effect. */
export const saveTargetToVariable = (
	props: SaveTargetToVariableEffectProps
): SaveTargetToVariableEffect => new SaveTargetToVariableEffect(props);
