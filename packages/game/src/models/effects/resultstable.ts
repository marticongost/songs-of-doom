import {
	resolveResultExpression,
	type ResultSelector,
	type ResultSpec,
	type ResultString
} from '../results';
import { Effect } from './effect';

export type ResultsTableEffectProps =
	| Partial<Record<ResultString, Effect[]>>
	| { entries: ResultsTableEntryProps[] };

export interface ResultsTableEntryProps {
	result: ResultSpec;
	effects: Effect[];
}

export interface ResultsTableEntry {
	readonly result: ResultSelector;
	readonly effects: Effect[];
}

const resultSortKey = (result: ResultSelector): number => {
	if (result === 'CF') return -1;
	if (typeof result === 'number') return result;
	if (Array.isArray(result)) return Math.min(...result.map((r) => (r === 'CF' ? -1 : r)));
	return result.min ?? 0;
};

const sortedEntries = (entries: ResultsTableEntry[]): ResultsTableEntry[] =>
	entries.sort((a, b) => resultSortKey(a.result) - resultSortKey(b.result));

export class ResultsTableEffect extends Effect {
	readonly entries: ResultsTableEntry[];

	constructor(props: ResultsTableEffectProps) {
		super();
		if ('entries' in props) {
			this.entries = sortedEntries(
				props.entries.map((entry) => ({
					result: resolveResultExpression(entry.result),
					effects: entry.effects
				}))
			);
		} else {
			this.entries = sortedEntries(
				Object.entries(props).map(([result, effects]) => ({
					result: resolveResultExpression(result as ResultString),
					effects
				}))
			);
		}
	}
}
