import { finalise } from '@songsofdoom/common';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring an ExhaustEffect.
 */
export interface ExhaustEffectProps {
	/** The target to exhaust. Defaults to the card's default target if not specified. */
	target?: TargetSpec;
}

/**
 * An effect that exhausts the target.
 */
export class ExhaustEffect extends Effect {
	/** The target to exhaust. */
	readonly target?: Target;

	constructor({ target }: ExhaustEffectProps) {
		super();
		this.target = finalise(Target, target);
	}
}

/** Singleton instance for exhausting the default target. */
export const exhaust = new ExhaustEffect({});
