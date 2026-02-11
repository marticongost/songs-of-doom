import { Effect } from './effect';

/**
 * Props for configuring a DiscardEffect.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DiscardEffectProps {}

/**
 * An effect that discards the card triggering the effect.
 */
export class DiscardEffect extends Effect {
	constructor(_props?: DiscardEffectProps) {
		super();
	}
}
