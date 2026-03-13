/** A numeric proficiency level (1 or higher). */
export type ProficiencyLevel = number;

/** A range of proficiency levels. */
export interface ProficiencyRange {
	/** The minimum level (inclusive). */
	min?: ProficiencyLevel;
	/** The maximum level (inclusive). */
	max?: ProficiencyLevel;
}

/** Selects a specific proficiency level or a range of levels. */
export type ProficiencySelector = ProficiencyLevel | ProficiencyRange;

/**
 * String shorthand for a proficiency selector:
 * - `"N"` — exact level N
 * - `"N+"` — level N and above
 * - `"N-M"` — levels N through M
 */
export type ProficiencyString = `${number}` | `${number}+` | `${number}-${number}`;

/** A proficiency selector or its string shorthand. */
export type ProficiencySpec = ProficiencySelector | ProficiencyString;

/**
 * Parses a proficiency string shorthand into a {@link ProficiencySelector}.
 */
export const parseProficiencyString = (str: ProficiencyString): ProficiencySelector => {
	if (/^\d+$/.test(str)) {
		return parseInt(str, 10);
	} else if (/^\d+\+$/.test(str)) {
		return { min: parseInt(str, 10) };
	} else if (/^\d+-\d+$/.test(str)) {
		const [, minStr, maxStr] = str.match(/^(\d+)-(\d+)$/)!;
		return { min: parseInt(minStr, 10), max: parseInt(maxStr, 10) };
	} else {
		throw new Error(`Invalid ProficiencyString: ${str}`);
	}
};

/**
 * Resolves a proficiency spec (selector or string shorthand) into a {@link ProficiencySelector}.
 */
export const resolveProficiencySpec = (spec: ProficiencySpec): ProficiencySelector =>
	typeof spec === 'string' ? parseProficiencyString(spec) : spec;
