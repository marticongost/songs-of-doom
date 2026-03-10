import { css } from '@emotion/css';
import type { CSSObject } from '@emotion/css/create-instance';
import { mapToRecord } from '../../../../common/src/utils';

export const styles = (rules: Record<string, CSSObject>): Record<string, string> => {
	return mapToRecord(rules, {
		mapEntries: ([key, value]: [string, CSSObject]) => [key, css({ label: key, ...value })]
	});
};

export const mergeRules = (...rules: Array<CSSObject>): CSSObject => {
	const result: CSSObject = {};
	for (const rule of rules) {
		for (const [key, value] of Object.entries(rule)) {
			const existing = result[key as keyof CSSObject];
			if (
				typeof value === 'object' &&
				value !== null &&
				!Array.isArray(value) &&
				typeof existing === 'object' &&
				existing !== null &&
				!Array.isArray(existing)
			) {
				result[key as keyof CSSObject] = { ...existing, ...value } as never;
			} else {
				result[key as keyof CSSObject] = value as never;
			}
		}
	}
	return result;
};
