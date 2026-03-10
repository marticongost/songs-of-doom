import type { CSSObject } from '@emotion/css/create-instance';
import * as fonts from './fonts';
import * as palette from './palette';
import { mergeRules } from './processor';
import * as reset from './reset';
import * as site from './site';

export const globalStyles: CSSObject = mergeRules(reset.allElements, {
	'*, *::before, *::after': {
		boxSizing: 'border-box'
	},
	body: {
		fontFamily: fonts.text,
		backgroundColor: site.pageBackgroundColor,
		color: palette.white
	}
});
