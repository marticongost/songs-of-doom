/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '*.svx' {
	import type { Component } from 'svelte';
	export const metadata: Record<string, any>;
	const component: Component;
	export default component;
}
