import type { CSSObject } from '@emotion/css/create-instance';
import { getSpacing } from './spacing';

/** A utility function to create a flex container with row direction. */
export const row = (gap: string | undefined = undefined): CSSObject => ({
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: gap ? getSpacing(gap) : undefined
});

/** A utility function to create a flex container with column direction. */
export const column = (gap: string | undefined = undefined): CSSObject => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'stretch',
	gap: gap ? getSpacing(gap) : undefined
});

/** A utility function to create a flex container with row direction and wrapping. */
export const grid = (gap: string | undefined = undefined): CSSObject => ({
	display: 'flex',
	flexDirection: 'row',
	flexWrap: 'wrap',
	justifyContent: 'stretch',
	gap: gap ? getSpacing(gap) : undefined
});
