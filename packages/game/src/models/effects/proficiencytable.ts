import {
	resolveProficiencySpec,
	type ProficiencySelector,
	type ProficiencySpec,
	type ProficiencyString
} from '../proficiency';
import { Effect } from './effect';

export type ProficiencyTableEffectProps =
	| Partial<Record<ProficiencyString, Effect[]>>
	| { entries: ProficiencyTableEntryProps[] };

export interface ProficiencyTableEntryProps {
	/** The proficiency level or range that triggers these effects. */
	proficiency: ProficiencySpec;

	/** The effects to apply at this proficiency level. */
	effects: Effect[];
}

export interface ProficiencyTableEntry {
	/** The proficiency level or range that triggers these effects. */
	readonly proficiency: ProficiencySelector;
	/** The effects to apply at this proficiency level. */
	readonly effects: Effect[];
}

const proficiencyMinLevel = (selector: ProficiencySelector): number => {
	if (typeof selector === 'number') return selector;
	return selector.min ?? 1;
};

const sortedEntries = (entries: ProficiencyTableEntry[]): ProficiencyTableEntry[] =>
	entries.sort((a, b) => proficiencyMinLevel(a.proficiency) - proficiencyMinLevel(b.proficiency));

/**
 * An effect that produces different sub-effects based on the effective proficiency
 * level for the current test.
 */
export class ProficiencyTableEffect extends Effect {
	/** The proficiency level entries, sorted by ascending proficiency level. */
	readonly entries: ProficiencyTableEntry[];

	constructor(props: ProficiencyTableEffectProps) {
		super();
		if ('entries' in props) {
			this.entries = sortedEntries(
				props.entries.map((entry) => ({
					proficiency: resolveProficiencySpec(entry.proficiency),
					effects: entry.effects
				}))
			);
		} else {
			this.entries = sortedEntries(
				Object.entries(props).map(([proficiency, effects]) => ({
					proficiency: resolveProficiencySpec(proficiency as ProficiencyString),
					effects: effects!
				}))
			);
		}
	}
}

/** Creates a proficiency table effect. */
export const proficiencyTable = (props: ProficiencyTableEffectProps): ProficiencyTableEffect =>
	new ProficiencyTableEffect(props);
