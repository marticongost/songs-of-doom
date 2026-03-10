import type { CSSObject } from '@emotion/css/create-instance';

export const spacing: CSSObject = {
	margin: 0,
	padding: 0
};

export const list: CSSObject = {
	listStyleType: 'none',
	...spacing
};

export const link: CSSObject = {
	textDecoration: 'none',
	color: 'inherit',
	'&:hover': {
		textDecoration: 'none'
	}
};

export const button: CSSObject = {
	background: 'none',
	border: 'none',
	padding: 0,
	font: 'inherit',
	color: 'inherit',
	cursor: 'pointer'
};

export const allElements: CSSObject = {
	body: {
		padding: 0,
		margin: 0
	},
	a: link,
	'ul, ol': list,
	li: spacing,
	'h1, h2, h3, h4, h5, h6, p': spacing,
	button
};
