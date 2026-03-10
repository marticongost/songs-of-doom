export const spacingSpecs = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export type SpacingSpec = (typeof spacingSpecs)[number];

export const spacing: Record<SpacingSpec, string> = {
	xs: '0.25em',
	sm: '0.5em',
	md: '1em',
	lg: '2em',
	xl: '4em'
};

export const isSpacingSpec = (value: string): value is SpacingSpec => {
	return spacingSpecs.includes(value as SpacingSpec);
};

export const getSpacing = (value: SpacingSpec | string): string =>
	isSpacingSpec(value) ? spacing[value] : value;
