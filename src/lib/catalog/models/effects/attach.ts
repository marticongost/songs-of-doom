import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring an AttachEffect.
 */
export interface AttachEffectProps {
	/** The card to attach to. */
	target: Target | TargetProps;
}

/**
 * An effect that attaches the card to a target, conferring its capabilities
 * to that target for the duration.
 */
export class AttachEffect extends Effect {
	/** The card to attach to. */
	readonly target: Target;

	constructor({ target }: AttachEffectProps) {
		super();
		this.target = finalise(Target, target);
	}
}
