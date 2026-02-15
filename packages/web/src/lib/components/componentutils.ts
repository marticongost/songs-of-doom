export type ComponentWithProps<P> = {
	new (options: {
		target: Element;
		props?: P; // <-- must be optional for Svelte compatibility
	}): {
		$set(props: Partial<P>): void;
		$destroy(): void;
	};
};
