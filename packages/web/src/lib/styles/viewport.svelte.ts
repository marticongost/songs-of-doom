import type { ViewportSizeRange } from './viewport';

/** Returns a reactive boolean that tracks a viewport query. */
export function useViewport(query: ViewportSizeRange) {
	const mediaString = query.media();
	let matches = $state(false);

	$effect(() => {
		const mq = window.matchMedia(mediaString);
		matches = mq.matches;
		const handler = (e: MediaQueryListEvent) => {
			matches = e.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	return {
		get matches() {
			return matches;
		}
	};
}
