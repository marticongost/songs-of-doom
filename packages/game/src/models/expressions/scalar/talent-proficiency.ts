import type { GameState } from '../../game/gamestate';
import type { Stat } from '../../stats';
import type { Talent } from '../../talent';
import { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

/**
 * The penalty applied to proficiency checks when the character lacks the required talent.
 */
export const TALENT_PROFICIENCY_PENALTY = -2;

/**
 * Props for creating a TalentProficiencyExpression.
 */
export interface TalentProficiencyExpressionProps {
	/** The talent required for full proficiency. */
	talent: Talent;
	/**
	 * An optional modifier applied to the base stat. Defaults to 0.
	 * Characters with the talent roll `stat + modifier`;
	 * those without it roll `stat + modifier + TALENT_PROFICIENCY_PENALTY`.
	 */
	modifier?: ScalarExpressionType;
}

/**
 * A scalar expression representing a talent proficiency check.
 * Characters possessing the required talent use their base stat (plus any modifier),
 * while those lacking it suffer an additional {@link TALENT_PROFICIENCY_PENALTY}.
 *
 * @example
 * // Lockpicking check with no modifier
 * talentProficiency(lockpicking)
 *
 * @example
 * // Lockpicking check with a +2 bonus
 * talentProficiency(lockpicking, 2)
 */
export class TalentProficiencyExpression extends ScalarExpression {
	/** The talent required for full proficiency. */
	readonly talent: Talent;
	/** The modifier applied to the base stat for proficient characters. */
	readonly modifier: ScalarExpressionType;

	constructor({ talent, modifier = 0 }: TalentProficiencyExpressionProps) {
		super();
		this.talent = talent;
		this.modifier = modifier;
	}

	get stat(): Stat {
		if (!this.talent.stat) {
			throw new Error(`Talent ${this.talent.id} does not have an associated stat`);
		}
		return this.talent.stat;
	}

	override evaluate(_state: GameState): number {
		// TODO
		return 0;
	}
}

/**
 * Creates a {@link TalentProficiencyExpression} for the given talent and optional modifier.
 *
 * @param talent - The talent required for full proficiency.
 * @param modifier - An optional modifier applied to the base stat. Defaults to 0.
 *
 * @example
 * talentProficiency(lockpicking)
 * talentProficiency(lockpicking, 2)
 */
export function talentProficiency(
	talent: Talent,
	modifier?: ScalarExpressionType
): TalentProficiencyExpression {
	return new TalentProficiencyExpression({ talent, modifier });
}
