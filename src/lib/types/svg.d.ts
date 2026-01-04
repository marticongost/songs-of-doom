/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '*.svg' {
	import type { SvelteComponentTyped } from 'svelte';
	export default class SVGComponent extends SvelteComponentTyped<
		Record<string, any>,
		Record<string, any>,
		Record<string, any>
	> {}
}
