import { Effect } from './effect';

/**
 * Props for configuring a ReplaceEncounterEffect.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ReplaceEncounterEffectProps {}

/**
 * An effect that causes the player to discard the current encounter and draw a new one.
 */
export class ReplaceEncounterEffect extends Effect {
	constructor(_props: ReplaceEncounterEffectProps = {}) {
		super();
	}
}
