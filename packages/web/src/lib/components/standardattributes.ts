import { cx } from '@emotion/css';

// Base interface for components that accept standard HTML attributes
export interface StandardAttributeProps {
	id?: string;
	class?: string;
	style?: string;
	[key: string]: unknown;
}

// Accepts any HTML attributes, including data-* and aria-*.
// Preserves Symbol-keyed properties (like Svelte 5 attachments).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const standardAttributes = <T extends Record<string | symbol, any>>(
	props: T,
	baseClass = ''
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string | symbol, any> => {
	const { class: userClass = '', style: userStyle = '', ...rest } = props;
	// Use Object.assign to ensure Symbol-keyed properties (attachments) are preserved
	return Object.assign(
		{
			class: cx(baseClass, userClass),
			style: userStyle
		},
		rest
	);
};
