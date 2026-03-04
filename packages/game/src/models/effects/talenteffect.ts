import type { Talent } from '../talent';
import { Effect } from './effect';

/**
 * Props for configuring a TalentEffect.
 */
export interface TalentEffectProps {
	/** The talent possessed by the character. */
	talents: Talent[];
}

/**
 * An effect that indicates the character possesses a particular talent.
 */
export class TalentEffect extends Effect {
	/** The talent possessed by the character. */
	readonly talents: Talent[];

	constructor({ talents }: TalentEffectProps) {
		super();
		this.talents = talents;
	}
}
