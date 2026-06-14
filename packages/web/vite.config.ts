import { sveltekit } from '@sveltejs/kit/vite';
import { execSync } from 'child_process';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Resolve git SHA once at config-load time so it is available for
// vite.define.  Prefer the GAME_VERSION environment variable (set by
// CI / Docker builds).  Fall back to `git rev-parse HEAD` for local
// development.  Throws if neither is available — a version is required
// to report to clients.
let gameVersion: string;
if (process.env.GAME_VERSION) {
	gameVersion = process.env.GAME_VERSION;
} else {
	gameVersion = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
}

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

	// Build-time constants available in server code via globalThis
	define: {
		GAME_VERSION: JSON.stringify(gameVersion)
	},

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
