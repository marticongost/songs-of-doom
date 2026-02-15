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

export class ResultsTableEffect extends Effect {
	readonly entries: ResultsTableEntry[];

	constructor(props: ResultsTableEffectProps) {
		super();
		if ('entries' in props) {
			this.entries = props.entries.map((entry) => ({
				result: resolveResultExpression(entry.result),
				effects: entry.effects
			}));
		} else {
			this.entries = Object.entries(props).map(([result, effects]) => ({
				result: resolveResultExpression(result as ResultString),
				effects
			}));
		}
	}
}
