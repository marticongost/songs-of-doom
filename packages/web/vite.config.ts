import { resolve } from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

// Vite's dev server root is packages/web/, so its watcher doesn't automatically
// cover packages/game/src/. Without this, import.meta.glob in catalog.ts won't
// detect new data files and requires a manual server restart.
const gamePackageSrc = resolve(import.meta.dirname, '../game/src');
const watchGamePackage: Plugin = {
	name: 'watch-game-package',
	configureServer(server) {
		server.watcher.add(gamePackageSrc);
	}
};

export default defineConfig({
	plugins: [sveltekit(), watchGamePackage],

	// Load .env from workspace root
	envDir: '../..',

	// Exclude workspace packages from pre-bundling so Vite tracks them in the
	// module graph and HMR works when their source files change.
	optimizeDeps: {
		exclude: ['@songsofdoom/game', '@songsofdoom/common']
	},

	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
