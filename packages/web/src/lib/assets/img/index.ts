// Load all images
const imagesRecord = import.meta.glob('/src/lib/assets/img/**/*', {
	import: 'default',
	eager: true
});

// Export as a map with normalized keys
export const images = new Map<string, string>();
for (const [key, value] of Object.entries(imagesRecord)) {
	images.set(key.replace('/src/lib/assets/img', ''), value as string);
}
