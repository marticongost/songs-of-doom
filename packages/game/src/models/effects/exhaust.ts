import { finalise } from '@songsofdoom/common';
import { Target, type CardTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring an ExhaustEffect.
 */
export interface ExhaustEffectProps {
	/** The target to exhaust. Defaults to the card's default target if not specified. */
	target?: TargetSpec<CardTargetType>;
}

/**
 * An effect that exhausts the target.
 */
export class ExhaustEffect extends Effect {
	/** The target to exhaust. */
	readonly target?: Target<CardTargetType>;

	constructor({ target }: ExhaustEffectProps) {
		super();
		this.target = finalise(Target, target);
	}
}

/** Creates an effect that exhausts a target. */
export const exhaust = (props: ExhaustEffectProps = {}): ExhaustEffect => new ExhaustEffect(props);
