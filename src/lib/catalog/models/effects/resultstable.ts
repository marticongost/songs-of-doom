import { resolveResultExpression, type ResultSelector, type ResultString } from '../results';
import { Effect, type EffectProps } from './effect';

export interface ResultsTableEffectProps extends EffectProps {
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

	constructor({ entries, properties }: ResultsTableEffectProps) {
		super({ properties });
		this.entries = entries.map((entry) => ({
			result: resolveResultExpression(entry.result),
			effects: entry.effects
		}));
	}
}
