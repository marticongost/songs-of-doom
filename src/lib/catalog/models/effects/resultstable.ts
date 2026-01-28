import { resolveResultExpression, type ResultSelector, type ResultString } from '../results';
import { Effect } from './effect';

export interface ResultsTableEffectProps {
	entries: ResultsTableEntryProps[];
}

export interface ResultsTableEntryProps {
	result: ResultSelector | ResultString;
	effects: Effect[];
}

export interface ResultsTableEntry {
	readonly result: ResultSelector;
	readonly effects: Effect[];
}

export class ResultsTableEffect extends Effect {
	readonly entries: ResultsTableEntry[];

	constructor({ entries }: ResultsTableEffectProps) {
		super();
		this.entries = entries.map((entry) => ({
			result: resolveResultExpression(entry.result),
			effects: entry.effects
		}));
	}
}
