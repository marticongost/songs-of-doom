export type ExtensionMethod<I, O> = ((obj: any, input: I) => O) & {
	implementFor<T>(
		type: abstract new (...args: any[]) => T,
		implementation: (this: T, input: I) => O
	): void;
};

/**
 * Defines an extension method that can be implemented by any class.
 *
 * This allows extending third party classes with additional functionality without
 * modifying their source code.
 *
 */
export const extensionMethod = <I, O>(): ExtensionMethod<I, O> => {
	const implementations: Map<Function, (this: any, input: I) => O> = new Map();

	const fn = <T>(obj: T, input: I): O => {
		if (typeof obj !== 'object' || obj === null) {
			throw new Error('Extension methods can only be called on objects');
		}
		// Find the first available implementation by recursively walking the prototype
		// chain and checking for registered implementations for each constructor.
		let proto: object | null = obj as object;
		while (proto) {
			const implementation = implementations.get(proto.constructor);
			if (implementation) {
				return implementation.call(proto, input);
			}
			proto = Object.getPrototypeOf(proto);
		}
		throw new Error('No implementation found for the given input');
	};

	return Object.assign(fn, {
		implementFor<T>(
			type: abstract new (...args: any[]) => T,
			implementation: (this: T, input: I) => O
		) {
			implementations.set(type, implementation);
		}
	});
};
