import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index'
		},
		outDir: 'dist',
		emptyDirBeforeWrite: true
	},
	test: {
		expect: {
			requireAssertions: true
		}
	}
});
