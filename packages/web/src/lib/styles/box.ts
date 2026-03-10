import type { CSSObject } from '@emotion/css/create-instance';
import { getSpacing } from './spacing';

/** A utility function to apply horizontal padding. */
export const hpadding = (value: string): CSSObject => ({
	paddingLeft: getSpacing(value),
	paddingRight: getSpacing(value)
});

/** A utility function to apply vertical padding */
export const vpadding = (value: string): CSSObject => ({
	paddingTop: getSpacing(value),
	paddingBottom: getSpacing(value)
});

/** A utility function to apply horizontal margin. */
export const hmargin = (value: string): CSSObject => ({
	marginLeft: getSpacing(value),
	marginRight: getSpacing(value)
});

/** A utility function to apply vertical margin */
export const vmargin = (value: string): CSSObject => ({
	marginTop: getSpacing(value),
	marginBottom: getSpacing(value)
});
