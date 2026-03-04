import type { Talent } from '../talent';
import { Effect } from './effect';

/**
 * Props for configuring a TalentEffect.
 */
export interface TalentEffectProps {
	/** The talent possessed by the character. */
	talent: Talent;
}

/**
 * An effect that indicates the character possesses a particular talent.
 */
export class TalentEffect extends Effect {
	/** The talent possessed by the character. */
	readonly talent: Talent;

	constructor({ talent }: TalentEffectProps) {
		super();
		this.talent = talent;
	}
}
