export const sigils = ['twist', 'peril', 'portent', 'despair'] as const;

export type CriticalFailure = 'CF'; // Critical failure
export type Sigil = (typeof sigils)[number];
export type NumericResult = 0 | 1 | 2 | 3;
export type Result = NumericResult | Sigil | CriticalFailure;

export type ResultString =
	| CriticalFailure
	| Sigil
	| `${Result}`
	| `${0 | 1 | 2}+`
	| 'sigil'
	| 'failed'
	| '0-1'
	| '0-2'
	| '0-3'
	| '1-2'
	| '1-3'
	| '2-3';

export interface ResultRange {
	min?: NumericResult;
	max?: NumericResult;
}

export type ResultSelector = Result | ResultRange | Array<Result>;

export type ResultSpec = ResultSelector | ResultString;

export const parseResultString = (str: ResultString): ResultSelector => {
	if (str === 'CF') {
		return 'CF';
	} else if (str === 'sigil') {
		return [...sigils];
	} else if (str === 'failed') {
		return ['CF', 0];
	} else if (/^[0123]$/.test(str)) {
		return parseInt(str, 10) as Result;
	} else if (/^[0123]\+$/.test(str)) {
		return { min: parseInt(str[0], 10) as NumericResult };
	} else if (/^[0123]-[0123]$/.test(str)) {
		const [, minStr, maxStr] = str.match(/^(\d)-(\d)$/)!;
		return {
			min: parseInt(minStr, 10) as NumericResult,
			max: parseInt(maxStr, 10) as NumericResult
		};
	} else {
		throw new Error(`Invalid ResultString: ${str}`);
	}
};

export const resolveResultExpression = (expression: ResultSpec): ResultSelector =>
	typeof expression === 'string' ? parseResultString(expression) : expression;

export const isSigil = (result: unknown): result is Sigil =>
	typeof result === 'string' && sigils.includes(result as Sigil);
