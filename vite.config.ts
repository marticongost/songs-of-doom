import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
