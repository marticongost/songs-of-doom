// Base interface for components that accept standard HTML attributes
export interface StandardAttributeProps {
	class?: string;
	style?: string;
	[key: string]: unknown;
}

// Accepts any HTML attributes, including data-* and aria-*.
// Svelte's $$props is typed as Record<string, any>, so we refine it here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const standardAttributes = <T extends Record<string, any>>(
	props: T,
	baseClass = ''
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
	const { class: userClass = '', style: userStyle = '', ...rest } = props;
	return {
		class: `${baseClass} ${userClass}`.trim(),
		style: userStyle,
		...rest
	};
};
