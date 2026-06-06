import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index'
		},
		outDir: 'dist',
		emptyOutDir: true
	},
	test: {
		expect: {
			requireAssertions: true
		}
	}
});
