export type Result = 0 | 1 | 2 | 3 | 4;

export type ResultString =
	| `${Result}`
	| `${Result}+`
	| '0-1'
	| '0-2'
	| '0-3'
	| '0-4'
	| '1-2'
	| '1-3'
	| '1-4'
	| '2-3'
	| '2-4'
	| '3-4';

export interface ResultRange {
	min?: Result;
	max?: Result;
}

export type ResultSelector = Result | ResultRange;

export const parseResultString = (str: ResultString): ResultSelector => {
	if (/^\d$/.test(str)) {
		return parseInt(str, 10) as Result;
	} else if (/^\d\+$/.test(str)) {
		return { min: parseInt(str[0], 10) as Result };
	} else if (/^(\d)-(\d)$/.test(str)) {
		const [, minStr, maxStr] = str.match(/^(\d)-(\d)$/)!;
		return {
			min: parseInt(minStr, 10) as Result,
			max: parseInt(maxStr, 10) as Result
		};
	} else {
		throw new Error(`Invalid ResultString: ${str}`);
	}
};
