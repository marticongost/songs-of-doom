export type CriticalFailure = 'CF'; // Critical failure
export type NumericResult = 0 | 1 | 2 | 3;
export type Result = NumericResult | CriticalFailure;

export type ResultString =
	| CriticalFailure
	| `${Result}`
	| `${Result}+`
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

export type ResultSelector = Result | ResultRange;

export const parseResultString = (str: ResultString): ResultSelector => {
	if (str === 'CF') {
		return 'CF';
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

export const resolveResultExpression = (
	expression: ResultSelector | ResultString
): ResultSelector => (typeof expression === 'string' ? parseResultString(expression) : expression);
