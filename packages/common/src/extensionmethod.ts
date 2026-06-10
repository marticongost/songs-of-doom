/* eslint-disable @typescript-eslint/no-explicit-any */

export type ExtensionMethod<I, O> = ((obj: any, input: I) => O) & {
	implementFor<T>(
		type: abstract new (...args: any[]) => T,
		implementation: (obj: T, input: I) => O
	): void;
};

/**
 * Defines an extension method that can be implemented by any class.
 *
 * This allows extending third party classes with additional functionality without
 * modifying their source code.
 *
 * The implementation receives the original object as its first argument (never as `this`),
 * so arrow functions work correctly and `this` is never relied upon.
 */
export const extensionMethod = <I, O>(): ExtensionMethod<I, O> => {
	const implementations: Map<abstract new (...args: any[]) => any, (obj: any, input: I) => O> =
		new Map();

	const fn = <T>(obj: T, input: I): O => {
		if (typeof obj !== 'object' || obj === null) {
			throw new Error('Extension methods can only be called on objects');
		}
		// Find the first available implementation by recursively walking the prototype
		// chain and checking for registered implementations for each constructor.
		let proto: object | null = obj as object;
		while (proto) {
			const implementation = implementations.get(
				proto.constructor as abstract new (...args: any[]) => any
			);
			if (implementation) {
				return implementation(obj, input);
			}
			proto = Object.getPrototypeOf(proto);
		}
		throw new Error('No implementation found for the given input');
	};

	return Object.assign(fn, {
		implementFor<T>(
			type: abstract new (...args: any[]) => T,
			implementation: (obj: T, input: I) => O
		) {
			implementations.set(type, implementation);
		}
	});
};
