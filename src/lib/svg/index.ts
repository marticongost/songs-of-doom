// Load all SVGs as raw text
const svgsRecord = import.meta.glob('/src/lib/svg/**/*.svg', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Export as a map with normalized keys
export const svgs = new Map<string, string>();
for (const [key, value] of Object.entries(svgsRecord)) {
	svgs.set(key.replace('/src/lib/svg/', ''), value as string);
}
