import type { GameGraph } from '../game/gamegraph';
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

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/** Creates a talent effect. */
export const talent = (talentsOrProps: Talent[] | TalentEffectProps): TalentEffect =>
	new TalentEffect(Array.isArray(talentsOrProps) ? { talents: talentsOrProps } : talentsOrProps);
