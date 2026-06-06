/**
 * Applies a mutation to a readonly state object and returns the updated readonly state.
 *
 * @param state - The readonly state to mutate.
 * @param change - A function that receives the mutable state and applies changes to it.
 * @returns A new readonly state with the changes applied.
 */
export function mutate<R extends { mutable(): M }, M extends { readonly(): R }>(
	state: R,
	change: (m: M) => void
): R {
	const m = state.mutable();
	change(m);
	return m.readonly();
}
